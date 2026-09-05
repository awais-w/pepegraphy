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
  it('keeps the top-positioned sidebar header controls together and lets navigation wrap below', () => {
    const topSidebar = mediaBlock('62rem');

    expect(topSidebar).toContain('flex-direction: row;');
    expect(topSidebar).toContain('.admin-brand {\n    order: 1;');
    expect(topSidebar).toContain('.admin-sidebar-footer {\n    order: 3;');
    expect(topSidebar).toContain('margin-inline-start: auto;');
    expect(topSidebar).toContain('.admin-account-avatar { display: none; }');
    expect(topSidebar).toContain('.admin-account { border: 0; display: flex; gap: 0; padding: 0; }');
    expect(topSidebar).toContain('.admin-navigation {\n    order: 2;');
    expect(topSidebar).toContain('flex: 1 1 max-content;');
    expect(topSidebar).toContain('max-width: 100%;');
    expect(topSidebar).not.toContain('flex: 0 0 100%;');
  });

  it('keeps overflow handling scoped to the narrower top-sidebar breakpoint', () => {
    const narrowSidebar = mediaBlock('44rem');

    expect(narrowSidebar).toContain('.admin-navigation {');
    expect(narrowSidebar).toContain('flex: 0 0 100%;');
    expect(narrowSidebar).toContain('overflow-x: auto;');
    expect(narrowSidebar).toContain('min-width: 0;');
  });

  it('prioritises navigation wrapping below the header controls when the top row gets tighter', () => {
    const wrappedSidebar = mediaBlock('56rem');

    expect(wrappedSidebar).toContain('.admin-sidebar-footer { order: 2;');
    expect(wrappedSidebar).toContain('.admin-navigation {\n    order: 3;');
    expect(wrappedSidebar).toContain('flex: 0 0 100%;');
  });
});
