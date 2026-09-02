-- Apply this migration to existing CMS installations after 002_cms_admin_allowlist.sql.
-- Bundled seed images intentionally retain a NULL storage_path because they are served
-- from the app's public assets rather than the site-media Storage bucket.

alter table public.hero_slides
  add column if not exists storage_path text;

alter table public.gallery_photos
  add column if not exists storage_path text;
