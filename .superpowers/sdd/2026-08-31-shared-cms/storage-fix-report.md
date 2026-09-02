# Storage Lifecycle Fix Report

**Date:** 2026-09-02
**Implementation commit:** `b3bd14f fix: clean up CMS storage media`

## Delivered

- Added nullable `storage_path` metadata to `hero_slides` and `gallery_photos` for fresh installations, plus `003_cms_media_storage_paths.sql` for already-provisioned CMS projects.
- Updated the seed to explicitly store `NULL` paths for bundled local images, which are not objects in the `site-media` bucket.
- Preserved the upload contract of `{ url, path }` and now persist that path whenever hero slides or gallery photos are created.
- Replacements upload first, update URL and storage metadata together, remove the newly uploaded object if metadata persistence fails, then remove the previous object only after metadata succeeds. Cleanup failures include operation-specific errors and retain their underlying cause.
- Hero and photo deletion retrieve the stored path before deleting metadata, then remove the associated Storage object. Category deletion retrieves every child photo path before the foreign-key cascade, deletes the category metadata, then removes all collected Storage objects.
- Updated CMS setup documentation with the third migration and lifecycle behavior.

## Test coverage

Added repository coverage for:

- hero storage-path persistence;
- photo Storage removal and removal failure reporting;
- category child-path collection and batched Storage cleanup before cascade metadata is lost;
- replacement rollback of a newly uploaded object when hero metadata update fails;
- old-object removal after a successful replacement, including cleanup failure reporting;
- initial/upgrade migration and seed storage-path declarations.

## Verification

Executed after implementation:

```text
npm test       # 10 files, 54 tests passed
npm run lint   # passed
npm run build  # passed
git diff --check # passed
```

The Vite build continues to emit its non-failing advisory for a minified JavaScript chunk above 500 kB. Vitest continues to emit the existing Node `--localstorage-file` warning while passing.

## Deployment note

Apply `001_cms.sql`, `002_cms_admin_allowlist.sql`, and `003_cms_media_storage_paths.sql` in order before running the seed. Existing bundled media rows remain safe because their `storage_path` is `NULL`.
