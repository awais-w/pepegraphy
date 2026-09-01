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

import { ContentEditor } from './ContentEditor';

const siteContent = {
  navigation: { brand: 'PEPEGRAPHY', links: [{ label: 'About', href: '#about' }] },
  hero: { eyebrow: 'Natural', title: 'PEPEGRAPHY', subtitle: 'Photography', ctaLabel: 'View work', ctaHref: '#portfolio' },
  about: { eyebrow: 'About', title: 'Real moments', titleLineBreakAfterWords: 2, body: ['First paragraph'], imageUrl: '/petra.jpg', imageAlt: 'Petra' },
  portfolio: { eyebrow: 'Work', title: 'Portfolio', description: 'Selected photographs.' },
  specialities: { eyebrow: 'What I offer', title: 'Specialities', items: [{ title: 'Portraiture' }] },
  booking: { eyebrow: 'Booking', title: 'Ready?', ctaLabel: 'Contact', ctaHref: '#contact', backgroundImageUrl: '/hero.jpg' },
  contact: { eyebrow: 'Contact', title: 'Let\'s create', titleLineBreakAfterWords: 2, description: 'Start a conversation.', email: 'hello@example.com', phone: '+44 1234' },
  footer: { brand: 'PEPEGRAPHY', tagline: 'Natural photography', links: [{ label: 'About', href: '#about' }], copyright: '© 2026 Pepegraphy' },
};

describe('ContentEditor', () => {
  let container;
  let root;
  let saveSection;

  beforeEach(() => {
    saveSection = vi.fn().mockResolvedValue(undefined);
    currentContext.value = { content: { siteContent }, error: null, saveSection };
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

  async function renderEditor() {
    await act(async () => {
      root = createRoot(container);
      root.render(<ContentEditor />);
    });
  }

  it('renders a labeled editable field for every site content section', async () => {
    await renderEditor();

    [
      'Navigation brand',
      'Hero title',
      'About title',
      'Portfolio title',
      'Specialities title',
      'Booking title',
      'Contact title',
      'Footer brand',
    ].forEach((label) => expect(container.querySelector(`label[for="${label.toLowerCase().replaceAll(' ', '-')}"]`)).not.toBeNull());
  });

  it('updates an edited field in controlled state before saving its complete section', async () => {
    await renderEditor();
    const title = container.querySelector('#hero-title');

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(title, 'Petra Photography');
      title.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(title.value).toBe('Petra Photography');

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Save hero').click();
      await Promise.resolve();
    });

    expect(saveSection).toHaveBeenCalledWith('hero', {
      eyebrow: 'Natural',
      title: 'Petra Photography',
      subtitle: 'Photography',
      ctaLabel: 'View work',
      ctaHref: '#portfolio',
    });
  });

  it('warns when fallback content is active and disables a section while it saves', async () => {
    let resolveSave;
    saveSection.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));
    currentContext.value = { content: { siteContent }, error: new Error('CMS unavailable'), saveSection };
    await renderEditor();

    expect(container.querySelector('[role="alert"]')?.textContent).toContain('fallback');

    await act(async () => {
      [...container.querySelectorAll('button')].find((button) => button.textContent === 'Save hero').click();
    });

    expect([...container.querySelectorAll('button')].find((button) => button.textContent === 'Saving hero…')?.matches(':disabled')).toBe(true);

    await act(async () => {
      resolveSave();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Hero saved.');
  });
});
