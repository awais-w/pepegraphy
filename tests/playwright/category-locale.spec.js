import { test, expect } from '@playwright/test';

test('capture gallery categories API response', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  const responsePromise = page.waitForResponse('**/rest/v1/gallery_categories*');

  await page.goto('http://localhost:5173');
  await page.waitForSelector('#portfolio', { timeout: 15000 });

  const response = await responsePromise;
  const categories = await response.json();
  console.log('gallery_categories response count:', categories?.length);
  console.log('gallery_categories first 3:', JSON.stringify(categories?.slice(0, 3), null, 2));

  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('#portfolio .flex.flex-wrap.gap-2 button');
    return Array.from(buttons).some(button => /Female|Male|Children|Pets|Events|Reportage|Nature|Boudoir/.test((button.textContent || '').trim()));
  }, { timeout: 10000 });

  const categoryButtons = page.locator('#portfolio .flex.flex-wrap.gap-2 button');
  const names = await categoryButtons.allTextContents();
  console.log('Category names:', JSON.stringify(names, null, 2));
  console.log('page errors:', errors);

  const hasSlugs = names.filter((name) => name.trim().toLowerCase() !== 'all').some((name) => /^(female|male|children|pet|events|reportage|nature)$/i.test(name.trim()));
  const hasEnglish = names.some((name) => /Female|Male|Children|Pets|Events|Reportage|Nature|Boudoir/.test(name));

  expect(hasSlugs).toBe(false);
  expect(hasEnglish).toBe(true);
});
