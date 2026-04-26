import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AuthUser {
  id: string
  name: string
  email: string
  photoUrl: string | null
  isAdmin: boolean
  orgId: string
}

interface AuthOrg {
  id: string
  name: string
  slug: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  org: AuthOrg | null
}

const TOKEN_KEY = 'sr_token'
const REFRESH_KEY = 'sr_refresh'

function loadFromStorage(): Partial<AuthState> {
  try {
    return {
      accessToken: localStorage.getItem(TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_KEY),
    }
  } catch {
    return {}
  }
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  org: null,
  ...loadFromStorage(),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthUser; org: AuthOrg }>) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.org = action.payload.org
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken)
      localStorage.setItem(REFRESH_KEY, action.payload.refreshToken)
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.org = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.accessToken
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectCurrentOrg = (state: { auth: AuthState }) => state.auth.org
