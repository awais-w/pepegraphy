// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Portfolio from './Portfolio';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

const buildPhotos = (count) => Array.from({ length: count }, (_, index) => ({
  id: `photo-${index}`,
  src: `/gallery/img_${index}.jpg`,
  alt: `Photo ${index}`,
  category: 'events',
  sortOrder: index,
}));

describe('Portfolio', () => {
  let container;
  let root;

  afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    root = undefined;
    container = undefined;
    vi.restoreAllMocks();
  });

  const render = async (portfolio) => {
    container = document.createElement('div');
    document.body.append(container);

    await act(async () => {
      root = createRoot(container);
      root.render(<Portfolio portfolio={portfolio} />);
    });
  };

  it('renders every filtered photo instead of capping the grid', async () => {
    await render({
      eyebrow: 'Work',
      title: 'Portfolio',
      descriptionHtml: '<p>Work</p>',
      categories: [{ slug: 'all', name: 'All' }, { slug: 'events', name: 'Events' }],
      images: buildPhotos(14),
    });

    expect(container.querySelectorAll('#portfolio img')).toHaveLength(14);
  });

  it('orders photos by their CMS sort order', async () => {
    const photos = buildPhotos(3);
    await render({
      eyebrow: 'Work',
      title: 'Portfolio',
      descriptionHtml: '<p>Work</p>',
      categories: [{ slug: 'all', name: 'All' }],
      images: [photos[2], photos[0], photos[1]].map((photo, index) => ({ ...photo, sortOrder: [2, 0, 1][index] })),
    });

    const rendered = [...container.querySelectorAll('#portfolio img')].map((image) => image.getAttribute('src'));
    expect(rendered).toEqual(['/gallery/img_0.jpg', '/gallery/img_1.jpg', '/gallery/img_2.jpg']);
  });

  it('shows a placeholder when an image cannot be loaded', async () => {
    await render({
      eyebrow: 'Work',
      title: 'Portfolio',
      descriptionHtml: '<p>Work</p>',
      categories: [{ slug: 'all', name: 'All' }],
      images: buildPhotos(1),
    });

    const image = container.querySelector('#portfolio img');
    await act(async () => {
      image.dispatchEvent(new Event('error', { bubbles: false }));
    });

    expect(container.querySelector('#portfolio img')).toBeNull();
    expect(container.textContent).toContain('Image unavailable');
  });
});
