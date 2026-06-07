import { test, expect } from '@playwright/test';

test.describe('Tier 2 E2E: Milestone 2 Boundary & Corner Cases', () => {

  test.beforeEach(async ({ page }) => {
    // Assuming the app runs at the root URL
    await page.goto('/');
  });

  // ==========================================
  // F4: Thematic UI (Particle background, gray dark mode)
  // ==========================================
  test.describe('F4: Thematic UI', () => {
    test('particle canvas covers the entire screen on very large viewports', async ({ page }) => {
      // Test extreme large viewport
      await page.setViewportSize({ width: 3840, height: 2160 }); // 4K resolution
      
      const canvas = page.locator('[data-testid="particle-background"], canvas.particle-bg').first();
      // Ensure canvas exists and is visible
      await expect(canvas).toBeVisible();
      
      // Check bounding box covers the entire viewport
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(3840);
      expect(box!.height).toBeGreaterThanOrEqual(2160);
    });

    test('particle background maintains stability during rapid resize', async ({ page }) => {
      const canvas = page.locator('[data-testid="particle-background"], canvas.particle-bg').first();
      await expect(canvas).toBeVisible();

      // Rapidly resize the viewport to simulate chaotic user interaction
      for (let i = 0; i < 5; i++) {
        await page.setViewportSize({ width: 800 + (i * 100), height: 600 + (i * 50) });
        await page.waitForTimeout(50);
      }
      
      // Canvas should still be visible and sized appropriately
      await expect(canvas).toBeVisible();
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(1200);
      expect(box!.height).toBe(800);
    });

    test('ensures gray dark mode does not use pure black for main backgrounds', async ({ page }) => {
      // Wait for app to be loaded
      await page.waitForSelector('body');
      
      // Get computed background color of the body or main element
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Should not be pure black rgb(0, 0, 0) or rgba(0, 0, 0, 1)
      expect(bgColor).not.toBe('rgb(0, 0, 0)');
      expect(bgColor).not.toBe('rgba(0, 0, 0, 1)');
      
      // Expect some variation of dark gray (e.g. slate, charcoal)
      const rgbValues = bgColor.match(/\d+/g);
      expect(rgbValues).not.toBeNull();
      expect(rgbValues!.length).toBeGreaterThanOrEqual(3);
      
      const sum = parseInt(rgbValues![0]) + parseInt(rgbValues![1]) + parseInt(rgbValues![2]);
      // Sum should be > 0 (not pure black) but dark
      expect(sum).toBeGreaterThan(0);
      expect(sum).toBeLessThan(150);
    });

    test('particles do not overlap or interfere with interactive UI elements', async ({ page }) => {
      const canvas = page.locator('[data-testid="particle-background"], canvas.particle-bg').first();
      await expect(canvas).toBeVisible();
      
      const pointerEvents = await canvas.evaluate((el) => window.getComputedStyle(el).pointerEvents);
      const zIndex = await canvas.evaluate((el) => window.getComputedStyle(el).zIndex);
      
      // It must either have pointer-events none OR a negative zIndex relative to main UI
      const isNonInteractive = pointerEvents === 'none' || parseInt(zIndex) < 0 || zIndex === 'auto';
      expect(isNonInteractive).toBeTruthy();
    });

    test('typography system handles text scaling on extreme zoom levels', async ({ page }) => {
      // Emulate extreme font scaling or zoom
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '32px';
      });
      
      const mainContent = page.locator('main').first();
      await expect(mainContent).toBeVisible();

      // UI should not have horizontal scrolling on main viewport if layout is robust
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
      
      // Reset
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '';
      });
    });
  });

  // ==========================================
  // F5: 3D Book Covers & Flip-open animation
  // ==========================================
  test.describe('F5: 3D Book Covers', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Books/Library mode
      const libraryLink = page.locator('[data-testid="nav-library"], a[href="/library"]').first();
      await expect(libraryLink).toBeVisible();
      await libraryLink.click();
      
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();
    });

    test('rapidly clicking a book during flip-open animation does not cause erratic state', async ({ page }) => {
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();

      // Rapidly click the book 5 times
      for (let i = 0; i < 5; i++) {
        await book.click();
      }
      
      // Should eventually stabilize and open the book detail view
      const detailView = page.locator('[data-testid="book-detail-view"], .book-detail').first();
      await expect(detailView).toBeVisible({ timeout: 10000 });
    });

    test('3D book cover gracefully truncates or wraps exceptionally long titles', async ({ page }) => {
      const bookTitle = page.locator('[data-testid="book-title"], .book-title').first();
      await expect(bookTitle).toBeVisible();
      
      // The element should have text-overflow: ellipsis or be hidden
      const overflowStyle = await bookTitle.evaluate((node) => window.getComputedStyle(node).textOverflow);
      const hiddenStyle = await bookTitle.evaluate((node) => window.getComputedStyle(node).overflow);
      
      expect(overflowStyle === 'ellipsis' || hiddenStyle === 'hidden' || hiddenStyle === 'clip').toBeTruthy();
    });

    test('keyboard interaction (Enter/Space) triggers flip-open animation and routes correctly', async ({ page }) => {
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();
      
      await book.focus();
      await expect(book).toBeFocused();
      
      // Press Enter to trigger open
      await page.keyboard.press('Enter');
      
      // Verify transition to detail view
      const detailView = page.locator('[data-testid="book-detail-view"], .book-detail').first();
      await expect(detailView).toBeVisible({ timeout: 5000 });
    });

    test('navigating back during flip-open animation aborts gracefully', async ({ page }) => {
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();
      
      // Click and immediately go back
      await book.click();
      await page.goBack();
      
      // Should remain or return to library view
      await expect(book).toBeVisible();
    });

    test('extremely wide library grid layouts maintain book aspect ratio constraints', async ({ page }) => {
      await page.setViewportSize({ width: 3000, height: 1000 });
      
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();
      
      const box = await book.boundingBox();
      expect(box).not.toBeNull();
      
      // Typical book aspect ratio is around 1:1.4 to 1:1.6
      const ratio = box!.height / box!.width;
      expect(ratio).toBeGreaterThan(1.0);
      expect(ratio).toBeLessThan(2.0);
    });
  });

  // ==========================================
  // F6: Book Detail Split-View (Source / Notes)
  // ==========================================
  test.describe('F6: Book Detail Split-View', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a book detail page
      const libraryLink = page.locator('[data-testid="nav-library"], a[href="/library"]').first();
      await expect(libraryLink).toBeVisible();
      await libraryLink.click();
      
      const book = page.locator('[data-testid="book-cover"], .book-cover').first();
      await expect(book).toBeVisible();
      await book.click();
      
      // Wait for split view to appear
      const sourcePane = page.locator('[data-testid="source-pane"], .source-pane').first();
      await expect(sourcePane).toBeVisible({ timeout: 5000 });
      const notesPane = page.locator('[data-testid="notes-pane"], .notes-pane').first();
      await expect(notesPane).toBeVisible({ timeout: 5000 });
    });

    test('split-view transitions to stacked layout on extreme narrow viewports', async ({ page }) => {
      // Simulate mobile device width
      await page.setViewportSize({ width: 375, height: 812 });
      
      const sourcePane = page.locator('[data-testid="source-pane"], .source-pane').first();
      const notesPane = page.locator('[data-testid="notes-pane"], .notes-pane').first();
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();

      const sourceBox = await sourcePane.boundingBox();
      const notesBox = await notesPane.boundingBox();
      
      expect(sourceBox).not.toBeNull();
      expect(notesBox).not.toBeNull();
      
      // In a stacked mobile layout, they should share similar X origin, or Notes should be below Source
      const isStacked = (notesBox!.y >= (sourceBox!.y + sourceBox!.height - 10)) || (notesBox!.x <= sourceBox!.x + 10);
      expect(isStacked).toBeTruthy();
    });

    test('extremely large source material scrolls independently without affecting the notes pane', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 }); // Desktop size
      
      const sourcePane = page.locator('[data-testid="source-pane"], .source-pane').first();
      const notesPane = page.locator('[data-testid="notes-pane"], .notes-pane').first();
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      const initialNotesBox = await notesPane.boundingBox();
      expect(initialNotesBox).not.toBeNull();
      
      // Scroll the source pane
      await sourcePane.evaluate((el) => {
        el.scrollTop = 500;
      });
      
      // Verify notes pane hasn't moved
      const finalNotesBox = await notesPane.boundingBox();
      expect(finalNotesBox).not.toBeNull();
      expect(initialNotesBox!.y).toEqual(finalNotesBox!.y);
    });

    test('notes pane handles empty state gracefully when no highlights exist', async ({ page }) => {
      const notesPane = page.locator('[data-testid="notes-pane"], .notes-pane').first();
      await expect(notesPane).toBeVisible();
      
      const emptyStateIndicator = notesPane.locator('[data-testid="empty-notes-message"], .empty-message').first();
      await expect(emptyStateIndicator).toBeVisible();
      
      const text = await emptyStateIndicator.innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    });

    test('keyboard focus naturally flows between source and notes panes', async ({ page }) => {
      const sourcePane = page.locator('[data-testid="source-pane"], .source-pane').first();
      await expect(sourcePane).toBeVisible();
      
      // Set focus to the source pane or a focusable element within it
      await sourcePane.focus();
      await expect(sourcePane).toBeFocused();
      
      // Tab forward
      await page.keyboard.press('Tab');
      
      // Ensure focus remains within the document and doesn't get lost in non-interactive voids
      const activeElementTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElementTag).not.toBe('BODY');
    });

    test('rapid resizing of browser window maintains split-view aspect ratio constraints', async ({ page }) => {
      const sourcePane = page.locator('[data-testid="source-pane"], .source-pane').first();
      const notesPane = page.locator('[data-testid="notes-pane"], .notes-pane').first();

      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();

      // Resize randomly 5 times
      for (let i = 0; i < 5; i++) {
        await page.setViewportSize({ width: 1000 + (i * 50), height: 800 });
        await page.waitForTimeout(50);
        
        const sourceBox = await sourcePane.boundingBox();
        const notesBox = await notesPane.boundingBox();
        
        expect(sourceBox).not.toBeNull();
        expect(notesBox).not.toBeNull();
        
        // Neither pane should collapse to 0 width
        expect(sourceBox!.width).toBeGreaterThan(0);
        expect(notesBox!.width).toBeGreaterThan(0);
        
        // They should together not exceed the viewport
        expect(sourceBox!.width + notesBox!.width).toBeLessThanOrEqual(1000 + (i * 50) + 50); // slight buffer for gaps
      }
    });
  });
});
