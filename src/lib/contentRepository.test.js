import { describe, expect, it, vi } from 'vitest';
import { createContentRepository, moveItem } from './contentRepository';
import { defaultContent } from './contentModel';

describe('content repository', () => {
  it('returns merged bundled content when Supabase is not configured', async () => {
    const repository = createContentRepository({ configured: false });

    await expect(repository.loadContent()).resolves.toEqual(defaultContent);
    expect(repository.getLoadError()).toMatchObject({ message: 'Supabase is not configured.' });
  });

  it('retains a load error while returning fallback content after a query failure', async () => {
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn((table) => table === 'gallery_categories'
          ? { select: () => ({ order: async () => ({ error: new Error('Network unavailable') }) }) }
          : { select: async () => ({ error: new Error('Network unavailable') }) }),
      },
    });

    await expect(repository.loadContent()).resolves.toEqual(defaultContent);
    expect(repository.getLoadError()).toMatchObject({ message: 'Network unavailable' });
  });

  it.each([
    [{ type: 'application/pdf', size: 1024 }, 'Only image files can be uploaded.'],
    [{ type: 'image/jpeg', size: 10 * 1024 * 1024 + 1 }, 'Images must be 10 MB or smaller.'],
  ])('rejects invalid uploads before contacting storage', async (file, message) => {
    const upload = vi.fn();
    const repository = createContentRepository({
      configured: true,
      client: { storage: { from: vi.fn(() => ({ upload })) } },
    });

    await expect(repository.uploadImage(file, 'gallery')).rejects.toThrow(message);
    expect(upload).not.toHaveBeenCalled();
  });

  it('moves the requested item without mutating the original ordering', () => {
    const items = ['first', 'second', 'third'];

    expect(moveItem(items, 1, 'down')).toEqual(['first', 'third', 'second']);
    expect(items).toEqual(['first', 'second', 'third']);
  });

  it('maps normalized photo updates to database fields', async () => {
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'photo-1' } }) }) }) }));
    const repository = createContentRepository({
      configured: true,
      client: { from: vi.fn(() => ({ update })) },
    });

    await repository.updatePhoto('photo-1', { altText: 'Updated image', isVisible: false });

    expect(update).toHaveBeenCalledWith({ alt_text: 'Updated image', is_visible: false });
  });

  it('writes a supplied category position and requests categories in display order', async () => {
    const insert = vi.fn(() => ({ select: () => ({ single: async () => ({ data: { id: 'category-3' } }) }) }));
    const order = vi.fn(async () => ({ data: [] }));
    const select = vi.fn(() => ({ order }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn((table) => table === 'gallery_categories' ? { insert, select } : { select: async () => ({ data: [] }) }),
      },
    });

    await repository.createCategory('Events', 2);
    await repository.loadContent();

    expect(insert).toHaveBeenCalledWith({ name: 'Events', slug: 'events', sort_order: 2, is_visible: true });
    expect(order).toHaveBeenCalledWith('sort_order', { ascending: true });
  });

  it('surfaces a storage cleanup failure after metadata insertion fails', async () => {
    const remove = vi.fn(async () => ({ error: new Error('Storage cleanup unavailable') }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({
          insert: () => ({ select: () => ({ single: async () => ({ error: new Error('Metadata insert unavailable') }) }) }),
        })),
        storage: { from: () => ({ remove }) },
      },
    });

    let failure;
    try {
      await repository.createHeroSlide({ imageUrl: '/hero.jpg', storagePath: 'hero/test.jpg' });
    } catch (error) {
      failure = error;
    }

    expect(remove).toHaveBeenCalledWith(['hero/test.jpg']);
    expect(failure).toBeInstanceOf(AggregateError);
    expect(failure.message).toBe('Unable to clean up uploaded image after metadata insertion failed.');
    expect(failure.errors.map((error) => error.message)).toEqual([
      'Metadata insert unavailable',
      'Storage cleanup unavailable',
    ]);
  });

  it('persists an uploaded hero slide storage path with its metadata', async () => {
    const insert = vi.fn(() => ({ select: () => ({ single: async () => ({ data: { id: 'hero-1' } }) }) }));
    const repository = createContentRepository({
      configured: true,
      client: { from: vi.fn(() => ({ insert })) },
    });

    await repository.createHeroSlide({
      imageUrl: 'https://cdn.example/hero.jpg',
      storagePath: 'hero/new-hero.jpg',
      altText: 'New hero',
    });

    expect(insert).toHaveBeenCalledWith({
      image_url: 'https://cdn.example/hero.jpg',
      storage_path: 'hero/new-hero.jpg',
      alt_text: 'New hero',
      caption: '',
      sort_order: 0,
      is_visible: true,
    });
  });

  it('deletes photo metadata and its associated storage object', async () => {
    const remove = vi.fn(async () => ({ data: [] }));
    const select = vi.fn(() => ({ eq: () => ({ single: async () => ({ data: { storage_path: 'gallery/photo.jpg' } }) }) }));
    const deleteRecord = vi.fn(() => ({ eq: async () => ({ data: [] }) }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({ select, delete: deleteRecord })),
        storage: { from: () => ({ remove }) },
      },
    });

    await repository.deletePhoto('photo-1');

    expect(select).toHaveBeenCalledWith('storage_path');
    expect(deleteRecord).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith(['gallery/photo.jpg']);
  });

  it('surfaces a photo storage cleanup failure after metadata deletion', async () => {
    const remove = vi.fn(async () => ({ error: new Error('Storage unavailable') }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: { storage_path: 'gallery/photo.jpg' } }) }) }),
          delete: () => ({ eq: async () => ({ data: [] }) }),
        })),
        storage: { from: () => ({ remove }) },
      },
    });

    await expect(repository.deletePhoto('photo-1')).rejects.toThrow('Unable to remove photo image from storage.');
  });

  it('collects category photo paths before cascading metadata deletion and removes them', async () => {
    const remove = vi.fn(async () => ({ data: [] }));
    const photoSelect = vi.fn(() => ({ eq: async () => ({ data: [
      { storage_path: 'gallery/first.jpg' },
      { storage_path: null },
      { storage_path: 'gallery/second.jpg' },
    ] }) }));
    const deleteCategory = vi.fn(() => ({ eq: async () => ({ data: [] }) }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn((table) => table === 'gallery_photos'
          ? { select: photoSelect }
          : { delete: deleteCategory }),
        storage: { from: () => ({ remove }) },
      },
    });

    await repository.deleteCategory('category-1');

    expect(photoSelect).toHaveBeenCalledWith('storage_path');
    expect(deleteCategory).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith(['gallery/first.jpg', 'gallery/second.jpg']);
  });

  it('rolls back a newly uploaded replacement when hero metadata update fails', async () => {
    const remove = vi.fn(async () => ({ data: [] }));
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: async () => ({ error: new Error('Metadata update unavailable') }) }) }) }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: { storage_path: 'hero/old.jpg' } }) }) }),
          update,
        })),
        storage: { from: () => ({ remove }) },
      },
    });

    await expect(repository.updateHeroSlide('hero-1', {
      imageUrl: 'https://cdn.example/new.jpg',
      storagePath: 'hero/new.jpg',
    })).rejects.toThrow('Metadata update unavailable');

    expect(remove).toHaveBeenCalledWith(['hero/new.jpg']);
  });

  it('removes the old hero storage object after replacement metadata succeeds', async () => {
    const remove = vi.fn(async () => ({ data: [] }));
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'hero-1' } }) }) }) }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: { storage_path: 'hero/old.jpg' } }) }) }),
          update,
        })),
        storage: { from: () => ({ remove }) },
      },
    });

    await repository.updateHeroSlide('hero-1', {
      imageUrl: 'https://cdn.example/new.jpg',
      storagePath: 'hero/new.jpg',
    });

    expect(update).toHaveBeenCalledWith({
      image_url: 'https://cdn.example/new.jpg',
      storage_path: 'hero/new.jpg',
    });
    expect(remove).toHaveBeenCalledWith(['hero/old.jpg']);
  });

  it('surfaces old hero storage cleanup failures after replacement metadata succeeds', async () => {
    const remove = vi.fn(async () => ({ error: new Error('Old object unavailable') }));
    const repository = createContentRepository({
      configured: true,
      client: {
        from: vi.fn(() => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: { storage_path: 'hero/old.jpg' } }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'hero-1' } }) }) }) }),
        })),
        storage: { from: () => ({ remove }) },
      },
    });

    await expect(repository.updateHeroSlide('hero-1', {
      imageUrl: 'https://cdn.example/new.jpg',
      storagePath: 'hero/new.jpg',
    })).rejects.toThrow('Unable to remove previous hero slide image from storage.');
  });
});
