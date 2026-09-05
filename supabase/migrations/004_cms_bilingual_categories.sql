-- Add bilingual name columns to gallery_categories.
-- For existing rows, copy the current `name` into both `name_en` and `name_hu`
-- so previously seeded categories keep their current display text.

alter table public.gallery_categories
  add column if not exists name_en text;

alter table public.gallery_categories
  add column if not exists name_hu text;

update public.gallery_categories
set name_en = coalesce(name_en, name),
    name_hu = coalesce(name_hu, name)
where name_en is null or name_hu is null;
