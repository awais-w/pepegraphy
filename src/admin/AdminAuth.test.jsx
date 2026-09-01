// @vitest-environment jsdom
// eslint-disable-next-line no-unused-vars -- required by Vitest's classic JSX transform.
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabaseClient: { auth },
}));

vi.mock('./ContentEditor', () => ({ ContentEditor: () => null }));
vi.mock('./HeroManager', () => ({ HeroManager: () => null }));
vi.mock('./GalleryManager', () => ({ GalleryManager: () => null }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import AdminApp from './AdminApp';

describe('Admin authentication gate', () => {
  let container;
  let root;

  beforeEach(() => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
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

  async function renderAdmin() {
    await act(async () => {
      root = createRoot(container);
      root.render(<AdminApp />);
      await Promise.resolve();
    });
  }

  it('shows email and password fields when no admin session exists', async () => {
    await renderAdmin();

    expect(container.querySelector('input[type="email"]')).not.toBeNull();
    expect(container.querySelector('input[type="password"]')).not.toBeNull();
  });

  it('shows the admin navigation for a signed-in session', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user' } } },
      error: null,
    });

    await renderAdmin();

    expect([...container.querySelectorAll('a')].map((link) => link.textContent)).toEqual(expect.arrayContaining([
      'Content',
      'Hero carousel',
      'Gallery',
    ]));
  });

  it('returns to the sign-in form after signing out', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user' } } },
      error: null,
    });
    auth.signOut.mockResolvedValue({ error: null });

    await renderAdmin();

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Sign out').click();
      await Promise.resolve();
    });

    expect(container.querySelector('input[type="email"]')).not.toBeNull();
  });

  it('shows an alert when sign-out fails for an authenticated admin', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user' } } },
      error: null,
    });
    auth.signOut.mockResolvedValue({ error: new Error('Sign-out service is unavailable.') });

    await renderAdmin();

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Sign out').click();
      await Promise.resolve();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Sign-out service is unavailable.');
  });
});
