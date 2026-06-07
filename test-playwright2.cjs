const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<div id="foo">Hello World</div>');
  const loc = page.locator('div');
  await loc.selectText();
  const selection = await page.evaluate(() => window.getSelection().toString());
  console.log("SELECTION:", selection);
  await browser.close();
})();
