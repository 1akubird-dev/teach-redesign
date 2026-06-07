import { test, expect } from '@playwright/test';

test.describe('Tier 4: Scenario 3', () => {
  test('Keyboard-only navigation session opening a book and taking notes', async ({ page }) => {
    // 1. Navigate to the app.
    await page.goto('/');

    // 2. Tab to the Collapsible Sidebar toggle and press Enter to open.
    // Assuming the first focusable element is skip-to-content or sidebar toggle.
    // We will simulate tabbing until we focus the sidebar toggle. (May need adjustment when UI is built)
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('sidebar-toggle')).toBeFocused();
    await page.keyboard.press('Enter');

    // 3. Tab to the Books / Library Mode link and press Enter. (May need adjustment when UI is built)
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('nav-books-mode')).toBeFocused();
    await page.keyboard.press('Enter');

    // 4. Tab to a 3D Book Cover, verifying the focus state visually changes. (May need adjustment when UI is built)
    const firstBook = page.getByTestId('book-item').first();
    await page.keyboard.press('Tab');
    // Verify focus state via pseudo-class or class
    await expect(firstBook).toBeFocused();
    // Assuming focus state triggers an animation or class change
    // If not, we just assert it's focused.
    
    // 5. Press Enter to open the book, waiting for the Flip-open animation and Split-View layout.
    await page.keyboard.press('Enter');
    
    // Check for animation class on the book cover before split view (assuming .is-open class)
    await expect(firstBook).toHaveClass(/is-open/);
    
    const splitViewContainer = page.getByTestId('split-view-container');
    await expect(splitViewContainer).toBeVisible();

    // 6. Use keyboard selection commands (e.g., Shift + ArrowRight) to select text in the source pane
    // Focus the source content area. (May need adjustment when UI is built)
    const sourcePane = page.getByTestId('split-view-source');
    await page.keyboard.press('Tab');
    await expect(sourcePane).toBeFocused();
    
    // Simulate keyboard selection
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');

    // Tab to a "Create Note" button to trigger the Highlight-to-Note feature. (May need adjustment when UI is built)
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('highlight-create-note-btn')).toBeFocused();
    await page.keyboard.press('Enter');

    // 7. Verify the new note appears in the notes section.
    const newNote = page.getByTestId('note-item').first();
    await expect(newNote).toBeVisible();
  });
});
