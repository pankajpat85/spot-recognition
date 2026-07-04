# Spot Recognition — Technical Documentation

## Overview

Spot Recognition is a multi-tenant SaaS platform for employee recognition. It lets managers and peers nominate teammates with custom achievement badges, generate a branded "Wall of Fame" image, and email it to recipients — all from a web UI.

The repository contains two distinct implementations:

| Layer | Location | Status |
|---|---|---|
| Legacy static tool | `docs/` | Feature-complete, zero-dependency prototype |
| Full-stack SaaS | `packages/frontend` + `packages/backend` | Current production implementation |

---

## Repository Layout

```
spot-recognition/
├── docs/                          # Legacy static app (HTML/CSS/JS)
│   ├── index.html
│   └── assets/
│       ├── css/index.css
│       ├── js/script.js
│       └── images/               # Badge PNGs + background
├── packages/
│   ├── backend/                   # Node.js / Express API
│   │   ├── src/
│   │   │   ├── config/            # env, database, passport
│   │   │   ├── middleware/        # auth, rateLimiter, planGate, upload, errorHandler
│   │   │   ├── modules/           # auth, users, spots, org, backgrounds, badges, email
│   │   │   └── utils/             # jwt, bcrypt, crypto, csvParser, slugify
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── seed.ts
│   │       └── migrations/
│   └── frontend/                  # React / Vite SPA
│       └── src/
│           ├── components/        # layout, spots
│           ├── hooks/             # useAuth, useImageGenerator, useDebounce
│           ├── pages/             # public, auth, app
│           ├── routes/            # PrivateRoute, PublicRoute
│           └── store/             # RTK Query APIs + authSlice
├── docker-compose.yml             # Production Docker Compose
├── docker-compose.dev.yml         # Dev PostgreSQL only
├── package.json                   # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Tech Stack

### Backend (`packages/backend`)

| Concern | Choice |
|---|---|
| Runtime | Node.js + TypeScript (tsx in dev, tsc for prod) |
| Framework | Express 4 |
| ORM | Prisma 5 (PostgreSQL) |
| Auth | JWT (access + refresh tokens), bcryptjs, Passport (Google OAuth, local) |
| Email | Nodemailer (per-org SMTP or platform SMTP fallback) |
| File uploads | Multer (disk storage → `uploads/`) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Encryption | Node `crypto` AES-256-CBC for stored SMTP passwords |

### Frontend (`packages/frontend`)

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 + Radix UI primitives |
| State / Data | Redux Toolkit + RTK Query |
| Forms | react-hook-form + Zod resolver |
| Animation | Framer Motion |
| Image generation | html2canvas 1.4.1 |
| Routing | React Router 6 |

### Infrastructure

| Concern | Choice |
|---|---|
| Database | PostgreSQL 16 |
| Containers | Docker + Docker Compose |
| Package manager | pnpm (workspaces) |

---

## Database Schema

```
Org (1) ──── (*) User
Org (1) ──── (*) SpotRecognition
Org (1) ──── (*) SpotBackground

SpotRecognition (1) ──── (*) SpotWinner
SpotRecognition (1) ──── (*) SpotSender
SpotRecognition (1) ──── (*) SpotBadge
SpotRecognition (*) ──── (0..1) SpotBackground

User (1) ──── (*) SpotRecognition [createdBy]
User (1) ──── (*) SpotWinner
User (1) ──── (*) SpotSender

PasswordResetToken  (standalone, keyed by userId)
RefreshToken        (standalone, keyed by userId)
```

### Key models

**`Org`** — the top-level tenant.
- `plan: OrgPlan` — `FREE | PRO | ENTERPRISE`
- `spotsUsedThisMonth` — tracked for FREE plan enforcement (10 spots/month limit)
- `smtpConfig: Json` — AES-encrypted SMTP credentials stored as JSON
- `fromEmail` / `fromName` — custom "From" header for outbound recognition emails

**`User`** — belongs to exactly one Org.
- `isAdmin` — admin flag; controls access to org settings and user management
- `isAdSync` — marks users imported via CSV (directory sync)
- `googleId` / `microsoftId` / `azureAdId` — SSO identifiers
- Soft-deleted via `deletedAt`

**`SpotRecognition`** — one recognition record. May have multiple winners and senders.
- `imageUrl` — path to the generated Wall of Fame PNG on disk
- `sentAt` — set when the email is dispatched; `null` means not yet sent

**`SpotWinner` / `SpotSender`** — join tables linking a spot to users.
- Support both linked users (by `userId`) and free-text participants (`freeTextName` / `freeTextEmail`) so you can recognise people not yet in the system.

**`SpotBackground`** — org-scoped background images for the Wall of Fame card.

**`RefreshToken`** — stored server-side; revoked on use (rotation) and on logout.

---

## Authentication

### Flow

1. `POST /api/auth/register` — creates Org + first admin User in one transaction; provisions a default background; returns `{ accessToken, refreshToken, user, org }`.
2. `POST /api/auth/login` — verifies credentials via Passport local strategy; returns the same shape.
3. `POST /api/auth/refresh` — rotates the refresh token (old is revoked) and issues new access + refresh tokens.
4. `POST /api/auth/logout` — revokes the refresh token.
5. `GET /api/auth/google` → Google OAuth callback (`GET /api/auth/google/callback`).

### Token structure

- **Access token** — short-lived JWT (default ~15 min not explicitly set, adjust in `jwt.ts`). Payload: `{ userId, orgId, isAdmin, orgPlan }`.
- **Refresh token** — 7-day JWT, persisted in `RefreshToken` table for revocation support.

### Middleware

- `authenticate` (`src/middleware/auth.ts`) — extracts Bearer token from `Authorization` header, verifies it, and sets `req.user`.
- `requireAdmin` — gates admin-only routes.
- `planGate(required: OrgPlan)` — compares `req.user.orgPlan` against the required plan tier; returns `403 PLAN_GATE` if below.

### Password reset

`POST /api/auth/forgot-password` generates a one-time token (32 random hex bytes, 1-hour TTL) stored in `PasswordResetToken`, then emails a reset link. `POST /api/auth/reset-password` validates and marks the token `usedAt`.

---

## API Reference

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register org + admin user |
| POST | `/login` | — | Email + password login |
| POST | `/refresh` | — | Rotate refresh token |
| POST | `/logout` | — | Revoke refresh token |
| POST | `/forgot-password` | — | Send password reset email |
| POST | `/reset-password` | — | Consume reset token, set new password |
| GET | `/me` | ✓ | Return current user |
| GET | `/google` | — | Initiate Google OAuth |
| GET | `/google/callback` | — | Google OAuth callback |

### Spots — `/api/spots`

| Method | Path | Auth | Admin | Description |
|---|---|---|---|---|
| GET | `/` | ✓ | — | List spots (paginated, filterable) |
| POST | `/` | ✓ | — | Create spot |
| GET | `/:id` | ✓ | — | Get single spot |
| DELETE | `/:id` | ✓ | ✓ | Soft-delete spot |
| POST | `/:id/image` | ✓ | — | Upload generated Wall of Fame image |
| POST | `/:id/send` | ✓ | — | Send recognition email |
| GET | `/stats` | ✓ | — | Dashboard stats |

Query parameters for list: `page`, `limit`, `search`, `badgeValue`, `from`, `to`.

### Users — `/api/users`

| Method | Path | Auth | Admin | Description |
|---|---|---|---|---|
| GET | `/` | ✓ | — | List users (search, paginate) |
| POST | `/` | ✓ | ✓ | Create user |
| GET | `/:id` | ✓ | — | Get user |
| PATCH | `/:id` | ✓ | ✓ | Update user |
| DELETE | `/:id` | ✓ | ✓ | Soft-delete user |
| POST | `/import/csv` | ✓ | ✓ | Bulk import via CSV |
| GET | `/search` | ✓ | — | Autocomplete search |

### Org — `/api/org`

| Method | Path | Auth | Admin | Description |
|---|---|---|---|---|
| GET | `/` | ✓ | — | Get org (SMTP config redacted) |
| PATCH | `/` | ✓ | ✓ | Update name, fromEmail, fromName, logo |
| POST | `/smtp` | ✓ | ✓ | Save SMTP config (encrypted at rest) |
| POST | `/smtp/test` | ✓ | ✓ | Send test email via org SMTP |

### Backgrounds — `/api/backgrounds`

| Method | Path | Auth | Admin | Description |
|---|---|---|---|---|
| GET | `/` | ✓ | — | List org backgrounds |
| POST | `/` | ✓ | ✓ | Upload custom background |
| DELETE | `/:id` | ✓ | ✓ | Delete background (not default) |

### Badges — `/api/badges`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List available badges (static assets) |

---

## Spot Creation Flow (Full-Stack)

```
Frontend                               Backend
   │                                      │
   │  POST /api/spots                     │
   │  { winners, senders, badges,         │
   │    description, startDate,           │
   │    endDate, backgroundId }  ─────────▶  createSpot()
   │                                      │   ├─ Check FREE plan limit
   │                                      │   ├─ prisma.$transaction
   │                                      │   │   ├─ create SpotRecognition
   │                                      │   │   ├─ create SpotWinner(s)
   │                                      │   │   ├─ create SpotSender(s)
   │                                      │   │   └─ create SpotBadge(s)
   │  ◀─── { spot }  ────────────────────  │
   │                                      │
   │  [html2canvas renders WallOfFame]    │
   │                                      │
   │  POST /api/spots/:id/image           │
   │  FormData { image: PNG blob } ───────▶  saveSpotImage()
   │                                      │   └─ multer → uploads/
   │  ◀─── 200 OK  ──────────────────────  │
   │                                      │
   │  POST /api/spots/:id/send   ──────────▶  sendSpot()
   │                                      │   ├─ read PNG from disk
   │                                      │   ├─ render HTML email template
   │                                      │   ├─ sendEmail() (org or platform SMTP)
   │                                      │   └─ update sentAt
   │  ◀─── 200 OK  ──────────────────────  │
```

---

## Email System

Two transport layers, selected per-send:

1. **Org SMTP** — credentials stored encrypted in `Org.smtpConfig` (AES-256-CBC via `src/utils/crypto.ts`). Decrypted at send time.
2. **Platform SMTP** — configured via `PLATFORM_SMTP_*` env vars; used when the org has no SMTP configured.

The email contains an inline HTML template (`src/modules/email/templates/spot-recognition.ts`) and the Wall of Fame PNG is attached as a CID-embedded inline image.

---

## Wall of Fame Image Generation

Both the legacy tool and the SaaS frontend use **html2canvas** to rasterize an off-screen DOM element into a PNG.

### SaaS frontend flow

1. `SpotFormPage` renders `<WallOfFame ref={wallOfFameRef} .../>` — a hidden `div` positioned off-screen.
2. On submit, `useImageGenerator.generate()` calls `html2canvas(wallOfFameRef.current, { useCORS: true, scale: 2 })`.
3. The resulting canvas is converted to a `Blob` and uploaded via `POST /api/spots/:id/image`.
4. The backend stores it under `uploads/` and saves the path in `SpotRecognition.imageUrl`.

### Legacy static tool flow

1. Entries are built in memory (`SpotRecognitionData.formDataArray`).
2. `ImageGenerator.createMediaObjects()` populates a hidden `<section class="email-image-container">` in the page DOM.
3. `html2canvas` captures `#email_image`, producing a canvas.
4. A preview modal shows the result; clicking "Save Image" calls `canvas.toDataURL` and synthesises a download link.

---

## Plan Gating

| Feature | FREE | PRO | ENTERPRISE |
|---|---|---|---|
| Spots per month | 10 | Unlimited | Unlimited |
| Custom SMTP | — | ✓ | ✓ |
| Custom backgrounds | — | ✓ | ✓ |
| User management | ✓ | ✓ | ✓ |

`planGate` middleware compares numeric tier values (`FREE=0, PRO=1, ENTERPRISE=2`) and returns `403 { code: 'PLAN_GATE', requiredPlan, currentPlan }` on violation. Monthly spot count is reset at the start of each calendar month (`planResetAt`).

---

## Rate Limiting

Two limiters in `src/middleware/rateLimiter.ts`:

- `apiRateLimiter` — applied to all `/api/*` routes (general limit)
- `authRateLimiter` — applied to login / register / forgot-password / reset-password (tighter limit to prevent brute-force)

---

## File Storage

Multer is configured in `src/middleware/upload.ts` with disk storage. Files land in `uploads/` at the project root (mounted as a Docker volume `uploads` in production). The backend serves them at `/uploads/*` with `Access-Control-Allow-Origin: *` so html2canvas can load them cross-origin.

Badge assets and the default background are bundled into `src/assets/` and served at `/static/*`.

---

## Frontend Architecture

### Routing

```
/                         → HomePage (public)
/about                    → AboutPage
/contact                  → ContactPage
/privacy                  → PrivacyPage

/auth/login               → LoginPage       (redirects if logged in)
/auth/register            → RegisterPage
/auth/forgot-password     → ForgotPasswordPage

/app/dashboard            → DashboardPage   (requires auth)
/app/spots/new            → SpotFormPage
/app/history              → HistoryPage
/app/users                → UsersPage
/app/settings             → OrgSettingsPage
```

`PrivateRoute` reads Redux `authSlice` state; redirects to `/auth/login` if no user. `PublicRoute` redirects to `/app/dashboard` if already logged in.

### State management

`authSlice` holds `{ user, org, accessToken }`. RTK Query handles all API interactions with automatic cache invalidation:

- `authApi` — login, register, refresh, me
- `spotsApi` — CRUD + image upload + send + stats
- `usersApi` — CRUD + CSV import + autocomplete search
- `orgApi` — get, update, SMTP management
- `backgroundsApi` — list, create, delete
- `badgesApi` — list

### Key components

- `UserAutocomplete` — debounced search against `/api/users/search`; supports both linked users and free-text (name + email) for external participants.
- `BadgeMultiSelect` — multi-select badge picker driven by the `/api/badges` response.
- `BackgroundPicker` — thumbnail grid of org backgrounds.
- `WallOfFame` — the hidden DOM element used as the html2canvas target; receives all spot data as props.

---

## Legacy Static Tool (`docs/`)

The `docs/` folder is a self-contained, zero-build tool. It has no backend, no persistence, and no auth.

### Manager singletons (instantiated at module scope in `script.js`)

| Singleton | Responsibility |
|---|---|
| `notificationManager` | Toast notifications |
| `dataManager` (SpotRecognitionData) | In-memory array of entries + edit mode state |
| `badgeMultiSelect` (BadgeMultiSelectManager) | Badge dropdown state, reads badge config from DOM |
| `formManager` (FormManager) | Form validation, submit, edit populate/clear |
| `tableManager` (TableManager) | Render entries table, CRUD row actions |
| `imageGenerator` (ImageGenerator) | Build hidden DOM, run html2canvas, show/download |
| `modalManager` (ModalManager) | Photo preview modal + Wall of Fame preview modal |

### Data lifecycle

1. User fills form → `submitForm()` → `FileReader.readAsDataURL` → entry pushed to `formDataArray` as `{ leftImage, spotWinnerName, description, spotSenderName, selectedBadges }`.
2. Table re-renders from the in-memory array.
3. "Generate Image" → date range validated → hidden DOM populated → html2canvas → preview modal.
4. "Save Image" → `canvas.toDataURL` → synthetic `<a download>` click.

All data is lost on page reload. There is no localStorage or any persistence layer.

### Badges

Badges are defined exclusively in `docs/index.html` as `.badge-option` divs with `data-value` and `data-image` attributes. `BadgeMultiSelectManager` reads from the DOM and does not have a hard-coded list. To add a badge: add a `.badge-option` div + place the PNG in `docs/assets/images/`.

---

## Development Setup

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9
- Docker + Docker Compose (for the database)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev database (PostgreSQL on port 5433)
docker compose -f docker-compose.dev.yml up -d

# 3. Copy and configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY at minimum

# 4. Run database migrations and seed
pnpm db:migrate
pnpm db:seed

# 5. Start both dev servers (backend :3001, frontend :5173)
pnpm dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Min 16 chars; signs access tokens |
| `JWT_REFRESH_SECRET` | ✓ | Min 16 chars; signs refresh tokens |
| `ENCRYPTION_KEY` | ✓ | Exactly 32 chars; AES key for SMTP passwords |
| `PORT` | — | Backend port (default 3001) |
| `FRONTEND_URL` | — | CORS origin (default http://localhost:5173) |
| `NODE_ENV` | — | development / production / test |
| `PLATFORM_SMTP_HOST` | — | System SMTP host |
| `PLATFORM_SMTP_PORT` | — | System SMTP port (default 587) |
| `PLATFORM_SMTP_SECURE` | — | `true` for TLS (default false) |
| `PLATFORM_SMTP_USER` | — | System SMTP username |
| `PLATFORM_SMTP_PASS` | — | System SMTP password |
| `PLATFORM_FROM_EMAIL` | — | System "from" address |
| `PLATFORM_FROM_NAME` | — | System "from" display name |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | — | Google OAuth callback (default http://localhost:3001/api/auth/google/callback) |
| `MICROSOFT_CLIENT_ID` | — | Microsoft OAuth client ID |
| `MICROSOFT_CLIENT_SECRET` | — | Microsoft OAuth client secret |
| `MICROSOFT_TENANT_ID` | — | Azure AD tenant (default `common`) |

---

## Production Deployment (Docker Compose)

```bash
# Build and start all services
docker compose up -d --build

# Run migrations on first deploy (or after schema changes)
docker compose exec backend node -e "require('child_process').execSync('prisma migrate deploy', {stdio:'inherit'})"
```

Services:

| Service | Port | Description |
|---|---|---|
| `postgres` | 5432 (internal) | PostgreSQL 16; health-checked |
| `backend` | 3001 | Express API |
| `frontend` | 80 | Nginx serving the Vite build |

Volumes:
- `pgdata` — persistent database data
- `uploads` — uploaded images; shared between backend restarts

The frontend Nginx config (`packages/frontend/nginx.conf`) proxies `/api/*` to the backend container and serves the SPA from the build output.

---

## Adding / Customising Badges

### SaaS version

Badges are served from `packages/backend/src/assets/badges/` via `/static/badges/*`. The `GET /api/badges` endpoint returns the list. To add a badge:

1. Drop the PNG into `packages/backend/src/assets/badges/`.
2. Update `packages/backend/src/modules/badges/badges.routes.ts` to include the new value.

### Legacy tool

1. Add a PNG to `docs/assets/images/`.
2. Add a `.badge-option` div inside `#badge_dropdown` in `docs/index.html` with matching `data-value` and `data-image` attributes.

---

## CSV User Import

`POST /api/users/import/csv` (admin only) accepts a CSV file. Expected columns: `name`, `email`. The importer:

- Creates new users if the email is not found.
- Updates the `name` of existing active users.
- Skips rows that have no name or email, or where the user has been soft-deleted.
- Sets `isAdSync: true` on imported rows to indicate directory-synced provenance.

Returns `{ created, updated, skipped, errors, total }`.
