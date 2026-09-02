-- Apply the CMS admin allowlist to projects where 001_cms.sql was already run.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

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

drop policy if exists "Public can read visible site content" on public.site_content;
drop policy if exists "Authenticated users can manage site content" on public.site_content;
drop policy if exists "Authenticated users can insert site content" on public.site_content;
drop policy if exists "Authenticated users can update site content" on public.site_content;
drop policy if exists "Authenticated users can delete site content" on public.site_content;
drop policy if exists "CMS admins can read all site content" on public.site_content;
drop policy if exists "CMS admins can insert site content" on public.site_content;
drop policy if exists "CMS admins can update site content" on public.site_content;
drop policy if exists "CMS admins can delete site content" on public.site_content;

drop policy if exists "Public can read visible hero slides" on public.hero_slides;
drop policy if exists "Authenticated users can manage hero slides" on public.hero_slides;
drop policy if exists "Authenticated users can insert hero slides" on public.hero_slides;
drop policy if exists "Authenticated users can update hero slides" on public.hero_slides;
drop policy if exists "Authenticated users can delete hero slides" on public.hero_slides;
drop policy if exists "CMS admins can read all hero slides" on public.hero_slides;
drop policy if exists "CMS admins can insert hero slides" on public.hero_slides;
drop policy if exists "CMS admins can update hero slides" on public.hero_slides;
drop policy if exists "CMS admins can delete hero slides" on public.hero_slides;

drop policy if exists "Public can read visible gallery categories" on public.gallery_categories;
drop policy if exists "Authenticated users can manage gallery categories" on public.gallery_categories;
drop policy if exists "Authenticated users can insert gallery categories" on public.gallery_categories;
drop policy if exists "Authenticated users can update gallery categories" on public.gallery_categories;
drop policy if exists "Authenticated users can delete gallery categories" on public.gallery_categories;
drop policy if exists "CMS admins can read all gallery categories" on public.gallery_categories;
drop policy if exists "CMS admins can insert gallery categories" on public.gallery_categories;
drop policy if exists "CMS admins can update gallery categories" on public.gallery_categories;
drop policy if exists "CMS admins can delete gallery categories" on public.gallery_categories;

drop policy if exists "Public can read visible gallery photos" on public.gallery_photos;
drop policy if exists "Authenticated users can manage gallery photos" on public.gallery_photos;
drop policy if exists "Authenticated users can insert gallery photos" on public.gallery_photos;
drop policy if exists "Authenticated users can update gallery photos" on public.gallery_photos;
drop policy if exists "Authenticated users can delete gallery photos" on public.gallery_photos;
drop policy if exists "CMS admins can read all gallery photos" on public.gallery_photos;
drop policy if exists "CMS admins can insert gallery photos" on public.gallery_photos;
drop policy if exists "CMS admins can update gallery photos" on public.gallery_photos;
drop policy if exists "CMS admins can delete gallery photos" on public.gallery_photos;

drop policy if exists "Public can read site media" on storage.objects;
drop policy if exists "Authenticated users can upload site media" on storage.objects;
drop policy if exists "Authenticated users can update site media" on storage.objects;
drop policy if exists "Authenticated users can delete site media" on storage.objects;
drop policy if exists "CMS admins can read site media" on storage.objects;
drop policy if exists "CMS admins can upload site media" on storage.objects;
drop policy if exists "CMS admins can update site media" on storage.objects;
drop policy if exists "CMS admins can delete site media" on storage.objects;

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

create policy "Public can read site media" on storage.objects for select to anon using (bucket_id = 'site-media');
create policy "CMS admins can read site media" on storage.objects for select to authenticated using (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.is_cms_admin()) with check (bucket_id = 'site-media' and public.is_cms_admin());
create policy "CMS admins can delete site media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.is_cms_admin());
