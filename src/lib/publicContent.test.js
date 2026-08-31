import { describe, expect, it } from 'vitest';
import { defaultContent, mergeContent } from './contentModel';
import { buildPublicContent } from './publicContent';

describe('public content adapter', () => {
  it('passes remote hero text and gallery metadata to public section props', () => {
    const content = mergeContent(defaultContent, {
      siteContent: {
        hero: { title: 'Remote photography' },
      },
      categories: [
        { id: 'category-events', name: 'Live events', slug: 'live-events', is_visible: true },
      ],
      photos: [
        {
          id: 'photo-remote',
          category_id: 'category-events',
          image_url: '/remote-gallery.jpg',
          alt_text: 'Remote gallery photo',
          is_visible: true,
        },
      ],
    });

    const publicContent = buildPublicContent(content);

    expect(publicContent.hero.title).toBe('Remote photography');
    expect(publicContent.portfolio.images).toEqual([
      expect.objectContaining({
        id: 'photo-remote',
        src: '/remote-gallery.jpg',
        alt: 'Remote gallery photo',
        category: 'live-events',
      }),
    ]);
    expect(publicContent.portfolio.categories).toEqual([
      { slug: 'all', name: 'All' },
      { slug: 'live-events', name: 'Live events' },
    ]);
  });

  it('keeps bundled section and gallery defaults when the remote response is empty', () => {
    const publicContent = buildPublicContent(mergeContent(defaultContent, {}));

    expect(publicContent.hero.title).toBe('PEPEGRAPHY');
    expect(publicContent.portfolio.images).toContainEqual(expect.objectContaining({
      src: '/gallery/img_1.jpg',
      alt: 'Stage performance event',
      category: 'events',
    }));
  });
});
