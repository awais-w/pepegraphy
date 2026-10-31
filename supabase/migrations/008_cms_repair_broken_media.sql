-- Repairs CMS media records that point at Supabase Storage objects which no longer
-- exist, and rewrites sort_order into a gapless sequence so admin ordering is
-- deterministic and public galleries render in the intended order.
--
-- Run this in the Supabase SQL editor (or with `supabase db push`) after 007.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The storage object name for a record, derived from storage_path or image_url.
create or replace function public.cms_storage_object_name(row_storage_path text, row_image_url text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    nullif(btrim(row_storage_path), ''),
    nullif(split_part(regexp_replace(row_image_url, '^.*/storage/v1/object/public/site-media/', ''), '?', 1), ''),
    nullif(split_part(regexp_replace(row_image_url, '^.*/storage/v1/object/sign/site-media/', ''), '?', 1), '')
  );
$$;

-- True when a record points at a bucket object that is no longer there.
-- Bundled and externally hosted images are never treated as missing.
create or replace function public.cms_image_is_missing(row_storage_path text, row_image_url text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select case
    when row_image_url is null then false
    when row_image_url like '%/storage/v1/object/public/site-media/%'
      or row_image_url like '%/storage/v1/object/sign/site-media/%'
      then not exists (
        select 1
        from storage.objects o
        where o.bucket_id = 'site-media'
          and o.name = public.cms_storage_object_name(row_storage_path, row_image_url)
      )
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Remove hero slides that cannot render.
--    A slide renders its linked gallery photo when photo_id is set, otherwise it
--    renders its own image_url. A slide is only removed when neither source
--    resolves to an image that still exists in the bucket.
-- ---------------------------------------------------------------------------

delete from public.hero_slides s
where public.cms_image_is_missing(s.storage_path, s.image_url)
  and not exists (
    select 1
    from public.gallery_photos p
    where p.id = s.photo_id
      and p.is_visible
      and not public.cms_image_is_missing(p.storage_path, p.image_url)
  );

-- ---------------------------------------------------------------------------
-- 2. Hide gallery photos whose stored file is gone. The row is kept so the
--    administrator can replace or delete the image from the admin panel.
-- ---------------------------------------------------------------------------

update public.gallery_photos p
set is_visible = false
where public.cms_image_is_missing(p.storage_path, p.image_url);

-- ---------------------------------------------------------------------------
-- 3. Rewrite sort_order as a gapless sequence for every ordered collection.
--    Ties are broken by created_at and id so the result is stable across runs.
-- ---------------------------------------------------------------------------

with ranked as (
  select id, row_number() over (order by sort_order, created_at, id) - 1 as new_order
  from public.gallery_categories
)
update public.gallery_categories category
set sort_order = ranked.new_order::integer
from ranked
where category.id = ranked.id
  and category.sort_order is distinct from ranked.new_order;

with ranked as (
  select id, row_number() over (order by sort_order, created_at, id) - 1 as new_order
  from public.gallery_photos
)
update public.gallery_photos photo
set sort_order = ranked.new_order::integer
from ranked
where photo.id = ranked.id
  and photo.sort_order is distinct from ranked.new_order;

with ranked as (
  select id, row_number() over (order by sort_order, created_at, id) - 1 as new_order
  from public.hero_slides
)
update public.hero_slides slide
set sort_order = ranked.new_order::integer
from ranked
where slide.id = ranked.id
  and slide.sort_order is distinct from ranked.new_order;

-- ---------------------------------------------------------------------------
-- 4. Remove the repair helpers so they are not left exposed on the project.
-- ---------------------------------------------------------------------------

drop function if exists public.cms_image_is_missing(text, text);
drop function if exists public.cms_storage_object_name(text, text);
