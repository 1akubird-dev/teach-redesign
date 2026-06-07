import { test, expect } from '@playwright/test';

test('vacuous toPass test', async ({ page }) => {
  await page.setContent(`
    <div id="box" style="width: 100px; height: 100px; background: red; transition: width 2s;"></div>
    <button id="btn" onclick="document.getElementById('box').style.width = '200px'">Click</button>
  `);

  const box = page.locator('#box');
  const btn = page.locator('#btn');

  const initialBounds = await box.boundingBox();
  const initialWidth = initialBounds.width; // 100

  await btn.click();

  // Flawed test logic exactly like the pairwise.spec.ts one
  await expect(async () => {
    const currentBounds = await box.boundingBox();
    // It asserts that the width is close to initial width, which is true IMMEDIATELY after click
    // because the transition takes 2 seconds, or even if it was instantaneous, the first poll might catch it before render.
    // In our case, the test asserts the ratio is the SAME. 
    expect(currentBounds.width).toBeCloseTo(initialWidth, 1);
  }).toPass({ timeout: 5000 });

  // Let's verify what the width actually is right after the toPass block
  const afterPassBounds = await box.boundingBox();
  console.log('Width right after toPass:', afterPassBounds.width);
});
