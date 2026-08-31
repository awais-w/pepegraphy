create extension if not exists pgcrypto;

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  content jsonb not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.gallery_categories(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_content_visible_key_idx on public.site_content (key) where is_visible;
create index hero_slides_visible_sort_order_idx on public.hero_slides (sort_order) where is_visible;
create index gallery_categories_visible_sort_order_idx on public.gallery_categories (sort_order) where is_visible;
create index gallery_photos_category_visible_sort_order_idx on public.gallery_photos (category_id, sort_order) where is_visible;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_site_content_updated_at before update on public.site_content for each row execute function public.set_updated_at();
create trigger set_hero_slides_updated_at before update on public.hero_slides for each row execute function public.set_updated_at();
create trigger set_gallery_categories_updated_at before update on public.gallery_categories for each row execute function public.set_updated_at();
create trigger set_gallery_photos_updated_at before update on public.gallery_photos for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.hero_slides enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_photos enable row level security;

create policy "Public can read visible site content" on public.site_content for select using (is_visible);
create policy "Public can read visible hero slides" on public.hero_slides for select using (is_visible);
create policy "Public can read visible gallery categories" on public.gallery_categories for select using (is_visible);
create policy "Public can read visible gallery photos" on public.gallery_photos for select using (is_visible);

create policy "Authenticated users can manage site content" on public.site_content for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage hero slides" on public.hero_slides for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage gallery categories" on public.gallery_categories for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage gallery photos" on public.gallery_photos for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "Public can read site media" on storage.objects for select using (bucket_id = 'site-media');
create policy "Authenticated users can upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media');
create policy "Authenticated users can update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media') with check (bucket_id = 'site-media');
create policy "Authenticated users can delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media');
