import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const repairMigrationPath = new URL('../../supabase/migrations/008_cms_repair_broken_media.sql', import.meta.url);

const normalizeSql = (sql) => sql.replace(/\s+/g, ' ').trim().toLowerCase();

describe('CMS media repair migration', () => {
  it('removes hero slides whose stored image no longer exists in the bucket', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    expect(migration).toContain('delete from public.hero_slides s');
    expect(migration).toContain('public.cms_image_is_missing(s.storage_path, s.image_url)');
    expect(migration).toContain('not exists ( select 1 from storage.objects o where o.bucket_id = \'site-media\' and o.name = public.cms_storage_object_name(row_storage_path, row_image_url) )');
  });

  it('keeps a hero slide when its linked gallery photo still resolves', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    expect(migration).toContain('from public.gallery_photos p where p.id = s.photo_id and p.is_visible and not public.cms_image_is_missing(p.storage_path, p.image_url)');
  });

  it('hides gallery photos with a missing stored image instead of deleting the row', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    expect(migration).toContain('update public.gallery_photos p set is_visible = false where public.cms_image_is_missing(p.storage_path, p.image_url)');
    expect(migration).not.toContain('delete from public.gallery_photos');
  });

  it('rewrites sort_order as a gapless sequence for every ordered collection', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    ['public.gallery_categories', 'public.gallery_photos', 'public.hero_slides'].forEach((table) => {
      expect(migration).toContain(`select id, row_number() over (order by sort_order, created_at, id) - 1 as new_order from ${table}`);
      expect(migration).toContain(`update ${table}`);
    });
    expect(migration).toContain('set sort_order = ranked.new_order::integer');
  });

  it('drops its repair helpers so they are not left exposed', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    expect(migration).toContain('drop function if exists public.cms_image_is_missing(text, text)');
    expect(migration).toContain('drop function if exists public.cms_storage_object_name(text, text)');
  });

  it('never treats bundled or externally hosted images as missing', async () => {
    const migration = normalizeSql(await readFile(repairMigrationPath, 'utf8'));

    expect(migration).toContain("when row_image_url like '%/storage/v1/object/public/site-media/%' or row_image_url like '%/storage/v1/object/sign/site-media/%' then not exists");
    expect(migration).toContain('else false end');
  });
});
