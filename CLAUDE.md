# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

This is a static, zero-build vanilla HTML/CSS/JS app. There is no `package.json`, no bundler, no test suite. To run it, open `index.html` directly in a browser, or serve the directory (e.g. `python3 -m http.server` from the repo root) and visit the page. There is nothing to build, lint, or test via tooling.

The only external runtime dependency is `html2canvas` 1.4.1, loaded from cdnjs in `index.html`.

## Architecture

The whole app is one page (`index.html`) wired to one script (`assets/js/script.js`) and one stylesheet (`assets/css/index.css`). The big-picture pieces that aren't obvious from a single file:

**Module layout (`assets/js/script.js`).** The script defines a handful of class-based managers and instantiates each as a module-scope singleton at the bottom of the file: `notificationManager`, `dataManager`, `badgeMultiSelect`, `formManager`, `tableManager`, `imageGenerator`, `modalManager`. Inline `onclick=` handlers in `index.html` (e.g. `submitForm()`, `editRow(i)`, `generateImage()`, `toggleBadgeDropdown()`) call thin global wrappers near the bottom of the script that delegate into those singletons. When adding a new HTML action, follow the same pattern: method on the manager + global wrapper function.

**State model.** All entries live in memory only — `SpotRecognitionData.formDataArray` — and are lost on reload. There is no localStorage, no backend, no persistence. Uploaded images are read with `FileReader.readAsDataURL` and stored as base64 strings on each entry's `leftImage` field. Badges are stored on each entry as `selectedBadges: [{ value, image, label, imagePath }]`.

**Edit vs. add mode.** `dataManager.editingIndex` (`-1` when adding) is the single source of truth for which mode the form is in. `FormManager.submitForm` branches on `isEditMode()` and, in edit mode, falls back to the previously stored base64 image when the file input is empty — required validation is also relaxed in edit mode for that reason. `cancelEdit()` and `form.reset()` (overridden in `initializeForm`) must both clear `editingIndex` and reset the badge multiselect; preserve that invariant if you change reset behavior.

**Image generation.** `ImageGenerator.generateImage` does not draw on a canvas directly. It (1) populates the hidden `<section class="email-image-container">` DOM tree at the bottom of `index.html` (`#date_section` and `#mediaContainer`) from the in-memory entries, (2) runs `html2canvas` against `#email_image` to rasterize that subtree, and (3) triggers a download via a synthesized `<a>` element. The progress bar steps in `processImageGeneration` are cosmetic delays, not real progress signals — html2canvas is synchronous from the caller's POV. If you change the exported layout, edit the `.email-image` / `.wall-of-fame` / `.media-object` styles and the DOM built by `createMediaObject`; both must stay in sync.

**Badges are defined in HTML, not JS.** The seven available badges are hard-coded as `.badge-option` divs inside `#badge_dropdown` in `index.html`, each with `data-value` and `data-image` attributes plus a matching PNG in `assets/images/`. To add or rename a badge, update the HTML option, drop the image into `assets/images/`, and ensure the filename matches `data-image`. `BadgeMultiSelectManager` reads everything off the DOM and does not need to be edited.
