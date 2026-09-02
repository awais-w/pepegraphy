create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

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
  storage_path text,
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
  storage_path text,
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
alter table public.admin_users enable row level security;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

create policy "Public can read visible site content" on public.site_content for select to anon using (is_visible);
create policy "CMS admins can read all site content" on public.site_content for select to authenticated using (public.is_cms_admin());
create policy "CMS admins can insert site content" on public.site_content for insert to authenticated with check (public.is_cms_admin());
create policy "CMS admins can update site content" on public.site_content for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete site content" on public.site_content for delete to authenticated using (public.is_cms_admin());

create policy "Public can read visible hero slides" on public.hero_slides for select to anon using (is_visible);
create policy "CMS admins can read all hero slides" on public.hero_slides for select to authenticated using (public.is_cms_admin());
create policy "CMS admins can insert hero slides" on public.hero_slides for insert to authenticated with check (public.is_cms_admin());
create policy "CMS admins can update hero slides" on public.hero_slides for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete hero slides" on public.hero_slides for delete to authenticated using (public.is_cms_admin());

create policy "Public can read visible gallery categories" on public.gallery_categories for select to anon using (is_visible);
create policy "CMS admins can read all gallery categories" on public.gallery_categories for select to authenticated using (public.is_cms_admin());
create policy "CMS admins can insert gallery categories" on public.gallery_categories for insert to authenticated with check (public.is_cms_admin());
create policy "CMS admins can update gallery categories" on public.gallery_categories for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete gallery categories" on public.gallery_categories for delete to authenticated using (public.is_cms_admin());

create policy "Public can read visible gallery photos" on public.gallery_photos for select to anon using (is_visible);
create policy "CMS admins can read all gallery photos" on public.gallery_photos for select to authenticated using (public.is_cms_admin());
create policy "CMS admins can insert gallery photos" on public.gallery_photos for insert to authenticated with check (public.is_cms_admin());
create policy "CMS admins can update gallery photos" on public.gallery_photos for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "CMS admins can delete gallery photos" on public.gallery_photos for delete to authenticated using (public.is_cms_admin());

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "Public can read site media" on storage.objects for select to anon using (bucket_id = 'site-media');
create policy "CMS admins can read site media" on storage.objects for select to authenticated using (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_cms_admin()) with check (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.is_cms_admin());
