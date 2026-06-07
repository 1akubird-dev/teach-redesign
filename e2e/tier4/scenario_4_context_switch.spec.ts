import { test, expect } from '@playwright/test';

test.describe('Tier 4: Scenario 4', () => {
  test('Rapid context switching between multiple books and chat sessions', async ({ page }) => {
    // 1. Open the application.
    await page.goto('/');

    // 2. Use the Collapsible Sidebar to navigate to Books Mode.
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('nav-books-mode').click();

    // 3. Open a book, triggering the 3D Flip-open animation.
    const firstBook = page.getByTestId('book-item').first();
    await firstBook.click();
    // Wait for the flip-open animation
    await expect(firstBook).toHaveClass(/is-open/);
    
    // 4. Open the sidebar again and switch to Teacher Mode (Chat).
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('nav-teacher-mode').click();

    // 5. Send a chat message and verify the state.
    await page.getByTestId('chat-input').fill('Hello context switch');
    await page.getByTestId('chat-submit-btn').click();
    
    const chatMessages = page.getByTestId('chat-message');
    await expect(chatMessages.nth(0)).toContainText('Hello context switch');

    // 6. Open the sidebar and switch back to Books Mode.
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('nav-books-mode').click();

    // 7. Re-open the same book or a different one.
    // The previous book might still be open, or we may need to click it again.
    // Let's assume we open a different one just to verify rapid switching works
    const secondBook = page.getByTestId('book-item').nth(1);
    await secondBook.click();
    await expect(secondBook).toHaveClass(/is-open/);

    // 8. Switch back to Teacher Mode (Chat) and verify the chat history was preserved across switches.
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('nav-teacher-mode').click();

    // Verify chat history still has the message
    await expect(page.getByTestId('chat-message').nth(0)).toContainText('Hello context switch');
  });
});
