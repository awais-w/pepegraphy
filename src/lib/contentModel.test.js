import { describe, expect, it } from 'vitest';
import { defaultContent, mergeContent, moveItem, normalizeContent, slugify } from './contentModel';

describe('content model', () => {
  it('keeps hidden media records for authenticated content consumers while retaining visibility', () => {
    const content = normalizeContent({
      heroSlides: [
        { id: 'hero-2', image_url: '/two.jpg', sort_order: 2, is_visible: true },
        { id: 'hero-hidden', image_url: '/hidden.jpg', sort_order: 0, is_visible: false },
        { id: 'hero-1', image_url: '/one.jpg', sort_order: 1, is_visible: true },
      ],
      categories: [
        { id: 'category-hidden', name: 'Hidden', is_visible: false },
        { id: 'category-visible', name: 'Visible', is_visible: true },
      ],
      photos: [
        { id: 'photo-2', image_url: '/two.jpg', sort_order: 2, is_visible: true },
        { id: 'photo-hidden', image_url: '/hidden.jpg', sort_order: 0, is_visible: false },
        { id: 'photo-1', image_url: '/one.jpg', sort_order: 1, is_visible: true },
      ],
    });

    expect(content.heroSlides.map((slide) => slide.id)).toEqual(['hero-hidden', 'hero-1', 'hero-2']);
    expect(content.heroSlides[0].isVisible).toBe(false);
    expect(content.categories.map((category) => category.id)).toEqual(['category-hidden', 'category-visible']);
    expect(content.categories[0].isVisible).toBe(false);
    expect(content.photos.map((photo) => photo.id)).toEqual(['photo-hidden', 'photo-1', 'photo-2']);
    expect(content.photos[0].isVisible).toBe(false);
  });

  it('preserves empty remote media collections instead of restoring bundled media', () => {
    const content = mergeContent(defaultContent, {
      heroSlides: [],
      categories: [],
      photos: [],
    });

    expect(content.heroSlides).toEqual([]);
    expect(content.categories).toEqual([]);
    expect(content.photos).toEqual([]);
  });

  it('keeps valid section fields while restoring malformed structured fields from the fallback', () => {
    const content = mergeContent(defaultContent, {
      siteContent: {
        navigation: { brand: 'CMS brand', links: { label: 'About' } },
        about: { title: 'CMS title', body: 'Not an array', stats: [{ value: '10', label: 'Years' }] },
        specialities: { items: [{ title: 'Incomplete' }] },
        booking: { features: { title: 'Not an array' } },
        footer: { tagline: 'CMS tagline', links: [{ label: 'Contact', href: '#contact' }] },
      },
    });

    expect(content.siteContent.navigation).toEqual({
      brand: 'CMS brand',
      links: defaultContent.siteContent.navigation.links,
    });
    expect(content.siteContent.about).toMatchObject({
      title: 'CMS title',
      body: defaultContent.siteContent.about.body,
      stats: [{ value: '10', label: 'Years' }],
    });
    expect(content.siteContent.specialities.items).toEqual(defaultContent.siteContent.specialities.items);
    expect(content.siteContent.booking.features).toEqual(defaultContent.siteContent.booking.features);
    expect(content.siteContent.footer).toMatchObject({
      tagline: 'CMS tagline',
      links: [{ label: 'Contact', href: '#contact' }],
    });
  });

  it('uses input position when sort_order is null or empty', () => {
    const content = normalizeContent({
      heroSlides: [
        { id: 'hero-explicit-late', image_url: '/late.jpg', sort_order: 3 },
        { id: 'hero-explicit-early', image_url: '/early.jpg', sort_order: 1 },
        { id: 'hero-null', image_url: '/null.jpg', sort_order: null },
        { id: 'hero-empty', image_url: '/empty.jpg', sort_order: '' },
      ],
    });

    expect(content.heroSlides.map((slide) => slide.id)).toEqual([
      'hero-explicit-early',
      'hero-null',
      'hero-explicit-late',
      'hero-empty',
    ]);
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
