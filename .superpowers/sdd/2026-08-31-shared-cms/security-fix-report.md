# Security Fix Report: CMS admin allowlist

## Status

- Replaced the unrestricted authenticated CMS and Storage policies with an explicit `public.admin_users` allowlist checked through `public.is_cms_admin()` and `auth.uid()`.
- Preserved anonymous visible-only CMS reads and public media reads; allowlisted administrators can read hidden rows and perform all CMS/Storage mutations.
- Added `002_cms_admin_allowlist.sql` to remediate projects that had already applied the original migration.
- Refreshed CMS content when an administrator session becomes available so hidden rows are available to the admin interface immediately after sign-in.
- Updated the setup and release checklist to disable public signup and anonymous sign-ins, create one administrator, and add that user to the allowlist.

## Tests

- TDD policy contract: the allowlist/RLS assertions failed before the migration changes and pass afterwards.
- TDD admin-session contract: the refresh assertion failed before the admin-shell change and passes afterwards.
- `npm test` — passed: 9 files, 42 tests.
- `npm run lint` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.

## Concerns

- No Supabase CLI, project credentials, or seeded test users are available in this worktree, so live execution of the SQL/RLS policies remains a deployment verification step.
- `site-media` remains a public bucket by design. Hiding a metadata row prevents it from being selected by anonymous CMS queries, but a previously known public object URL is not a confidentiality boundary. Use a private bucket and signed URLs if hidden media must be inaccessible.
- The Vite build retains its existing advisory for a JavaScript chunk larger than 500 kB after minification.
