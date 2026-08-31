// @vitest-environment jsdom
// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React, { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultContent } from '../lib/contentModel';

const repository = vi.hoisted(() => ({
  getLoadError: vi.fn(),
  loadContent: vi.fn(),
}));

vi.mock('../lib/contentRepository', () => ({ contentRepository: repository }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { ContentProvider, useContent } from './ContentContext';

function ContentProbe({ onValue }) {
  const value = useContent();
  useEffect(() => { onValue(value); }, [onValue, value]);
  return null;
}

describe('ContentProvider', () => {
  let container;
  let root;

  afterEach(async () => {
    if (root) await act(async () => { root.unmount(); });
    container?.remove();
    root = undefined;
    container = undefined;
    vi.clearAllMocks();
  });

  it('exposes fallback content and the load error after a failed CMS load', async () => {
    const fallbackError = new Error('Network unavailable');
    const values = [];
    repository.loadContent.mockResolvedValue(defaultContent);
    repository.getLoadError.mockReturnValue(fallbackError);
    container = document.createElement('div');
    document.body.append(container);

    await act(async () => {
      root = createRoot(container);
      root.render(<ContentProvider><ContentProbe onValue={(value) => values.push(value)} /></ContentProvider>);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(values.at(-1).content).toEqual(defaultContent);
    expect(values.at(-1).error).toBe(fallbackError);
  });
});
