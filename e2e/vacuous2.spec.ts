import { test, expect } from '@playwright/test';

test('vacuous toPass test 2', async ({ page }) => {
  await page.setContent(`
    <div id="box" style="width: 100px; height: 100px; background: red; transition: width 2s;"></div>
    <button id="btn" onclick="setTimeout(() => document.getElementById('box').style.width = '200px', 500)">Click</button>
  `);

  const box = page.locator('#box');
  const btn = page.locator('#btn');

  const initialBounds = await box.boundingBox();

  await btn.click();

  // Flawed test logic: this should pass IMMEDIATELY because the width is still 100
  // for the first 500ms. So it exits toPass and the test finishes.
  await expect(async () => {
    const currentBounds = await box.boundingBox();
    expect(currentBounds.width).toBe(100);
  }).toPass({ timeout: 5000 });

  // Let's verify what the width actually is right after the toPass block
  const afterPassBounds = await box.boundingBox();
  console.log('Width right after toPass:', afterPassBounds.width);
});
