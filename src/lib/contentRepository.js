import { defaultContent, mergeContent, moveItem, slugify } from './contentModel';
import { isSupabaseConfigured, supabaseClient } from './supabaseClient';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const STORAGE_BUCKET = 'site-media';

const toError = (error, fallback) => error instanceof Error ? error : new Error(error?.message || fallback);
const safeFileName = (name = 'image') => String(name)
  .toLowerCase()
  .replace(/[^a-z0-9._-]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'image';

function assertNoError(result, fallback) {
  if (result?.error) throw toError(result.error, fallback);
  return result?.data;
}

function metadataPayload(input, fields) {
  return Object.fromEntries(fields.flatMap(([databaseField, contentField]) => {
    const value = input[contentField] ?? input[databaseField];
    return value === undefined ? [] : [[databaseField, value]];
  }));
}

export function createContentRepository({ client = supabaseClient, configured = isSupabaseConfigured } = {}) {
  const requireClient = () => {
    if (!configured || !client) throw new Error('Supabase is not configured.');
    return client;
  };

  const deleteUploadedFile = async (path) => {
    if (path) await requireClient().storage.from(STORAGE_BUCKET).remove([path]);
  };

  const insertWithCleanup = async (table, payload, storagePath) => {
    try {
      const result = await requireClient().from(table).insert(payload).select().single();
      return assertNoError(result, `Unable to create ${table} record.`);
    } catch (error) {
      if (storagePath) {
        try {
          await deleteUploadedFile(storagePath);
        } catch {
          // The original metadata error is more useful to the caller.
        }
      }
      throw error;
    }
  };

  return {
    async loadContent() {
      if (!configured || !client) return mergeContent(defaultContent);

      try {
        const [siteContent, heroSlides, categories, photos] = await Promise.all([
          client.from('site_content').select('*'),
          client.from('hero_slides').select('*'),
          client.from('gallery_categories').select('*'),
          client.from('gallery_photos').select('*'),
        ]);

        [siteContent, heroSlides, categories, photos].forEach((result) => {
          assertNoError(result, 'Unable to load CMS content.');
        });

        return mergeContent(defaultContent, {
          siteContent: siteContent.data,
          heroSlides: heroSlides.data,
          categories: categories.data,
          photos: photos.data,
        });
      } catch {
        return mergeContent(defaultContent);
      }
    },

    async saveSection(key, content) {
      const result = await requireClient()
        .from('site_content')
        .upsert({ key, content, is_visible: true }, { onConflict: 'key' })
        .select()
        .single();
      return assertNoError(result, 'Unable to save content section.');
    },

    async uploadImage(file, folder) {
      if (!file?.type?.startsWith('image/')) throw new Error('Only image files can be uploaded.');
      if (file.size > MAX_IMAGE_SIZE) throw new Error('Images must be 10 MB or smaller.');

      const storage = requireClient().storage.from(STORAGE_BUCKET);
      const path = `${String(folder || 'uploads').replace(/[^a-z0-9_-]/gi, '-')}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      assertNoError(await storage.upload(path, file, { contentType: file.type, upsert: false }), 'Unable to upload image.');
      const publicUrl = storage.getPublicUrl(path)?.data?.publicUrl;
      if (!publicUrl) {
        await storage.remove([path]);
        throw new Error('Unable to retrieve the uploaded image URL.');
      }
      return { path, url: publicUrl };
    },

    async createHeroSlide(input) {
      return insertWithCleanup('hero_slides', {
        image_url: input.imageUrl,
        alt_text: input.altText || '',
        caption: input.caption || '',
        sort_order: input.sortOrder ?? 0,
        is_visible: input.isVisible ?? true,
      }, input.storagePath);
    },

    async updateHeroSlide(id, patch) {
      const result = await requireClient().from('hero_slides')
        .update(metadataPayload(patch, [
          ['image_url', 'imageUrl'], ['alt_text', 'altText'], ['caption', 'caption'],
          ['sort_order', 'sortOrder'], ['is_visible', 'isVisible'],
        ]))
        .eq('id', id).select().single();
      return assertNoError(result, 'Unable to update hero slide.');
    },

    async deleteHeroSlide(id) {
      const result = await requireClient().from('hero_slides').delete().eq('id', id);
      assertNoError(result, 'Unable to delete hero slide.');
    },

    async createCategory(name) {
      const result = await requireClient().from('gallery_categories')
        .insert({ name, slug: slugify(name), sort_order: 0, is_visible: true }).select().single();
      return assertNoError(result, 'Unable to create category.');
    },

    async updateCategory(id, patch) {
      const result = await requireClient().from('gallery_categories')
        .update(metadataPayload(patch, [
          ['name', 'name'], ['slug', 'slug'], ['sort_order', 'sortOrder'], ['is_visible', 'isVisible'],
        ]))
        .eq('id', id).select().single();
      return assertNoError(result, 'Unable to update category.');
    },

    async deleteCategory(id) {
      const result = await requireClient().from('gallery_categories').delete().eq('id', id);
      assertNoError(result, 'Unable to delete category.');
    },

    async createPhoto(input) {
      return insertWithCleanup('gallery_photos', {
        category_id: input.categoryId,
        image_url: input.imageUrl,
        alt_text: input.altText || '',
        sort_order: input.sortOrder ?? 0,
        is_visible: input.isVisible ?? true,
      }, input.storagePath);
    },

    async updatePhoto(id, patch) {
      const result = await requireClient().from('gallery_photos')
        .update(metadataPayload(patch, [
          ['category_id', 'categoryId'], ['image_url', 'imageUrl'], ['alt_text', 'altText'],
          ['sort_order', 'sortOrder'], ['is_visible', 'isVisible'],
        ]))
        .eq('id', id).select().single();
      return assertNoError(result, 'Unable to update photo.');
    },

    async deletePhoto(id) {
      const result = await requireClient().from('gallery_photos').delete().eq('id', id);
      assertNoError(result, 'Unable to delete photo.');
    },
  };
}

export { moveItem };

export const contentRepository = createContentRepository();
