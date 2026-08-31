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
      client: { from: vi.fn(() => ({ select: async () => ({ error: new Error('Network unavailable') }) })) },
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

    await expect(repository.createHeroSlide({
      imageUrl: '/hero.jpg', storagePath: 'hero/test.jpg',
    })).rejects.toThrow('Unable to clean up uploaded image');
  });
});
