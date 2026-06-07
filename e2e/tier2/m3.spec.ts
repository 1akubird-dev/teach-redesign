import { test, expect } from '@playwright/test';

test.describe('Tier 2: Boundary & Corner Cases - Milestone 3', () => {

  test.describe('Feature 7: Highlight-to-Note interaction', () => {
    
    test('F7.1: Should not create a note for empty selection (just a click)', async ({ page }) => {
      await page.goto('/books/1');
      
      const sourcePane = page.getByRole('region', { name: /source/i });
      const notesPane = page.getByRole('complementary', { name: /notes|chat/i });
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      const initialNotesCount = await notesPane.locator('article').count();
      
      await sourcePane.click();
      await page.waitForTimeout(500);
      
      const finalNotesCount = await notesPane.locator('article').count();
      expect(finalNotesCount).toBe(initialNotesCount);
    });

    test('F7.2: Should ignore selections containing only whitespace', async ({ page }) => {
      await page.goto('/books/1');
      
      const sourcePane = page.getByRole('region', { name: /source/i });
      const notesPane = page.getByRole('complementary', { name: /notes|chat/i });
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      const initialNotesCount = await notesPane.locator('article').count();
      
      await sourcePane.dblclick({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(500);
      
      const finalNotesCount = await notesPane.locator('article').count();
      expect(finalNotesCount).toBe(initialNotesCount);
    });

    test('F7.3: Should gracefully handle overlapping highlights', async ({ page }) => {
      await page.goto('/books/1');
      
      const sourcePane = page.getByRole('region', { name: /source/i });
      const paragraph = sourcePane.locator('p').first();
      
      await expect(paragraph).toBeVisible();
      await paragraph.selectText();
      
      const notesPane = page.getByRole('complementary', { name: /notes|chat/i });
      await expect(notesPane.locator('article')).toHaveCount(1, { timeout: 5000 });
      
      await paragraph.selectText();
      
      const count = await notesPane.locator('article').count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('F7.4: Should enforce visual constraints on extremely long highlight notes', async ({ page }) => {
      await page.goto('/books/1');
      
      const sourcePane = page.getByRole('region', { name: /source/i });
      const notesPane = page.getByRole('complementary', { name: /notes|chat/i });
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      await sourcePane.evaluate((el) => {
         const range = document.createRange();
         range.selectNodeContents(el);
         const sel = window.getSelection();
         sel?.removeAllRanges();
         sel?.addRange(range);
         el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      });
      
      const newNote = notesPane.locator('article').last();
      await expect(newNote).toBeVisible({ timeout: 5000 });
      
      const viewportSize = page.viewportSize();
      const noteBox = await newNote.boundingBox();
      
      expect(noteBox).not.toBeNull();
      expect(viewportSize).not.toBeNull();
      expect(noteBox!.height).toBeLessThanOrEqual(viewportSize!.height);
      expect(noteBox!.width).toBeLessThanOrEqual(viewportSize!.width);
    });

    test('F7.5: Should handle rapid successive highlighting without dropping notes', async ({ page }) => {
      await page.goto('/books/1');
      
      const sourcePane = page.getByRole('region', { name: /source/i });
      const paragraphs = sourcePane.locator('p');
      const notesPane = page.getByRole('complementary', { name: /notes|chat/i });
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      await expect(paragraphs.first()).toBeVisible();
      const pCount = await paragraphs.count();
      expect(pCount).toBeGreaterThan(0);
      
      const initialCount = await notesPane.locator('article').count();
      const loops = Math.min(3, pCount);
      
      for(let i = 0; i < loops; i++) {
        await paragraphs.nth(i).selectText();
        await page.waitForTimeout(100);
      }
      
      await expect(notesPane.locator('article')).toHaveCount(initialCount + loops, { timeout: 8000 });
    });
  });

  test.describe('Feature 8: "Studio" Control Panel', () => {

    test('F8.1: Should display an empty state when Studio has no artifacts', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      await expect(studioPanel).toBeVisible();
      
      const artifacts = studioPanel.getByRole('listitem');
      await expect(artifacts).toHaveCount(0);
      
      const emptyMsg = studioPanel.getByText(/no artifacts|create one|empty/i);
      await expect(emptyMsg).toBeVisible();
    });

    test('F8.2: Should prevent layout breakage for generated artifacts with long descriptions', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      const generateBtn = studioPanel.getByRole('button', { name: /generate|create/i }).first();
      
      await expect(generateBtn).toBeVisible();
      await generateBtn.click();
      
      const artifact = studioPanel.getByRole('listitem').first();
      await expect(artifact).toBeVisible({ timeout: 10000 });
      
      const box = await artifact.boundingBox();
      const panelBox = await studioPanel.boundingBox();
      
      expect(box).not.toBeNull();
      expect(panelBox).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(panelBox!.width);
    });

    test('F8.3: Should manage UI state seamlessly when generating multiple parallel artifacts', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      const generateBtns = studioPanel.getByRole('button', { name: /generate|create/i });
      
      await expect(generateBtns.first()).toBeVisible();
      const count = await generateBtns.count();
      expect(count).toBeGreaterThan(0);
      
      for(let i=0; i<Math.min(count, 3); i++) {
         await generateBtns.nth(i).click();
      }
      
      const loaders = studioPanel.locator('[aria-busy="true"], .loading, spinner');
      await expect(loaders.first()).toBeVisible();
      await expect(studioPanel).toBeVisible();
    });

    test('F8.4: Should enforce limits or scrolling when many artifacts are generated', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      const generateBtn = studioPanel.getByRole('button', { name: /generate|create/i }).first();
      
      await expect(generateBtn).toBeVisible();
      
      for(let i=0; i<5; i++) {
         await generateBtn.click();
         await page.waitForTimeout(500);
      }
      
      const panelBox = await studioPanel.boundingBox();
      const viewport = page.viewportSize();
      
      expect(panelBox).not.toBeNull();
      expect(viewport).not.toBeNull();
      expect(panelBox!.height).toBeLessThanOrEqual(viewport!.height);
    });

    test('F8.5: Should immediately reflect artifact deletion and handle last-item deletion', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      const generateBtn = studioPanel.getByRole('button', { name: /generate|create/i }).first();
      
      await expect(generateBtn).toBeVisible();
      await generateBtn.click();
      
      const artifact = studioPanel.getByRole('listitem').first();
      await expect(artifact).toBeVisible({ timeout: 10000 });
      
      const deleteBtn = artifact.getByRole('button', { name: /delete|remove|trash/i }).first();
      await expect(deleteBtn).toBeVisible();
      await deleteBtn.click();
      
      await expect(artifact).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('Feature 9: Accessibility & Keyboard Nav', () => {

    test('F9.1: Should trap focus or wrap logically within modals (Studio full view)', async ({ page }) => {
      await page.goto('/books/1');
      
      const expandStudioBtn = page.getByRole('button', { name: /expand studio|open studio/i });
      await expect(expandStudioBtn).toBeVisible();
      await expandStudioBtn.click();
      
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await modal.focus();
      
      for(let i=0; i<10; i++) {
         await page.keyboard.press('Tab');
      }
      
      const focusedInside = await modal.evaluate((node) => node.contains(document.activeElement));
      expect(focusedInside).toBe(true);
    });

    test('F9.2: Should appropriately restore or shift focus after closing panels', async ({ page }) => {
      await page.goto('/books/1');
      
      const sidebarBtn = page.getByRole('button', { name: /toggle sidebar|menu/i });
      await expect(sidebarBtn).toBeVisible();
      
      await sidebarBtn.focus();
      await page.keyboard.press('Enter'); 
      await page.waitForTimeout(500);
      await page.keyboard.press('Enter'); 
      
      await expect(sidebarBtn).toBeFocused();
    });

    test('F9.3: Should allow skipping to main content and avoid dead ends', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      
      const skipLink = page.getByRole('link', { name: /skip to/i });
      await expect(skipLink).toBeVisible();
      await skipLink.focus();
      await page.keyboard.press('Enter');
      
      const isBodyFocused = await page.evaluate(() => document.activeElement === document.body);
      expect(isBodyFocused).toBe(false);
    });

    test('F9.4: Should handle focus state after an element is dynamically removed', async ({ page }) => {
      await page.goto('/books/1');
      
      const studioPanel = page.getByRole('region', { name: /studio/i });
      const generateBtn = studioPanel.getByRole('button', { name: /generate|create/i }).first();
      
      await expect(generateBtn).toBeVisible();
      await generateBtn.click();
      
      const artifact = studioPanel.getByRole('listitem').first();
      await expect(artifact).toBeVisible({ timeout: 10000 });
      
      const deleteBtn = artifact.getByRole('button', { name: /delete|remove/i }).first();
      await expect(deleteBtn).toBeVisible();
      await deleteBtn.focus();
      await page.keyboard.press('Enter');
      
      await expect(artifact).toBeHidden({ timeout: 5000 });
      
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      expect(tag).not.toBe('BODY');
    });

    test('F9.5: Should verify that scroll-padding is applied to avoid focus hiding under sticky headers', async ({ page }) => {
      await page.goto('/books/1');
      
      const scrollContainer = page.locator('main').first();
      await expect(scrollContainer).toBeVisible();
      
      const scrollPadding = await scrollContainer.evaluate((node) => {
         return window.getComputedStyle(node).scrollPaddingTop;
      });
      
      const htmlScrollPadding = await page.evaluate(() => {
         return window.getComputedStyle(document.documentElement).scrollPaddingTop;
      });
      
      const isPaddingApplied = (scrollPadding && scrollPadding !== '0px') || 
                               (htmlScrollPadding && htmlScrollPadding !== '0px');
      expect(isPaddingApplied).toBeTruthy();
    });

  });

});
