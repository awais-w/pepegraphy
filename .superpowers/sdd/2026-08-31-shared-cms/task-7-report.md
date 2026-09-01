# Task 7 Report: Hero and Gallery Media Managers

## Delivered

- Added a shared image uploader with browser-side image type and 10 MB size validation, local previews, upload state, and surfaced upload/metadata errors.
- Added accessible hero management for image upload/replacement, alternative text, captions, visibility, explicit move-up/move-down ordering, empty states, and confirmed deletion.
- Added gallery category CRUD with derived slug preview, duplicate-name protection, visibility, ordering, and confirmed deletion; added selected-category photo upload/replacement, alternative text, visibility, ordering, and empty states.
- Mounted both managers in the existing protected admin shell and preserved the authentication test's content-child isolation seam.
- Used semantic `role="dialog"`/`aria-modal` confirmation markup and text-labeled controls throughout.

## Review fixes

- Preserved hidden hero slides, categories, and photos in the authenticated CMS content model, while filtering hidden records (and photos whose category is hidden) when building public content.
- Preserved explicitly empty remote media collections after deletion; bundled media remains the fallback only when no CMS collection was loaded.
- Made delete confirmation keyboard-modal: Cancel receives initial focus, Tab/Shift+Tab remain within the dialog, Escape cancels, and focus returns to the triggering control when it remains available.
- Assigned new categories the next deterministic position from the ordered category list, persisted that `sort_order`, and ordered the CMS category query by `sort_order`.

## TDD evidence

1. Added focused tests for hero upload metadata, category slug derivation and ordering, selected-category photo association, keyboard-modal delete confirmation, hidden admin media preservation, public visibility filtering, empty remote collections, and ordered category queries.
2. Ran `npm test -- src/admin/MediaManager.test.jsx` before implementation; it failed because `HeroManager` and `GalleryManager` did not exist.
3. Implemented the smallest manager/uploader flow and reran the focused tests successfully.

## Verification

- `npm test -- src/lib/contentModel.test.js src/lib/publicContent.test.js src/lib/contentRepository.test.js src/admin/MediaManager.test.jsx` — 4 files and 22 tests passed.
- `npm test` — 9 files and 38 tests passed.
- `npm run lint` — passed.
- `npm run build` — passed; Vite retained its advisory about a JavaScript chunk exceeding 500 kB after minification.
- `git diff --check` — passed before commit.

## Commit

- `acd0fd6 feat: add hero and gallery media managers`
- Review fixes committed with this report.

## Note

Vite retains its advisory that the production JavaScript chunk exceeds 500 kB after minification; the build succeeds. Vitest also prints the existing Node `--localstorage-file` warning while tests pass.
