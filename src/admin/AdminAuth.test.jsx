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

const content = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabaseClient: { auth },
}));

vi.mock('./ContentEditor', () => ({ ContentEditor: () => null }));
vi.mock('./HeroManager', () => ({ HeroManager: () => null }));
vi.mock('./GalleryManager', () => ({ GalleryManager: () => null }));
vi.mock('../context/ContentContext', () => ({ useContent: () => content }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import AdminApp from './AdminApp';
import { LanguageProvider } from '../i18n/LanguageContext';

function renderWithProviders(element) {
  return <LanguageProvider>{element}</LanguageProvider>;
}

describe('Admin authentication gate', () => {
  let container;
  let root;
  let authStateChangeHandler;

  beforeEach(() => {
    window.location.hash = '';
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authStateChangeHandler = undefined;
    auth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeHandler = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });
    content.refresh.mockResolvedValue(undefined);
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
      root.render(renderWithProviders(<AdminApp />));
      await new Promise((resolve) => setTimeout(resolve, 0));
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

  it('gives signed-in administrators a studio navigation rail and a public-site escape link', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user', email: 'editor@example.com' } } },
      error: null,
    });

    await renderAdmin();

    expect(container.querySelector('aside[aria-label="Studio administration"]')).not.toBeNull();
    expect(container.querySelector('.admin-public-link[href="/"]')?.textContent).toContain('View public site');
    expect(container.querySelector('.admin-language-switcher')?.textContent).toContain('EN');
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe('Content');
  });

  it('refreshes content when an administrator session becomes available', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user' } } },
      error: null,
    });

    await renderAdmin();

    expect(content.refresh).toHaveBeenCalledTimes(1);
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

  it('shows an alert and returns to unauthenticated state when sign-in rejects', async () => {
    auth.signInWithPassword.mockRejectedValue(new Error('Sign-in service is unavailable.'));

    await renderAdmin();

    const form = container.querySelector('form');
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Sign-in service is unavailable.');
    expect(container.querySelector('input[type="email"]')).not.toBeNull();
    expect(container.querySelector('button[type="submit"]')?.textContent).toBe('Sign in');
  });

  it('shows an alert and keeps the admin session when sign-out rejects', async () => {
    auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token', user: { id: 'admin-user' } } },
      error: null,
    });
    auth.signOut.mockRejectedValue(new Error('Sign-out service is unavailable.'));

    await renderAdmin();

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Sign out').click();
      await Promise.resolve();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Sign-out service is unavailable.');
    expect(container.querySelector('button')?.textContent).toBe('Sign out');
  });

  it('refreshes content when an authenticated auth state event arrives', async () => {
    await renderAdmin();

    expect(content.refresh).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(authStateChangeHandler).toEqual(expect.any(Function)));

    await act(async () => {
      authStateChangeHandler('SIGNED_IN', { access_token: 'test-token', user: { id: 'admin-user' } });
      await Promise.resolve();
    });

    expect(content.refresh).toHaveBeenCalledTimes(1);
  });
});
