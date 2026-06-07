import { test, expect } from '@playwright/test';

test.describe('Tier 4: Scenario 5', () => {
  test('Complete session interacting with visual elements without distraction', async ({ page }) => {
    // 1. Open the application.
    // Assuming books mode is the default or we navigate directly there
    await page.goto('/');

    // Ensure we are in books mode for visual interaction
    const sidebarToggle = page.getByTestId('sidebar-toggle');
    await sidebarToggle.click();
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('nav-books-mode').click();

    // 2. Verify the Thematic UI is active.
    // E.g., checking for the particle background canvas and dark mode class.
    const particleCanvas = page.getByTestId('particle-background');
    await expect(particleCanvas).toBeVisible();
    
    // Check for a specific dark mode class on body or html
    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-dark/);

    // 3. Ensure the Sidebar is collapsed to provide a distraction-free environment.
    // If it's open, close it
    await sidebarToggle.click();
    await expect(sidebarToggle).toHaveAttribute('aria-expanded', 'false');
    
    // Ensure navigation links are hidden
    const navLinks = page.getByTestId('nav-books-mode');
    await expect(navLinks).toBeHidden();

    // 4. Interact with a 3D Book Cover and click it to open.
    const bookCover = page.getByTestId('book-item').first();
    // Hover over it to simulate visual interaction
    await bookCover.hover();
    await bookCover.click();

    // 5. Verify the Flip-open animation resolves into the Book Detail Split-View.
    await expect(bookCover).toHaveClass(/is-open/);
    const splitViewContainer = page.getByTestId('split-view-container');
    await expect(splitViewContainer).toBeVisible();

    // 6. Verify that no distracting elements (like the sidebar menu items) are visible during reading.
    await expect(navLinks).toBeHidden();
    
    // Make sure split view takes up appropriate space indicating distraction free
    // E.g. sidebar container is collapsed
    const sidebarContainer = page.getByTestId('sidebar-container');
    await expect(sidebarContainer).toHaveClass(/is-collapsed/);
  });
});
