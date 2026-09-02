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
  let lastLoadError = null;

  const requireClient = () => {
    if (!configured || !client) throw new Error('Supabase is not configured.');
    return client;
  };

  const deleteUploadedFile = async (path) => {
    if (path) {
      const result = await requireClient().storage.from(STORAGE_BUCKET).remove([path]);
      assertNoError(result, 'Unable to remove uploaded image.');
    }
  };

  const deleteStorageObjects = async (paths, fallback) => {
    const uniquePaths = [...new Set(paths.filter((path) => typeof path === 'string' && path.trim()))];
    if (uniquePaths.length === 0) return;

    try {
      const result = await requireClient().storage.from(STORAGE_BUCKET).remove(uniquePaths);
      if (result?.error) throw toError(result.error, fallback);
    } catch (error) {
      const cleanupError = toError(error, fallback);
      throw new Error(`${fallback} ${cleanupError.message}`, { cause: error });
    }
  };

  const storagePathFor = async (table, id, fallback) => {
    const result = await requireClient().from(table).select('storage_path').eq('id', id).single();
    return assertNoError(result, fallback)?.storage_path ?? null;
  };

  const insertWithCleanup = async (table, payload, storagePath) => {
    try {
      const result = await requireClient().from(table).insert(payload).select().single();
      return assertNoError(result, `Unable to create ${table} record.`);
    } catch (error) {
      if (storagePath) {
        try {
          await deleteUploadedFile(storagePath);
        } catch (cleanupError) {
          const metadataError = toError(error, `Unable to create ${table} record.`);
          throw new AggregateError(
            [metadataError, toError(cleanupError, 'Unable to remove uploaded image.')],
            'Unable to clean up uploaded image after metadata insertion failed.',
            { cause: cleanupError },
          );
        }
      }
      throw error;
    }
  };

  const updateMediaRecord = async (table, id, patch, fields, label) => {
    const hasReplacement = Object.hasOwn(patch, 'storagePath') || Object.hasOwn(patch, 'storage_path');
    const newStoragePath = patch.storagePath ?? patch.storage_path;
    const payload = metadataPayload(patch, fields);

    if (!hasReplacement) {
      const result = await requireClient().from(table).update(payload).eq('id', id).select().single();
      return assertNoError(result, `Unable to update ${label}.`);
    }

    let previousStoragePath;
    let updatedRecord;
    try {
      previousStoragePath = await storagePathFor(table, id, `Unable to retrieve ${label} storage metadata.`);
      const result = await requireClient().from(table).update(payload).eq('id', id).select().single();
      updatedRecord = assertNoError(result, `Unable to update ${label}.`);
    } catch (error) {
      if (newStoragePath) {
        try {
          await deleteStorageObjects([newStoragePath], 'Unable to remove replacement image from storage.');
        } catch (cleanupError) {
          throw new AggregateError(
            [toError(error, `Unable to update ${label}.`), toError(cleanupError, 'Unable to remove replacement image from storage.')],
            'Unable to clean up replacement image after metadata update failed.',
            { cause: cleanupError },
          );
        }
      }
      throw error;
    }

    if (previousStoragePath && previousStoragePath !== newStoragePath) {
      await deleteStorageObjects([previousStoragePath], `Unable to remove previous ${label} image from storage.`);
    }
    return updatedRecord;
  };

  const deleteMediaRecord = async (table, id, label) => {
    const storagePath = await storagePathFor(table, id, `Unable to retrieve ${label} storage metadata.`);
    const result = await requireClient().from(table).delete().eq('id', id);
    assertNoError(result, `Unable to delete ${label}.`);
    await deleteStorageObjects([storagePath], `Unable to remove ${label} image from storage.`);
  };

  return {
    async loadContent() {
      if (!configured || !client) {
        lastLoadError = new Error('Supabase is not configured.');
        return mergeContent(defaultContent);
      }

      try {
        const [siteContent, heroSlides, categories, photos] = await Promise.all([
          client.from('site_content').select('*'),
          client.from('hero_slides').select('*'),
          client.from('gallery_categories').select('*').order('sort_order', { ascending: true }),
          client.from('gallery_photos').select('*'),
        ]);

        [siteContent, heroSlides, categories, photos].forEach((result) => {
          assertNoError(result, 'Unable to load CMS content.');
        });

        lastLoadError = null;
        return mergeContent(defaultContent, {
          siteContent: siteContent.data,
          heroSlides: heroSlides.data,
          categories: categories.data,
          photos: photos.data,
        });
      } catch (error) {
        lastLoadError = toError(error, 'Unable to load CMS content.');
        return mergeContent(defaultContent);
      }
    },

    getLoadError() {
      return lastLoadError;
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
        storage_path: input.storagePath ?? null,
        alt_text: input.altText || '',
        caption: input.caption || '',
        sort_order: input.sortOrder ?? 0,
        is_visible: input.isVisible ?? true,
      }, input.storagePath);
    },

    async updateHeroSlide(id, patch) {
      return updateMediaRecord('hero_slides', id, patch, [
          ['image_url', 'imageUrl'], ['alt_text', 'altText'], ['caption', 'caption'],
          ['storage_path', 'storagePath'], ['sort_order', 'sortOrder'], ['is_visible', 'isVisible'],
        ], 'hero slide');
    },

    async deleteHeroSlide(id) {
      return deleteMediaRecord('hero_slides', id, 'hero slide');
    },

    async createCategory(name, sortOrder = 0) {
      const result = await requireClient().from('gallery_categories')
        .insert({ name, slug: slugify(name), sort_order: sortOrder, is_visible: true }).select().single();
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
      const photoResult = await requireClient().from('gallery_photos').select('storage_path').eq('category_id', id);
      const photoStoragePaths = assertNoError(photoResult, 'Unable to retrieve category photo storage metadata.')
        ?.map((photo) => photo?.storage_path) ?? [];
      const result = await requireClient().from('gallery_categories').delete().eq('id', id);
      assertNoError(result, 'Unable to delete category.');
      await deleteStorageObjects(photoStoragePaths, 'Unable to remove category photo images from storage.');
    },

    async createPhoto(input) {
      return insertWithCleanup('gallery_photos', {
        category_id: input.categoryId,
        image_url: input.imageUrl,
        storage_path: input.storagePath ?? null,
        alt_text: input.altText || '',
        sort_order: input.sortOrder ?? 0,
        is_visible: input.isVisible ?? true,
      }, input.storagePath);
    },

    async updatePhoto(id, patch) {
      return updateMediaRecord('gallery_photos', id, patch, [
          ['category_id', 'categoryId'], ['image_url', 'imageUrl'], ['alt_text', 'altText'],
          ['storage_path', 'storagePath'], ['sort_order', 'sortOrder'], ['is_visible', 'isVisible'],
        ], 'photo');
    },

    async deletePhoto(id) {
      return deleteMediaRecord('gallery_photos', id, 'photo');
    },
  };
}

export { moveItem };

export const contentRepository = createContentRepository();
