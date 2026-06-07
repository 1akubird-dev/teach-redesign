import { test, expect } from '@playwright/test';

test.describe('Tier 4: Scenario 1', () => {
  test('Student prepares for history exam using Book Mode and Chat', async ({ page }) => {
    // 1. Open the application.
    await page.goto('/');

    // 2. Toggle the Collapsible Sidebar to navigate to Books / Library Mode.
    const sidebarToggle = page.getByTestId('sidebar-toggle');
    await sidebarToggle.click();
    
    const booksModeLink = page.getByTestId('nav-books-mode');
    await booksModeLink.click();

    // 3. Select a book (e.g., "History").
    const historyBook = page.getByTestId('book-item-history');
    await historyBook.click();

    // 4. Verify the UI transitions to Book Detail Split-View showing Source and Notes.
    const splitViewContainer = page.getByTestId('split-view-container');
    await expect(splitViewContainer).toBeVisible();
    
    const sourcePane = page.getByTestId('split-view-source');
    await expect(sourcePane).toBeVisible();
    
    const notesPane = page.getByTestId('split-view-notes');
    await expect(notesPane).toBeVisible();

    // 5. Simulate text selection in the source area and trigger the Highlight-to-Note interaction.
    // We'll simulate this by evaluating text selection or triggering a mock highlight event.
    await page.evaluate(() => {
      const sourceEl = document.querySelector('[data-testid="split-view-source"]');
      if (sourceEl) {
        // Fake selection
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(sourceEl);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
    
    // There should be a popup or a button to "Create Note" from the highlight
    const createNoteBtn = page.getByTestId('highlight-create-note-btn');
    await expect(createNoteBtn).toBeVisible();
    await createNoteBtn.click();

    // 6. Verify the created note appears in the Notes pane.
    const newNote = page.getByTestId('note-item').first();
    await expect(newNote).toBeVisible();

    // 7. Open the "Studio" Control Panel and verify it becomes visible and interactive.
    const studioToggleBtn = page.getByTestId('studio-toggle-btn');
    await studioToggleBtn.click();

    const studioPanel = page.getByTestId('studio-control-panel');
    await expect(studioPanel).toBeVisible();
    
    const studioInput = page.getByTestId('studio-input');
    await expect(studioInput).toBeEnabled();
  });
});
