import { test, expect } from '@playwright/test';

test.describe('Tier 2: Milestone 1 Features (Boundary & Corner Cases)', () => {

  test.describe('F1: Collapsible Sidebar', () => {
    test('1. Sidebar becomes an overlay or auto-collapses on very narrow screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/');
      
      const sidebar = page.getByRole('complementary', { name: /sidebar/i });
      const toggleBtn = page.getByRole('button', { name: /toggle sidebar/i });
      
      // Should be hidden initially on narrow screens
      await expect(sidebar).not.toBeInViewport();
      
      // Can be opened
      await toggleBtn.click();
      await expect(sidebar).toBeInViewport();
    });

    test('2. Rapid toggling does not break layout and resolves to correct state', async ({ page }) => {
      await page.goto('/');
      const toggleBtn = page.getByRole('button', { name: /toggle sidebar/i });
      const sidebar = page.getByRole('complementary', { name: /sidebar/i });
      
      await expect(sidebar).toBeVisible();
      
      // Toggle rapidly 5 times (odd number = closed)
      for (let i = 0; i < 5; i++) {
        await toggleBtn.click();
      }
      
      // Wait for animations
      await page.waitForTimeout(500);
      
      await expect(sidebar).not.toBeInViewport();
    });

    test('3. Sidebar becomes scrollable when contents overflow vertically', async ({ page }) => {
      await page.goto('/?mockManySidebarItems=true');
      const sidebarList = page.getByRole('list', { name: /sidebar items/i });
      
      await expect(sidebarList).toBeVisible();
      
      const scrollHeight = await sidebarList.evaluate(el => el.scrollHeight);
      const clientHeight = await sidebarList.evaluate(el => el.clientHeight);
      
      expect(scrollHeight).toBeGreaterThan(clientHeight);
    });

    test('4. Clicking outside the sidebar on narrow screens dismisses it', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 800 });
      await page.goto('/');
      
      const toggleBtn = page.getByRole('button', { name: /toggle sidebar/i });
      const sidebar = page.getByRole('complementary', { name: /sidebar/i });
      
      await toggleBtn.click();
      await expect(sidebar).toBeInViewport();
      
      // Click outside in main content area
      await page.mouse.click(390, 400);
      await page.waitForTimeout(300);
      
      await expect(sidebar).not.toBeInViewport();
    });

    test('5. Empty state shows appropriate messaging and does not collapse height to zero', async ({ page }) => {
      await page.goto('/?mockEmptySidebar=true');
      const sidebar = page.getByRole('complementary', { name: /sidebar/i });
      const emptyText = sidebar.getByText(/no recent items/i);
      
      await expect(emptyText).toBeVisible();
      
      const box = await sidebar.boundingBox();
      expect(box?.height).toBeGreaterThan(100);
    });
  });

  test.describe('F2: Teacher Mode', () => {
    test('1. Very long unbroken string wraps correctly without layout breakage', async ({ page }) => {
      await page.goto('/teacher');
      const input = page.getByRole('textbox', { name: /message/i });
      const longString = 'A'.repeat(5000);
      
      await input.fill(longString);
      await input.press('Enter');
      
      const message = page.getByText(longString);
      await expect(message).toBeVisible();
      
      const messageBox = await message.boundingBox();
      const viewportSize = page.viewportSize();
      expect(messageBox!.width).toBeLessThanOrEqual(viewportSize!.width);
    });

    test('2. Rapidly sending messages auto-scrolls correctly', async ({ page }) => {
      await page.goto('/teacher');
      const input = page.getByRole('textbox', { name: /message/i });
      
      for (let i = 0; i < 15; i++) {
        await input.fill(`Message ${i}`);
        await input.press('Enter');
      }
      
      const lastMessage = page.getByText('Message 14');
      await expect(lastMessage).toBeInViewport();
    });

    test('3. Empty or whitespace-only messages are not sent', async ({ page }) => {
      await page.goto('/teacher');
      const input = page.getByRole('textbox', { name: /message/i });
      const submitBtn = page.getByRole('button', { name: /send/i });
      
      await input.fill('   ');
      
      // Button should be disabled
      await expect(submitBtn).toBeDisabled();
      
      // Pressing enter should not send
      await input.press('Enter');
      const msg = page.locator('.chat-message', { hasText: /^ {3}$/ });
      await expect(msg).not.toBeAttached();
    });

    test('4. Multi-line input expands to max height then scrolls', async ({ page }) => {
      await page.goto('/teacher');
      const input = page.getByRole('textbox', { name: /message/i });
      
      // Press shift+enter many times
      for (let i = 0; i < 20; i++) {
        await input.press('Shift+Enter');
      }
      
      const box = await input.boundingBox();
      const viewportSize = page.viewportSize();
      
      // Input shouldn't take up the whole screen height
      expect(box!.height).toBeLessThan(viewportSize!.height * 0.5);
      
      // But it should be scrollable internally
      const scrollHeight = await input.evaluate(el => el.scrollHeight);
      const clientHeight = await input.evaluate(el => el.clientHeight);
      expect(scrollHeight).toBeGreaterThan(clientHeight);
    });

    test('5. Input anchors to bottom on extremely tall viewports', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 2500 });
      await page.goto('/teacher');
      
      const inputContainer = page.locator('.chat-input-container');
      await expect(inputContainer).toBeVisible();
      
      const box = await inputContainer.boundingBox();
      
      // Bottom of the container should be near the bottom of the 2500px viewport
      expect(box!.y + box!.height).toBeGreaterThan(2400);
    });
  });

  test.describe('F3: Books / Library Mode', () => {
    test('1. Empty library state provides call-to-action', async ({ page }) => {
      await page.goto('/books?mockEmptyLibrary=true');
      
      const emptyMsg = page.getByText(/library is empty/i);
      const addBtn = page.getByRole('button', { name: /add book/i });
      
      await expect(emptyMsg).toBeVisible();
      await expect(addBtn).toBeVisible();
    });

    test('2. Large number of books wrap correctly in grid', async ({ page }) => {
      await page.goto('/books?mockManyBooks=true');
      
      const books = page.locator('.book-item');
      await expect(books).toHaveCount(50);
      
      const firstBook = await books.nth(0).boundingBox();
      const lastBook = await books.nth(49).boundingBox();
      
      // The 50th book should be further down the page
      expect(lastBook!.y).toBeGreaterThan(firstBook!.y + 100);
    });

    test('3. Excessively long book titles truncate or wrap gracefully', async ({ page }) => {
      await page.goto('/books?mockLongTitle=true');
      
      const title = page.getByText(/Extremely long book title/i);
      await expect(title).toBeVisible();
      
      const titleBox = await title.boundingBox();
      const bookCover = page.locator('.book-cover').first();
      await expect(bookCover).toBeVisible();
      const coverBox = await bookCover.boundingBox();
      
      // Title should be constrained to cover width (approx)
      expect(titleBox!.width).toBeLessThanOrEqual(coverBox!.width + 40);
    });

    test('4. Rapid double/triple clicking a book during animation does not clone state', async ({ page }) => {
      await page.goto('/books');
      
      const book = page.locator('.book-cover').first();
      await expect(book).toBeVisible();
      
      // Rapid clicks
      await book.click();
      await book.click();
      await book.click();
      
      // Ensure only one detail view opens
      const detailViews = page.locator('.book-detail-view');
      await expect(detailViews).toHaveCount(1);
    });

    test('5. Ultra-wide aspect ratio keeps 3D covers proportional', async ({ page }) => {
      await page.setViewportSize({ width: 3000, height: 500 });
      await page.goto('/books');
      
      const book = page.locator('.book-cover').first();
      await expect(book).toBeVisible();
      
      const box = await book.boundingBox();
      // Aspect ratio of a book is typically taller than it is wide
      expect(box!.width).toBeLessThan(box!.height);
    });
  });
});
