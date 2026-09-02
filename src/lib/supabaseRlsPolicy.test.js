import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const cmsTables = [
  'public.site_content',
  'public.hero_slides',
  'public.gallery_categories',
  'public.gallery_photos',
];

const migrationPath = new URL('../../supabase/migrations/001_cms.sql', import.meta.url);
const hardeningMigrationPath = new URL('../../supabase/migrations/002_cms_admin_allowlist.sql', import.meta.url);
const storagePathMigrationPath = new URL('../../supabase/migrations/003_cms_media_storage_paths.sql', import.meta.url);
const seedPath = new URL('../../supabase/seed.sql', import.meta.url);

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

const policyStatementsFor = (migration, table) => migration
  .split(';')
  .map(normalizeSql)
  .filter((statement) => statement.startsWith('create policy'))
  .filter((statement) => statement.includes(`on ${table}`));

const expectCmsTablePolicies = (migration, table) => {
  const policies = policyStatementsFor(migration, table);

  expect(policies).toContain(`create policy "public can read visible ${table.split('.').at(-1).replaceAll('_', ' ')}" on ${table} for select to anon using (is_visible)`);
  expect(policies).toContain(`create policy "cms admins can read all ${table.split('.').at(-1).replaceAll('_', ' ')}" on ${table} for select to authenticated using (public.is_cms_admin())`);

  ['insert', 'update', 'delete'].forEach((action) => {
    const matchingPolicies = policies.filter((policy) => policy.includes(` for ${action} to authenticated `));
    expect(matchingPolicies).toHaveLength(1);
    expect(matchingPolicies[0]).toContain('public.is_cms_admin()');
  });
};

describe('CMS RLS migration', () => {
  it('uses an RLS-protected auth.uid allowlist for CMS administrators', async () => {
    const migration = await readFile(migrationPath, 'utf8');
    const normalizedMigration = normalizeSql(migration);

    expect(normalizedMigration).toContain('create table public.admin_users ( user_id uuid primary key references auth.users(id) on delete cascade');
    expect(normalizedMigration).toContain('alter table public.admin_users enable row level security');
    expect(normalizedMigration).toContain('create or replace function public.is_cms_admin() returns boolean language sql stable security definer set search_path = \'\' as $$ select exists ( select 1 from public.admin_users where user_id = (select auth.uid()) ); $$');
  });

  it('keeps anonymous CMS reads visible-only while allowlisted admins can read and write every CMS table', async () => {
    const migration = normalizeSql(await readFile(migrationPath, 'utf8'));

    cmsTables.forEach((table) => expectCmsTablePolicies(migration, table));
  });

  it('allows public media reads and requires the same admin allowlist for Storage reads and writes', async () => {
    const migration = normalizeSql(await readFile(migrationPath, 'utf8'));
    const storagePolicies = policyStatementsFor(migration, 'storage.objects');

    expect(storagePolicies).toContain('create policy "public can read site media" on storage.objects for select to anon using (bucket_id = \'site-media\')');
    expect(storagePolicies).toContain('create policy "cms admins can read site media" on storage.objects for select to authenticated using (bucket_id = \'site-media\' and public.is_cms_admin())');

    ['insert', 'update', 'delete'].forEach((action) => {
      const matchingPolicies = storagePolicies.filter((policy) => policy.includes(` for ${action} to authenticated `));
      expect(matchingPolicies).toHaveLength(1);
      expect(matchingPolicies[0]).toContain("bucket_id = 'site-media'");
      expect(matchingPolicies[0]).toContain('public.is_cms_admin()');
    });
  });

  it('includes an upgrade migration that replaces the original broad authenticated policies', async () => {
    const migration = normalizeSql(await readFile(hardeningMigrationPath, 'utf8'));

    expect(migration).toContain('create table if not exists public.admin_users ( user_id uuid primary key references auth.users(id) on delete cascade');
    expect(migration).toContain('create or replace function public.is_cms_admin() returns boolean language sql stable security definer set search_path = \'\' as $$ select exists ( select 1 from public.admin_users where user_id = (select auth.uid()) ); $$');
    expect(migration).toContain('drop policy if exists "authenticated users can insert site content" on public.site_content');
    expect(migration).toContain('drop policy if exists "authenticated users can upload site media" on storage.objects');
    [
      ['public.site_content', 'Authenticated users can manage site content'],
      ['public.hero_slides', 'Authenticated users can manage hero slides'],
      ['public.gallery_categories', 'Authenticated users can manage gallery categories'],
      ['public.gallery_photos', 'Authenticated users can manage gallery photos'],
    ].forEach(([table, policyName]) => {
      expect(migration).toContain(`drop policy if exists "${policyName.toLowerCase()}" on ${table}`);
    });
    cmsTables.forEach((table) => expectCmsTablePolicies(migration, table));

    const storagePolicies = policyStatementsFor(migration, 'storage.objects');
    expect(storagePolicies).toContain('create policy "cms admins can read site media" on storage.objects for select to authenticated using (bucket_id = \'site-media\' and public.is_cms_admin())');
  });

  it('stores managed media paths for fresh installs and existing CMS projects', async () => {
    const [migration, storagePathMigration, seed] = await Promise.all([
      readFile(migrationPath, 'utf8'),
      readFile(storagePathMigrationPath, 'utf8'),
      readFile(seedPath, 'utf8'),
    ]);

    expect(normalizeSql(migration)).toContain('create table public.hero_slides ( id uuid primary key default gen_random_uuid(), image_url text not null, storage_path text');
    expect(normalizeSql(migration)).toContain('create table public.gallery_photos ( id uuid primary key default gen_random_uuid(), category_id uuid not null references public.gallery_categories(id) on delete cascade, image_url text not null, storage_path text');
    expect(normalizeSql(storagePathMigration)).toContain('alter table public.hero_slides add column if not exists storage_path text');
    expect(normalizeSql(storagePathMigration)).toContain('alter table public.gallery_photos add column if not exists storage_path text');
    expect(seed).toContain('insert into public.hero_slides (image_url, storage_path, alt_text, sort_order)');
    expect(seed).toContain('insert into public.gallery_photos (category_id, image_url, storage_path, alt_text, sort_order)');
  });
});
