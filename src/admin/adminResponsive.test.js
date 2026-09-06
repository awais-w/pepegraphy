import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(new URL('./admin.css', import.meta.url), 'utf8');

function mediaBlock(query) {
  const marker = `@media (max-width: ${query})`;
  const start = stylesheet.indexOf(marker);
  const end = stylesheet.indexOf('\n}', start);

  return stylesheet.slice(start, end === -1 ? stylesheet.length : end);
}

describe('responsive admin sidebar layout', () => {
  it('aligns logo, language controls, sign out, and hamburger menu in the first row for tablet and mobile viewports', () => {
    const topSidebar = mediaBlock('62rem');

    expect(topSidebar).toContain('flex-direction: row;');
    expect(topSidebar).toContain('.admin-brand {\n    order: 1;');
    expect(topSidebar).toContain('.admin-sidebar-controls {\n    order: 2;');
    expect(topSidebar).toContain('.admin-hamburger-button {');
    expect(topSidebar).toContain('.admin-navigation {\n    order: 3;');
    expect(topSidebar).toContain('.admin-navigation-closed {');
    expect(topSidebar).toContain('.admin-navigation-open {');
  });

  it('adjusts branding font size and workspace padding on narrow viewports', () => {
    const narrowSidebar = mediaBlock('44rem');

    expect(narrowSidebar).toContain('.admin-brand strong { font-size: 1.1rem; }');
    expect(narrowSidebar).toContain('.admin-workspace { padding: 1.25rem 1rem 2rem; }');
  });
});
