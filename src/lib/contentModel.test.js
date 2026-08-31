import { describe, expect, it } from 'vitest';
import { moveItem, normalizeContent, slugify } from './contentModel';

describe('content model', () => {
  it('sorts visible hero slides and photos by sort_order', () => {
    const content = normalizeContent({
      heroSlides: [
        { id: 'hero-2', image_url: '/two.jpg', sort_order: 2, is_visible: true },
        { id: 'hero-hidden', image_url: '/hidden.jpg', sort_order: 0, is_visible: false },
        { id: 'hero-1', image_url: '/one.jpg', sort_order: 1, is_visible: true },
      ],
      photos: [
        { id: 'photo-2', image_url: '/two.jpg', sort_order: 2, is_visible: true },
        { id: 'photo-1', image_url: '/one.jpg', sort_order: 1, is_visible: true },
      ],
    });

    expect(content.heroSlides.map((slide) => slide.id)).toEqual(['hero-1', 'hero-2']);
    expect(content.photos.map((photo) => photo.id)).toEqual(['photo-1', 'photo-2']);
  });

  it('slugifies a category name', () => {
    expect(slugify('New Portraits')).toBe('new-portraits');
  });

  it('moves an item up without mutating the input', () => {
    const items = ['a', 'b', 'c'];

    expect(moveItem(items, 1, 'up')).toEqual(['b', 'a', 'c']);
    expect(items).toEqual(['a', 'b', 'c']);
  });
});
