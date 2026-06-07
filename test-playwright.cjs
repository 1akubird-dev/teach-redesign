const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<div>Hello World</div>');
  const loc = page.locator('div');
  console.log(typeof loc.selectText);
  await browser.close();
})();
