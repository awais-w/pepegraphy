// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Hero from './Hero';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.React = React;

describe('Hero', () => {
  let container;
  let root;

  afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    root = undefined;
    container = undefined;
    vi.restoreAllMocks();
  });

  it('renders a text and gradient hero without carousel behavior when slides are empty', async () => {
    const setInterval = vi.spyOn(globalThis, 'setInterval');
    container = document.createElement('div');
    document.body.append(container);

    await act(async () => {
      root = createRoot(container);
      root.render(<Hero hero={{
        eyebrow: 'Natural',
        title: 'PEPEGRAPHY',
        subtitle: 'Photography',
        ctaLabel: 'View portfolio',
        ctaHref: '#portfolio',
        slides: [],
      }} />);
    });

    expect(container.textContent).toContain('PEPEGRAPHY');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[aria-label="Previous slide"]')).toBeNull();
    expect(container.querySelector('[aria-label="Next slide"]')).toBeNull();
    expect(setInterval).not.toHaveBeenCalledWith(expect.any(Function), 6000);
  });
});
