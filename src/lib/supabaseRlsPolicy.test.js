import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const cmsTables = [
  'public.site_content',
  'public.hero_slides',
  'public.gallery_categories',
  'public.gallery_photos',
];

const migrationPath = new URL('../../supabase/migrations/001_cms.sql', import.meta.url);

describe('CMS RLS migration', () => {
  it('limits authenticated CMS access policies to writes', async () => {
    const migration = await readFile(migrationPath, 'utf8');
    const authenticatedActions = migration
      .split(';')
      .filter((statement) => statement.includes('to authenticated'))
      .filter((statement) => cmsTables.some((table) => statement.includes(`on ${table}`)))
      .map((statement) => statement.match(/\bfor\s+(\w+)\s+to\s+authenticated/i)?.[1]?.toLowerCase());

    expect(authenticatedActions).toEqual([
      'insert', 'update', 'delete',
      'insert', 'update', 'delete',
      'insert', 'update', 'delete',
      'insert', 'update', 'delete',
    ]);
  });
});
