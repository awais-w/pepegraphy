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
    cmsTables.forEach((table) => expectCmsTablePolicies(migration, table));

    const storagePolicies = policyStatementsFor(migration, 'storage.objects');
    expect(storagePolicies).toContain('create policy "cms admins can read site media" on storage.objects for select to authenticated using (bucket_id = \'site-media\' and public.is_cms_admin())');
  });
});
