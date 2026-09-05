-- Make hero slides reference gallery photos instead of standalone uploads.
-- Existing hero slides keep their current image data; new selections will use photo_id.

alter table public.hero_slides
  add column if not exists photo_id uuid references public.gallery_photos(id) on delete set null;

create index if not exists hero_slides_photo_id_idx
  on public.hero_slides (photo_id);
