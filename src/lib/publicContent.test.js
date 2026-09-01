import { describe, expect, it } from 'vitest';
import { defaultContent, mergeContent } from './contentModel';
import { buildPublicContent } from './publicContent';

describe('public content adapter', () => {
  it('passes remote hero text and gallery metadata to public section props', () => {
    const content = mergeContent(defaultContent, {
      siteContent: {
        hero: { title: 'Remote photography' },
      },
      heroSlides: [
        {
          id: 'hero-remote',
          image_url: '/remote-hero.jpg',
          alt_text: 'Remote hero photo',
          caption: 'Remote scenes',
          is_visible: true,
        },
      ],
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
    expect(publicContent.hero.slides).toEqual([
      expect.objectContaining({
        id: 'hero-remote',
        src: '/remote-hero.jpg',
        alt: 'Remote hero photo',
        category: 'Remote scenes',
      }),
    ]);
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

  it('excludes hidden hero slides, categories, and photos from public content', () => {
    const publicContent = buildPublicContent(mergeContent(defaultContent, {
      heroSlides: [
        { id: 'hero-visible', image_url: '/visible-hero.jpg', is_visible: true },
        { id: 'hero-hidden', image_url: '/hidden-hero.jpg', is_visible: false },
      ],
      categories: [
        { id: 'category-visible', name: 'Visible', slug: 'visible', is_visible: true },
        { id: 'category-hidden', name: 'Hidden', slug: 'hidden', is_visible: false },
      ],
      photos: [
        { id: 'photo-visible', category_id: 'category-visible', image_url: '/visible.jpg', is_visible: true },
        { id: 'photo-hidden', category_id: 'category-visible', image_url: '/hidden.jpg', is_visible: false },
        { id: 'photo-in-hidden-category', category_id: 'category-hidden', image_url: '/hidden-category.jpg', is_visible: true },
      ],
    }));

    expect(publicContent.hero.slides.map((slide) => slide.id)).toEqual(['hero-visible']);
    expect(publicContent.portfolio.categories).toEqual([
      { slug: 'all', name: 'All' },
      { slug: 'visible', name: 'Visible' },
    ]);
    expect(publicContent.portfolio.images.map((photo) => photo.id)).toEqual(['photo-visible']);
  });

  it('formats editable about and contact titles from their line break metadata', () => {
    const publicContent = buildPublicContent(mergeContent(defaultContent, {
      siteContent: {
        about: {
          title: 'Captured memories that last',
          titleLineBreakAfterWords: 2,
        },
        contact: {
          title: "Let's make something unforgettable",
          titleLineBreakAfterWords: 2,
        },
      },
    }));

    expect(publicContent.about.titleLines).toEqual(['Captured memories', 'that last']);
    expect(publicContent.contact.titleLines).toEqual(["Let's make", 'something unforgettable']);
  });
});
