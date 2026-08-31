# Shared CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed browser admin at `/admin` that edits public site text, hero slides, gallery categories, and gallery photos for all visitors.

**Architecture:** Keep the existing bundled content as an immediate fallback and introduce a normalized content service that reads/writes Supabase. The public app consumes the service state; the admin route uses Supabase Auth and the same mutations. Supabase Postgres stores metadata and Storage stores images, with RLS allowing public reads and authenticated writes.

**Tech Stack:** React 19, Vite, JavaScript modules matching the existing app, Supabase JS client, React Router only if needed (prefer pathname routing to avoid a new dependency), CSS tokens/classes, ESLint, Vite build.

**Spec:** `docs/superpowers/specs/2026-08-31-shared-cms-design.md`

## Global Constraints

- Use Supabase Auth, Postgres, Storage, and Row Level Security.
- No service-role key may ship to the browser.
- Existing bundled content and images remain a renderable public fallback.
- Admin actions require visible labels, keyboard access, focus states, status feedback, and confirmation for destructive actions.
- Use explicit move controls for ordering; do not make drag-and-drop the only interaction.
- Store images in Supabase Storage and metadata/order in Postgres.
- Run `npm run lint` and `npm run build` before completion.

---

### Task 1: Add test tooling and content normalization primitives

**Files:**
- Modify: `package.json`
- Create: `src/lib/contentModel.js`
- Create: `src/lib/contentModel.test.js`

**Interfaces:**
- Produces `defaultContent`, `normalizeContent(remoteRows)`, `mergeContent(fallback, remote)`, `slugify(value)`, and `moveItem(items, index, direction)`.

- [ ] **Step 1: Add a minimal Vitest test command and failing tests**

Add `vitest` to devDependencies and add `"test": "vitest run"` to scripts. Test that `normalizeContent` sorts visible hero slides and photos by `sort_order`, `slugify('New Portraits')` returns `new-portraits`, and `moveItem(['a','b','c'], 1, 'up')` returns `['b','a','c']`.

- [ ] **Step 2: Run the tests and verify the intended failure**

Run `npm test -- src/lib/contentModel.test.js`. Expected: FAIL because `src/lib/contentModel.js` does not yet export the requested functions.

- [ ] **Step 3: Implement the content model**

Create `defaultContent` from the existing text/gallery defaults, define stable section keys and field names, normalize nullable remote rows, filter hidden rows, sort by `sort_order`, and make `moveItem` return a new array without mutating its input.

- [ ] **Step 4: Run the tests and verify they pass**

Run `npm test -- src/lib/contentModel.test.js`. Expected: PASS.

- [ ] **Step 5: Commit**

Run `git add package.json package-lock.json src/lib/contentModel.js src/lib/contentModel.test.js && git commit -m "feat: add normalized cms content model"`.

### Task 2: Add Supabase schema, seed data, and browser client

**Files:**
- Create: `supabase/migrations/001_cms.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabaseClient.js`
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces `supabaseClient`, `isSupabaseConfigured`, and SQL setup that creates `site_content`, `hero_slides`, `gallery_categories`, `gallery_photos`, the `site-media` bucket, indexes, and RLS policies.

- [ ] **Step 1: Write a schema verification script/test**

Create `src/lib/supabaseConfig.test.js` asserting that the client is disabled when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing and that the configured path exports a client-shaped object. This test defines the browser-safe configuration boundary without requiring a network connection.

- [ ] **Step 2: Run the test and verify it fails**

Run `npm test -- src/lib/supabaseConfig.test.js`. Expected: FAIL because `src/lib/supabaseClient.js` does not exist.

- [ ] **Step 3: Implement schema and client**

Install `@supabase/supabase-js`. In SQL, use UUID primary keys, timestamps, foreign-key cascade for photos when categories are deleted, public `SELECT` policies limited to visible rows, authenticated write policies, and Storage policies matching the `site-media` bucket. Seed current categories, gallery metadata, and initial hero/content rows using the current bundled values. In the client, create the client only when both env vars are present and export a boolean configuration flag.

- [ ] **Step 4: Document setup**

Update `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Add README steps for creating a Supabase project, running the migration and seed SQL, creating the first Auth user, copying env vars, and starting the app.

- [ ] **Step 5: Run tests and commit**

Run `npm test -- src/lib/supabaseConfig.test.js`. Expected: PASS. Commit with `git add supabase src/lib/supabaseClient.js src/lib/supabaseConfig.test.js .env.example README.md package.json package-lock.json && git commit -m "feat: add supabase cms foundation"`.

### Task 3: Implement repository operations and public content provider

**Files:**
- Create: `src/lib/contentRepository.js`
- Create: `src/context/ContentContext.jsx`
- Create: `src/lib/contentRepository.test.js`
- Modify: `src/main.jsx`

**Interfaces:**
- Produces repository methods `loadContent()`, `saveSection(key, content)`, `uploadImage(file, folder)`, `createHeroSlide(input)`, `updateHeroSlide(id, patch)`, `deleteHeroSlide(id)`, `createCategory(name)`, `updateCategory(id, patch)`, `deleteCategory(id)`, `createPhoto(input)`, `updatePhoto(id, patch)`, and `deletePhoto(id)`.
- Produces `useContent()` with `{ content, loading, error, refresh, saveSection, ... }`.

- [ ] **Step 1: Write failing repository tests**

Test `mergeContent` is used when the Supabase client is not configured, `uploadImage` rejects non-image files and files larger than 10 MB before a network call, and `moveItem` changes the requested ordering without mutation.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test -- src/lib/contentRepository.test.js`. Expected: FAIL because repository/context files are missing.

- [ ] **Step 3: Implement repository and provider**

Wrap Supabase queries in small methods; upload to `site-media/{folder}/{uuid}-{safe-name}`, obtain the public URL, and clean up an uploaded file if metadata insertion fails. `loadContent` fetches all four table groups in parallel, normalizes them, and falls back to bundled defaults on configuration/network failure. `ContentProvider` loads once, exposes mutation methods that refresh state after successful writes, and keeps an error for admin feedback without blocking public rendering.

- [ ] **Step 4: Wire the provider into the app**

Wrap `App` in `ContentProvider` from `src/main.jsx`. Do not change the public route behavior yet beyond making content available through context.

- [ ] **Step 5: Run tests and commit**

Run `npm test -- src/lib/contentRepository.test.js` and `npm run lint`. Expected: PASS with no lint errors. Commit `git add src/lib/contentRepository.js src/context/ContentContext.jsx src/lib/contentRepository.test.js src/main.jsx && git commit -m "feat: add cms content repository"`.

### Task 4: Migrate public sections to remote content with fallback

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/About.jsx`
- Modify: `src/components/Portfolio.jsx`
- Modify: `src/components/Specialities.jsx`
- Modify: `src/components/Booking.jsx`
- Modify: `src/components/Contact.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/data/portfolioData.js`

**Interfaces:**
- Consumes `useContent()` and reads section fields from normalized `content`; public components remain presentational and keep existing styling.

- [ ] **Step 1: Add a public rendering regression test**

Create a focused test for the content adapter that supplies remote hero text and one remote gallery photo, then asserts the normalized values are the ones public components receive. Include an empty remote response and assert bundled fallback content remains available.

- [ ] **Step 2: Run the test to verify failure**

Run `npm test -- src/lib/publicContent.test.js`. Expected: FAIL because the public components still import static values.

- [ ] **Step 3: Implement the migration**

Replace direct gallery/category imports with context content, pass section objects into components, map hero slides to the existing carousel API, and preserve each current default if a field is absent. Ensure image `alt` text comes from remote metadata.

- [ ] **Step 4: Run tests, lint, and build**

Run `npm test -- src/lib/publicContent.test.js`, `npm run lint`, and `npm run build`. Expected: PASS, zero lint errors, and a successful Vite build.

- [ ] **Step 5: Commit**

Run `git add src/App.jsx src/components src/data/portfolioData.js src/lib/publicContent.test.js && git commit -m "feat: connect public site to cms content"`.

### Task 5: Add admin authentication and route shell

**Files:**
- Create: `src/admin/AdminApp.jsx`
- Create: `src/admin/AdminAuth.jsx`
- Create: `src/admin/admin.css`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces an admin route selected by `window.location.pathname === '/admin'`, with `AdminAuth` showing sign-in when no session exists and the admin shell when authenticated.

- [ ] **Step 1: Write failing auth-gating tests**

Test that an unauthenticated admin render includes email/password fields and that a signed-in session renders navigation labels for Content, Hero carousel, and Gallery.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test -- src/admin/AdminAuth.test.jsx`. Expected: FAIL because the admin route and auth components are missing.

- [ ] **Step 3: Implement auth and shell**

Use `supabase.auth.getSession()` and `onAuthStateChange()`, provide sign-in/sign-out actions, show actionable errors, and keep public `App` unchanged at non-admin paths. Add responsive admin layout, focus styles, and status regions.

- [ ] **Step 4: Run tests and commit**

Run `npm test -- src/admin/AdminAuth.test.jsx` and `npm run lint`. Expected: PASS and clean lint. Commit `git add src/admin src/App.jsx src/index.css && git commit -m "feat: add protected admin shell"`.

### Task 6: Build content editor

**Files:**
- Create: `src/admin/ContentEditor.jsx`
- Create: `src/admin/ContentEditor.test.jsx`
- Modify: `src/admin/AdminApp.jsx`

**Interfaces:**
- Consumes `useContent().content.siteContent` and `saveSection(key, content)`.

- [ ] **Step 1: Write failing editor tests**

Test labeled inputs render for every section, editing a field updates controlled state, and clicking Save calls `saveSection` with the stable section key and complete section object.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test -- src/admin/ContentEditor.test.jsx`. Expected: FAIL because the editor is missing.

- [ ] **Step 3: Implement editor**

Build section cards from an explicit field schema so labels and textareas are predictable. Include save feedback, disabled states while saving, and a warning when fallback data is active.

- [ ] **Step 4: Run tests and commit**

Run `npm test -- src/admin/ContentEditor.test.jsx` and `npm run lint`. Expected: PASS and clean lint. Commit `git add src/admin/ContentEditor.jsx src/admin/ContentEditor.test.jsx src/admin/AdminApp.jsx && git commit -m "feat: add site content editor"`.

### Task 7: Build hero and gallery media managers

**Files:**
- Create: `src/admin/MediaUploader.jsx`
- Create: `src/admin/HeroManager.jsx`
- Create: `src/admin/GalleryManager.jsx`
- Create: `src/admin/MediaManager.test.jsx`
- Modify: `src/admin/AdminApp.jsx`

**Interfaces:**
- Consumes repository mutations from `useContent()` and `moveItem`.
- Produces accessible controls for upload, replace, visibility, alt text, captions, category CRUD, and explicit up/down ordering.

- [ ] **Step 1: Write failing media-manager tests**

Test hero upload calls `createHeroSlide` with the uploaded URL and alt text, category creation slugifies the name, a photo is associated with the selected category, and delete requires confirmation before calling the repository method.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test -- src/admin/MediaManager.test.jsx`. Expected: FAIL because media managers are missing.

- [ ] **Step 3: Implement shared uploader and hero manager**

Validate image type/size in the browser, render previews, expose alt/caption fields, call `uploadImage` then metadata mutation, show upload/save errors, and render empty states. Use buttons with text labels for move up/down and delete.

- [ ] **Step 4: Implement gallery manager**

Add category form with duplicate-name handling, category list ordering, selected-category photo grid, photo upload/edit/delete, and confirmation dialog using semantic dialog markup or a focus-managed confirmation component.

- [ ] **Step 5: Run tests and commit**

Run `npm test -- src/admin/MediaManager.test.jsx`, `npm run lint`, and `npm run build`. Expected: PASS, zero lint errors, successful build. Commit `git add src/admin && git commit -m "feat: add hero and gallery media managers"`.

### Task 8: Finish setup documentation and verify end to end

**Files:**
- Modify: `README.md`
- Modify: `supabase/seed.sql`
- Create: `docs/cms-setup.md`

- [ ] **Step 1: Document deployment and security checklist**

Document Supabase project setup, migration/seed order, Auth user creation, local env setup, production env setup, storage limits, and the rule that only the anon key belongs in Vite client env vars.

- [ ] **Step 2: Run the full automated suite**

Run `npm test`, `npm run lint`, and `npm run build`. Expected: all tests pass, lint exits 0, and Vite build exits 0.

- [ ] **Step 3: Run manual browser verification**

Start `npm run dev`, open `/admin`, sign in with a seeded admin, edit each content group, upload/reorder/delete hero slides, create/rename/delete a category, upload/edit/delete a photo, refresh the browser, then open the public route and verify the persisted changes. Test keyboard-only navigation, visible focus, mobile layout, empty states, and invalid/oversized uploads.

- [ ] **Step 4: Review changed files and commit**

Run `git diff --check`, `git status --short`, and inspect the final diff for secrets or accidental generated files. Commit `git add README.md supabase docs/cms-setup.md && git commit -m "docs: document cms setup and verification"`.

## Self-review

- Spec coverage: authentication, content sections, hero management, category/photo management, public fallback, Supabase schema/RLS/storage, accessibility, error handling, tests, lint, build, and manual verification are each assigned to a task.
- Placeholder scan: no TODO/TBD steps are required; each task names files, interfaces, tests, commands, and expected outcomes.
- Type/name consistency: repository method names are reused by `ContentContext`, `ContentEditor`, `HeroManager`, and `GalleryManager`; `moveItem` and normalized `content` are defined in Task 1 before consumers.
