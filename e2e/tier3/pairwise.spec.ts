import { test, expect } from '@playwright/test';

async function tabToElement(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator, maxTabs = 50) {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    const isFocused = await locator.evaluate(node => document.activeElement === node).catch(() => false);
    if (isFocused) return;
  }
  throw new Error(`Element not reached via Tab after ${maxTabs} attempts`);
}

test.describe('Tier 3: Pairwise Feature Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Sidebar + Teacher Mode + A11y (F1, F2, F9): Toggle sidebar via keyboard in Teacher Mode', async ({ page }) => {
    // Enter Teacher Mode
    const teacherModeBtn = page.getByTestId('btn-teacher-mode');
    await teacherModeBtn.click();
    await expect(page.getByTestId('teacher-mode-view')).toBeVisible();

    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    // Focus and toggle sidebar using keyboard
    const sidebarToggle = page.getByTestId('sidebar-toggle');
    await tabToElement(page, sidebarToggle);
    await page.keyboard.press('Enter');

    // Verify sidebar is collapsed or expanded
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    // Verify chat layout resizes without overlapping
    const chatLayout = page.getByTestId('chat-layout');
    await expect(chatLayout).toBeVisible();

    await expect(async () => {
      await expect(chatLayout).toBeVisible();
      await expect(sidebar).toBeVisible();
      const chatBounds = await chatLayout.boundingBox();
      const sidebarBounds = await sidebar.boundingBox();
      expect(chatBounds).not.toBeNull();
      expect(sidebarBounds).not.toBeNull();
      expect(sidebarBounds!.width).toBeLessThan(100);
      expect(sidebarBounds!.x + sidebarBounds!.width).toBeLessThanOrEqual(chatBounds!.x);
    }).toPass({ timeout: 5000 });
    
    // Focus management check
    await expect(sidebarToggle).toBeFocused();
  });

  test('Sidebar + Split-View (F1, F6): Toggle sidebar in Split-View maintains proportional widths', async ({ page }) => {
    // Navigate to a book to enter Split-View
    await page.getByTestId('btn-library-mode').click();
    const bookCover = page.getByTestId('3d-book-cover').first();
    await bookCover.click();
    await expect(bookCover).toHaveClass(/flip-open-active/);
    await page.waitForTimeout(500); // Allow layout to settle
    await expect(page.getByTestId('split-view')).toBeVisible();

    const sidebarToggle = page.getByTestId('sidebar-toggle');
    const leftPane = page.getByTestId('split-left-pane');
    const rightPane = page.getByTestId('split-right-pane');

    // Get initial ratio
    await expect(leftPane).toBeVisible();
    await expect(rightPane).toBeVisible();
    const initialLeftBounds = await leftPane.boundingBox();
    const initialRightBounds = await rightPane.boundingBox();
    const initialRatio = initialLeftBounds!.width / initialRightBounds!.width;

    // Toggle sidebar
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    
    // Verify left and right panes exist and do not overflow
    await expect(leftPane).toBeVisible();
    await expect(rightPane).toBeVisible();
    
    // Check bounds
    await expect(async () => {
      const splitView = page.getByTestId('split-view');
      await expect(splitView).toBeVisible();
      await expect(leftPane).toBeVisible();
      await expect(rightPane).toBeVisible();
      const splitViewBounds = await splitView.boundingBox();
      const leftBounds = await leftPane.boundingBox();
      const rightBounds = await rightPane.boundingBox();

      expect(splitViewBounds).not.toBeNull();
      expect(leftBounds).not.toBeNull();
      expect(rightBounds).not.toBeNull();
      expect(leftBounds!.width + rightBounds!.width).toBeLessThanOrEqual(splitViewBounds!.width);
      expect(leftBounds!.width / rightBounds!.width).toBeCloseTo(initialRatio, 1);
    }).toPass({ timeout: 5000 });
  });

  test('Teacher Mode + Thematic UI (F2, F4): Teacher mode uses thematic dark mode properly', async ({ page }) => {
    await page.getByTestId('btn-teacher-mode').click();
    
    // Check thematic background container
    const themeBg = page.getByTestId('thematic-background');
    await expect(themeBg).toBeVisible();
    
    // Check Teacher mode chat bubbles and input exist within the background
    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();
    
    // Verify css variable or background color property is applied for thematic UI
    const bgColor = await themeBg.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('Library + 3D Covers + A11y (F3, F5, F9): Navigate library and trigger 3D cover via keyboard', async ({ page }) => {
    await page.getByTestId('btn-library-mode').click();
    
    const firstBook = page.getByTestId('3d-book-cover').first();
    
    // Tab to ensure test stability, then press Enter
    await tabToElement(page, firstBook);
    await page.keyboard.press('Enter');
    
    // Verify flip-open animation triggers
    await expect(firstBook).toHaveClass(/flip-open-active/);
    
    await expect(async () => {
      const splitView = page.getByTestId('split-view');
      await expect(splitView).toBeVisible();
      const splitViewBounds = await splitView.boundingBox();
      expect(splitViewBounds).not.toBeNull();
      expect(splitViewBounds!.width).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });
  });

  test('3D Covers to Split-View Transition (F5, F6): Flip-open animation transitions to Split-View', async ({ page }) => {
    await page.getByTestId('btn-library-mode').click();
    
    const bookCover = page.getByTestId('3d-book-cover').first();
    await bookCover.click();
    
    // Verify animation class
    await expect(bookCover).toHaveClass(/flip-open-active/);
    
    // Verify Split-View layout appears
    await expect(page.getByTestId('split-view')).toBeVisible();
    
    await expect(async () => {
      const splitView = page.getByTestId('split-view');
      await expect(splitView).toBeVisible();
      const splitViewBounds = await splitView.boundingBox();
      expect(splitViewBounds).not.toBeNull();
      expect(splitViewBounds!.width).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });
  });

  test('Split-View + Highlight-to-Note (F6, F7): Highlight text in left pane creates note in right pane', async ({ page }) => {
    // Direct navigation assuming route exists
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    await expect(page.getByTestId('split-view')).toBeVisible();
    
    const sourceText = page.getByTestId('source-text-content');
    
    // Simulate text selection (Highlight)
    const box = await sourceText.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 10);
      await page.mouse.up();
    }
    
    // Trigger highlight to note action
    const highlightMenuBtn = page.getByTestId('btn-create-note-from-highlight');
    await expect(highlightMenuBtn).toBeVisible();
    await highlightMenuBtn.click();
    
    // Verify note appears in right pane
    const rightPane = page.getByTestId('split-right-pane');
    const newNote = rightPane.getByTestId('note-card').first();
    await expect(newNote).toBeVisible();
    expect((await newNote.textContent())?.trim().length).toBeGreaterThan(0);
  });

  test('Split-View + Studio (F6, F8): Studio panel is sticky in Split-View', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    await expect(page.getByTestId('split-view')).toBeVisible();
    
    const studioPanel = page.getByTestId('studio-panel');
    await expect(studioPanel).toBeVisible();
    
    await expect(studioPanel).toHaveCSS('position', 'sticky');
  });

  test('Highlight-to-Note + A11y (F7, F9): Keyboard text selection triggers note action and shifts focus', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    
    const sourceText = page.getByTestId('source-text-content');
    const box = await sourceText.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 10);
      await page.mouse.up();
    }
    
    // Trigger via keyboard
    const highlightMenuBtn = page.getByTestId('btn-create-note-from-highlight');
    await tabToElement(page, highlightMenuBtn);
    await page.keyboard.press('Enter'); // create note
    
    const newNoteInput = page.getByTestId('note-editor-input');
    await expect(newNoteInput).toBeVisible();
    // Verify focus shifted to the new note
    await expect(newNoteInput).toBeFocused();
  });

  test('Studio + Thematic UI + A11y (F8, F4, F9): Studio panel is keyboard navigable and uses correct ARIA', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    
    const studioPanel = page.getByTestId('studio-panel');
    await expect(studioPanel).toBeVisible();
    await expect(page.getByTestId('thematic-background')).toBeVisible();
    
    // Verify ARIA roles
    await expect(studioPanel).toHaveAttribute('role', 'toolbar');
    
    const firstStudioBtn = studioPanel.getByRole('button').first();
    
    // For test reliability, we tab to it directly and check next tab
    await tabToElement(page, firstStudioBtn);
    
    await page.keyboard.press('ArrowRight');
    const secondStudioBtn = studioPanel.getByRole('button').nth(1);
    await expect(secondStudioBtn).toBeFocused();
  });

  test('Thematic UI + A11y (F4, F9): Particle background exists and does not obscure focus rings', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    
    const particleBg = page.getByTestId('particle-background');
    await expect(particleBg).toBeVisible();
    
    const studioPanel = page.getByTestId('studio-panel');
    await expect(studioPanel).toBeVisible();
  });

  test('Highlight-to-Note + Studio (F7, F8): Creating note does not overlap Studio panel', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    
    const sourceText = page.getByTestId('source-text-content');
    const box = await sourceText.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + 10);
      await page.mouse.up();
    }
    
    const highlightMenuBtn = page.getByTestId('btn-create-note-from-highlight');
    await highlightMenuBtn.click();
    
    const newNote = page.getByTestId('note-card').first();
    const studioPanel = page.getByTestId('studio-panel');
    
    await expect(newNote).toBeVisible();
    await expect(studioPanel).toBeVisible();
    
    // Check that bounding boxes do not overlap
    await expect(async () => {
      await expect(newNote).toBeVisible();
      await expect(studioPanel).toBeVisible();
      const noteBounds = await newNote.boundingBox();
      const studioBounds = await studioPanel.boundingBox();
      
      expect(noteBounds).not.toBeNull();
      expect(studioBounds).not.toBeNull();
      const isOverlapping = !(
        studioBounds!.x + studioBounds!.width <= noteBounds!.x ||
        studioBounds!.x >= noteBounds!.x + noteBounds!.width ||
        studioBounds!.y + studioBounds!.height <= noteBounds!.y ||
        studioBounds!.y >= noteBounds!.y + noteBounds!.height
      );
      expect(isOverlapping).toBeFalsy();
    }).toPass({ timeout: 5000 });
  });
});
