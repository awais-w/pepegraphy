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
  about: {
    eyebrow: 'About',
    title: 'Real moments',
    titleLineBreakAfterWords: 2,
    body: ['First paragraph'],
    imageUrl: '/petra.jpg',
    imageAlt: 'Petra',
    stats: [{ value: '8', label: 'Specialities' }],
  },
  portfolio: { eyebrow: 'Work', title: 'Portfolio', description: 'Selected photographs.' },
  specialities: { eyebrow: 'What I offer', title: 'Specialities', items: [{ icon: '✦', title: 'Portraiture', description: 'Natural portraits' }] },
  booking: {
    eyebrow: 'Booking',
    title: 'Ready?',
    features: [{ title: 'No time limits', description: 'Your session lasts as needed.' }],
    ctaLabel: 'Contact',
    ctaHref: '#contact',
    backgroundImageUrl: '/hero.jpg',
  },
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

  function setInputValue(input, value) {
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const buttonByText = (text) => [...container.querySelectorAll('button')].find((button) => button.textContent === text);

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
      'Navigation links',
      'About body',
      'About stats',
      'Specialities items',
      'Booking features',
      'Footer links',
    ].forEach((label) => expect(container.querySelector(`label[for="${label.toLowerCase().replaceAll(' ', '-')}"]`)).not.toBeNull());
  });

  it('updates an edited field in controlled state before saving its complete section', async () => {
    await renderEditor();
    const title = container.querySelector('#hero-title');

    await act(async () => {
      setInputValue(title, 'Petra Photography');
    });

    expect(title.value).toBe('Petra Photography');

    await act(async () => {
      buttonByText('Save hero').click();
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

  it('preserves complete nested section content when saving a JSON field edit', async () => {
    await renderEditor();
    const stats = container.querySelector('#about-stats');

    expect(stats).not.toBeNull();

    await act(async () => {
      setInputValue(stats, '[\n  { "value": "10", "label": "Years" }\n]');
    });

    await act(async () => {
      buttonByText('Save about').click();
      await Promise.resolve();
    });

    expect(saveSection).toHaveBeenCalledWith('about', {
      eyebrow: 'About',
      title: 'Real moments',
      titleLineBreakAfterWords: 2,
      body: ['First paragraph'],
      imageUrl: '/petra.jpg',
      imageAlt: 'Petra',
      stats: [{ value: '10', label: 'Years' }],
    });
  });

  it('rejects syntactically valid JSON that does not match the navigation links shape', async () => {
    await renderEditor();
    const links = container.querySelector('#navigation-links');

    await act(async () => {
      setInputValue(links, '{ "label": "About", "href": "#about" }');
    });

    await act(async () => {
      buttonByText('Save navigation').click();
      await Promise.resolve();
    });

    expect(saveSection).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('JSON array of link objects');
  });

  it('warns when fallback content is active and disables a section while it saves', async () => {
    let resolveSave;
    saveSection.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));
    currentContext.value = { content: { siteContent }, error: new Error('CMS unavailable'), saveSection };
    await renderEditor();

    expect(container.querySelector('[role="alert"]')?.textContent).toContain('fallback');

    await act(async () => {
      buttonByText('Save hero').click();
    });

    expect(buttonByText('Saving hero…')?.matches(':disabled')).toBe(true);

    await act(async () => {
      resolveSave();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Hero saved.');
  });

  it('surfaces a rejected save as an alert without showing a fallback warning', async () => {
    saveSection.mockRejectedValue(new Error('Content service rejected update.'));
    await renderEditor();

    await act(async () => {
      buttonByText('Save hero').click();
      await Promise.resolve();
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Content service rejected update.');
    expect(container.textContent).not.toContain('fallback content');
  });

  it('keeps every saving section disabled until that section request completes', async () => {
    const resolveSave = {};
    saveSection.mockImplementation((sectionKey) => new Promise((resolve) => { resolveSave[sectionKey] = resolve; }));
    await renderEditor();

    await act(async () => {
      buttonByText('Save hero').click();
    });
    await act(async () => {
      buttonByText('Save contact').click();
    });

    expect(buttonByText('Saving hero…')?.matches(':disabled')).toBe(true);
    expect(buttonByText('Saving contact…')?.matches(':disabled')).toBe(true);

    await act(async () => {
      resolveSave.hero();
      await Promise.resolve();
    });

    expect(buttonByText('Save hero')?.matches(':disabled')).toBe(false);
    expect(buttonByText('Saving contact…')?.matches(':disabled')).toBe(true);
  });
});
