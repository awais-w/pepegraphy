import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getLanguageFromPath } from './i18n/languagePath';

// Helpers to simulate URL state in jsdom
function setPathname(pathname) {
  delete window.location;
  window.location = { pathname, hash: '' };
}

describe('getLanguageFromPath', () => {
  it('returns en for /en', () => {
    expect(getLanguageFromPath('/en')).toBe('en');
  });

  it('returns hu for /hu', () => {
    expect(getLanguageFromPath('/hu')).toBe('hu');
  });

  it('returns en for /en/about', () => {
    expect(getLanguageFromPath('/en/about')).toBe('en');
  });

  it('returns hu for /hu/portfolio', () => {
    expect(getLanguageFromPath('/hu/portfolio')).toBe('hu');
  });

  it('returns null for /', () => {
    expect(getLanguageFromPath('/')).toBeNull();
  });

  it('returns null for /about', () => {
    expect(getLanguageFromPath('/about')).toBeNull();
  });

  it('returns null for /admin', () => {
    expect(getLanguageFromPath('/admin')).toBeNull();
  });

  it('returns null for unknown prefixes like /de', () => {
    expect(getLanguageFromPath('/de')).toBeNull();
  });

  it('returns null for /en-de', () => {
    expect(getLanguageFromPath('/en-de')).toBeNull();
  });
});