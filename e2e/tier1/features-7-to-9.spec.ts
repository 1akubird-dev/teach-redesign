import { test, expect } from '@playwright/test';

test.describe('Feature 7: Highlight-to-Note interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a book detail view where the highlight-to-note feature is present
    await page.goto('/book/1');
  });

  test('Verify basic extraction', async ({ page }) => {
    // Select text in left pane ("Source Material" region)
    const sourceRegion = page.getByRole('region', { name: /Source Material/i });
    const paragraph = sourceRegion.locator('p').first();
    
    // Simulate text selection
    await paragraph.selectText();
    
    // Expect a note with the exact text in right pane ("Notes" region)
    const textContent = await paragraph.textContent();
    const notesRegion = page.getByRole('region', { name: /Notes/i });
    
    await expect(notesRegion.getByText(textContent as string)).toBeVisible();
  });

  test('Accumulation', async ({ page }) => {
    const sourceRegion = page.getByRole('region', { name: /Source Material/i });
    const notesRegion = page.getByRole('region', { name: /Notes/i });
    
    const p1 = sourceRegion.locator('p').nth(0);
    const p2 = sourceRegion.locator('p').nth(1);
    
    await p1.selectText();
    await p2.selectText();
    
    const p1Text = await p1.textContent();
    const p2Text = await p2.textContent();
    
    // Expect both notes to exist
    await expect(notesRegion.getByText(p1Text as string)).toBeVisible();
    await expect(notesRegion.getByText(p2Text as string)).toBeVisible();
  });

  test('Whitespace handling', async ({ page }) => {
    const sourceRegion = page.getByRole('region', { name: /Source Material/i });
    const notesRegion = page.getByRole('region', { name: /Notes/i });
    const initialNoteCount = await notesRegion.locator('.note-card').count();
    
    // Simulate a user dragging the mouse in an empty/whitespace area
    // (e.g., the top-left margin/padding of the source region)
    const box = await sourceRegion.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 2, box.y + 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 15, box.y + 15, { steps: 5 });
      await page.mouse.up();
    }
    
    // Should create no notes
    const noteCount = await notesRegion.locator('.note-card').count();
    expect(noteCount).toBe(initialNoteCount);
  });

  test('Multi-paragraph', async ({ page }) => {
    const sourceRegion = page.getByRole('region', { name: /Source Material/i });
    const notesRegion = page.getByRole('region', { name: /Notes/i });
    const initialNoteCount = await notesRegion.locator('.note-card').count();

    const p1 = sourceRegion.locator('p').nth(0);
    const p2 = sourceRegion.locator('p').nth(1);

    const box1 = await p1.boundingBox();
    const box2 = await p2.boundingBox();

    // Select across multiple paragraphs by dragging the mouse
    if (box1 && box2) {
      // Start drag from the beginning of the first paragraph
      await page.mouse.move(box1.x + 5, box1.y + 5);
      await page.mouse.down();
      
      // Move to the end of the second paragraph
      await page.mouse.move(box2.x + box2.width - 5, box2.y + box2.height - 5, { steps: 10 });
      await page.mouse.up();
    }

    // Check one combined note is created
    const noteCount = await notesRegion.locator('.note-card').count();
    expect(noteCount).toBe(initialNoteCount + 1);
  });

  test('Deletion', async ({ page }) => {
    const sourceRegion = page.getByRole('region', { name: /Source Material/i });
    const notesRegion = page.getByRole('region', { name: /Notes/i });
    
    const p1 = sourceRegion.locator('p').first();
    await p1.selectText();
    
    const note = notesRegion.locator('.note-card').first();
    await expect(note).toBeVisible();
    
    // Delete note
    const deleteButton = note.getByRole('button', { name: /Delete|Remove/i });
    await deleteButton.click();
    
    await expect(note).toBeHidden();
  });
});

test.describe('Feature 8: "Studio" Control Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book/1');
  });

  test('Studio panel initialization', async ({ page }) => {
    const studioRegion = page.getByRole('region', { name: /Studio/i });
    await expect(studioRegion).toBeVisible();
    
    // Check it's rendered at the top of Book Detail view
    const boundingBox = await studioRegion.boundingBox();
    expect(boundingBox?.y).toBeLessThan(150); // Near the top
  });

  test('Audio Overview artifact presence', async ({ page }) => {
    const studioRegion = page.getByRole('region', { name: /Studio/i });
    await expect(studioRegion.locator(':has-text("Audio overview"), :has-text("Audio Overviews"), button[aria-label*="Audio overview"]')).toBeVisible();
  });

  test('Quiz artifact presence', async ({ page }) => {
    const studioRegion = page.getByRole('region', { name: /Studio/i });
    await expect(studioRegion.locator(':has-text("Quiz"), :has-text("Quizzes"), button[aria-label*="Quiz"]')).toBeVisible();
  });

  test('Video artifact presence', async ({ page }) => {
    const studioRegion = page.getByRole('region', { name: /Studio/i });
    await expect(studioRegion.locator(':has-text("Video"), :has-text("Videos"), button[aria-label*="Video"]')).toBeVisible();
  });

  test('Fixed positioning', async ({ page }) => {
    const studioRegion = page.getByRole('region', { name: /Studio/i });
    await expect(studioRegion).toBeVisible();
    
    // Scroll down
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(500); // allow scroll event
    
    // Studio should still be visible
    await expect(studioRegion).toBeVisible();
    const scrolledBox = await studioRegion.boundingBox();
    
    // Verify it is in viewport
    expect(scrolledBox?.y).toBeGreaterThanOrEqual(0);
    expect(scrolledBox?.y).toBeLessThan(800);
  });
});

test.describe('Feature 9: Accessibility & Keyboard Nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library');
  });

  test('ARIA landmarks', async ({ page }) => {
    const navRegion = page.getByRole('navigation');
    const mainRegion = page.getByRole('main');
    
    await expect(navRegion).toBeVisible();
    await expect(mainRegion).toBeVisible();
  });

  test('Focus rings', async ({ page }) => {
    const interactive = page.locator('a, button, [tabindex="0"]').first();
    await interactive.focus();
    
    const hasFocusRing = await interactive.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return (style.outlineStyle !== 'none' && style.outlineWidth !== '0px') || 
             (style.boxShadow !== 'none');
    });
    
    expect(hasFocusRing).toBeTruthy();
  });

  test('ARIA tabs', async ({ page }) => {
    const tablist = page.getByRole('tablist');
    await expect(tablist).toBeVisible();
    
    const tabs = page.getByRole('tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThan(1);
    
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    
    const tabpanel = page.getByRole('tabpanel');
    await expect(tabpanel).toBeVisible();
  });

  test('Scroll-padding', async ({ page }) => {
    const header = page.getByRole('banner');
    const targetElement = page.locator('[id]').last();
    
    await targetElement.focus();
    
    const headerBox = await header.boundingBox();
    const targetBox = await targetElement.boundingBox();
    
    if (headerBox && targetBox) {
      expect(targetBox.y).toBeGreaterThanOrEqual(headerBox.height);
    }
  });

  test('Keyboard activation of 3D book cover', async ({ page }) => {
    const bookCover = page.locator('.book-cover, [aria-label*="book cover"], [role="button"]:has-text("Cover")').first();
    await bookCover.focus();
    
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*\/book\/.*/);
  });
});
