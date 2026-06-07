const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set up a mock DOM where toggling the sidebar does NOT resize the split view
  await page.setContent(`
    <div data-testid="sidebar" data-collapsed="false" style="width: 200px;">Sidebar</div>
    <button data-testid="sidebar-toggle">Toggle</button>
    <div data-testid="split-view" style="width: 800px; display: flex;">
      <div data-testid="split-left-pane" style="width: 400px;">Left</div>
      <div data-testid="split-right-pane" style="width: 400px;">Right</div>
    </div>
    <script>
      document.querySelector('[data-testid="sidebar-toggle"]').addEventListener('click', () => {
        const sb = document.querySelector('[data-testid="sidebar"]');
        sb.setAttribute('data-collapsed', sb.getAttribute('data-collapsed') === 'false' ? 'true' : 'false');
        // BUG: We intentionally DO NOT resize split-view here to show the test is flawed
      });
    </script>
  `);

  // --- Run flawed test logic ---
  const sidebarToggle = page.getByTestId('sidebar-toggle');
  const leftPane = page.getByTestId('split-left-pane');
  const rightPane = page.getByTestId('split-right-pane');

  await sidebarToggle.click();
  
  // Flawed test logic checks bounds like this
  let passedFlawed = false;
  try {
    const splitViewBounds = await page.getByTestId('split-view').boundingBox();
    const leftBounds = await leftPane.boundingBox();
    const rightBounds = await rightPane.boundingBox();

    if (leftBounds.width + rightBounds.width <= splitViewBounds.width) {
      if (Math.abs((leftBounds.width / rightBounds.width) - 1) < 0.1) {
        passedFlawed = true;
      }
    }
  } catch (e) {}

  console.log('Flawed test logic passed on broken app:', passedFlawed);

  // --- Run fixed test logic ---
  let passedFixed = false;
  try {
    // Fixed logic would check if split-view width or panes changed size
    const initialWidth = 800; // captured before click
    const splitViewBounds = await page.getByTestId('split-view').boundingBox();
    if (splitViewBounds.width !== initialWidth) {
      passedFixed = true;
    }
  } catch (e) {}

  console.log('Fixed test logic passed on broken app:', passedFixed);

  await browser.close();
})();
