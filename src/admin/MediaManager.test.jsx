// @vitest-environment jsdom
// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const currentContext = vi.hoisted(() => ({ value: null }));

vi.mock('../context/ContentContext', () => ({
  useContent: () => currentContext.value,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { GalleryManager } from './GalleryManager';
import { HeroManager } from './HeroManager';

const imageFile = () => new File(['image-data'], 'portrait.jpg', { type: 'image/jpeg' });

function setInputValue(input, value) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function selectFile(input, file) {
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('media managers', () => {
  let container;
  let root;
  let mutations;

  beforeEach(() => {
    mutations = {
      uploadImage: vi.fn().mockResolvedValue({ path: 'hero/portrait.jpg', url: 'https://cdn.example/portrait.jpg' }),
      createHeroSlide: vi.fn().mockResolvedValue(undefined),
      updateHeroSlide: vi.fn().mockResolvedValue(undefined),
      deleteHeroSlide: vi.fn().mockResolvedValue(undefined),
      createCategory: vi.fn().mockResolvedValue({ id: 'family', name: 'Family Portraits', slug: 'family-portraits' }),
      updateCategory: vi.fn().mockResolvedValue(undefined),
      deleteCategory: vi.fn().mockResolvedValue(undefined),
      createPhoto: vi.fn().mockResolvedValue(undefined),
      updatePhoto: vi.fn().mockResolvedValue(undefined),
      deletePhoto: vi.fn().mockResolvedValue(undefined),
    };
    currentContext.value = {
      content: { heroSlides: [], categories: [], photos: [] },
      error: null,
      ...mutations,
    };
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    root = undefined;
    container = undefined;
    vi.clearAllMocks();
  });

  async function render(Component) {
    await act(async () => {
      root = createRoot(container);
      root.render(<Component />);
    });
  }

  const buttonByText = (text) => [...container.querySelectorAll('button')].find((button) => button.textContent === text);

  it('uploads a hero slide using its uploaded URL and alternative text', async () => {
    await render(HeroManager);
    const file = imageFile();

    await act(async () => {
      setInputValue(container.querySelector('#new-hero-alt-text'), 'A parent holding a child');
      selectFile(container.querySelector('#new-hero-image'), file);
    });

    await act(async () => {
      buttonByText('Upload hero slide').click();
      await Promise.resolve();
    });

    expect(mutations.uploadImage).toHaveBeenCalledWith(file, 'hero');
    expect(mutations.createHeroSlide).toHaveBeenCalledWith({
      imageUrl: 'https://cdn.example/portrait.jpg',
      storagePath: 'hero/portrait.jpg',
      altText: 'A parent holding a child',
      caption: '',
      sortOrder: 0,
      isVisible: true,
    });
  });

  it('shows the derived slug when creating a category', async () => {
    await render(GalleryManager);

    await act(async () => {
      setInputValue(container.querySelector('#new-category-name'), 'Family Portraits');
    });

    expect(container.textContent).toContain('family-portraits');

    await act(async () => {
      buttonByText('Create category').click();
      await Promise.resolve();
    });

    expect(mutations.createCategory).toHaveBeenCalledWith('Family Portraits');
  });

  it('creates a photo associated with the selected category', async () => {
    currentContext.value.content = {
      heroSlides: [],
      categories: [
        { id: 'family', name: 'Family', slug: 'family', sortOrder: 0, isVisible: true },
        { id: 'portraits', name: 'Portraits', slug: 'portraits', sortOrder: 1, isVisible: true },
      ],
      photos: [],
    };
    await render(GalleryManager);
    const file = imageFile();

    await act(async () => {
      container.querySelector('#photo-category').value = 'portraits';
      container.querySelector('#photo-category').dispatchEvent(new Event('change', { bubbles: true }));
      setInputValue(container.querySelector('#new-photo-alt-text'), 'Studio portrait');
      selectFile(container.querySelector('#new-photo-image'), file);
    });

    await act(async () => {
      buttonByText('Upload photo').click();
      await Promise.resolve();
    });

    expect(mutations.uploadImage).toHaveBeenCalledWith(file, 'gallery');
    expect(mutations.createPhoto).toHaveBeenCalledWith({
      categoryId: 'portraits',
      imageUrl: 'https://cdn.example/portrait.jpg',
      storagePath: 'hero/portrait.jpg',
      altText: 'Studio portrait',
      sortOrder: 0,
      isVisible: true,
    });
  });

  it('requires confirmation before deleting a hero slide', async () => {
    currentContext.value.content.heroSlides = [
      { id: 'hero-1', src: '/hero.jpg', alt: 'Hero', caption: '', sortOrder: 0, isVisible: true },
    ];
    await render(HeroManager);

    await act(async () => {
      buttonByText('Delete hero slide').click();
    });

    expect(mutations.deleteHeroSlide).not.toHaveBeenCalled();
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('Delete hero slide?');

    await act(async () => {
      buttonByText('Delete').click();
      await Promise.resolve();
    });

    expect(mutations.deleteHeroSlide).toHaveBeenCalledWith('hero-1');
  });
});
