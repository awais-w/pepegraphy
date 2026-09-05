-- Add bilingual alternative text columns to gallery media tables.
-- For existing rows, copy the current `alt_text` into both `alt_text_en` and `alt_text_hu`
-- so previously seeded media keeps its current display text.

alter table public.hero_slides
  add column if not exists alt_text_en text;

alter table public.hero_slides
  add column if not exists alt_text_hu text;

alter table public.gallery_photos
  add column if not exists alt_text_en text;

alter table public.gallery_photos
  add column if not exists alt_text_hu text;

update public.hero_slides
set alt_text_en = coalesce(alt_text_en, alt_text),
    alt_text_hu = coalesce(alt_text_hu, alt_text)
where alt_text_en is null or alt_text_hu is null;

update public.gallery_photos
set alt_text_en = coalesce(alt_text_en, alt_text),
    alt_text_hu = coalesce(alt_text_hu, alt_text)
where alt_text_en is null or alt_text_hu is null;
