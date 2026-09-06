import { test, expect } from '@playwright/test';

test('gallery category overlays switch to Hungarian', async ({ page }) => {
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173');
  await page.waitForSelector('#portfolio', { timeout: 15000 });

  const categoryButtons = page.locator('#portfolio .flex.flex-wrap.gap-2 button');
  const names = await categoryButtons.allTextContents();
  console.log('EN category names:', JSON.stringify(names, null, 2));

  const imageOverlays = page.locator('#portfolio .group .absolute.inset-0 span');
  const enCaptions = await imageOverlays.allTextContents();
  console.log('EN image captions:', JSON.stringify(enCaptions, null, 2));

  await page.getByRole('button', { name: /HU/i }).click();

  await page.waitForFunction(() => {
    const buttons = document.querySelectorAll('#portfolio .flex.flex-wrap.gap-2 button');
    return Array.from(buttons).every(button => {
      const text = (button.textContent || '').trim();
      return /^(Összes|Női|Férfi|Gyermekek|Háziállat|Bulik|Riport|Természet|Boudoir)$/.test(text);
    });
  }, { timeout: 10000 });

  const huNames = await categoryButtons.allTextContents();
  console.log('HU category names:', JSON.stringify(huNames, null, 2));
  expect(huNames).toEqual(['Összes', 'Női', 'Férfi', 'Gyermekek', 'Háziállat', 'Bulik', 'Riport', 'Természet', 'Boudoir']);

  const huCaptions = await imageOverlays.allTextContents();
  console.log('HU image captions:', JSON.stringify(huCaptions, null, 2));
  expect(huCaptions).toEqual(['Bulik', 'Természet', 'Bulik', 'Háziállat', 'Riport', 'Női', 'Boudoir', 'Gyermekek']);
  expect(errors).toEqual([]);
});
