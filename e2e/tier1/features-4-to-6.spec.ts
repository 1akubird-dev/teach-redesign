import { test, expect } from '@playwright/test';

test.describe('Tier 1: Milestone 2 (Features 4-6)', () => {

  test.describe('Feature 4: Thematic UI', () => {
    test('Particle background is present', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const background = page.getByTestId('particle-background');
      await expect(background).toBeVisible();
    });

    test('Dark mode background color is a gray shade, not pure black', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const body = page.locator('body');
      await expect(body).toBeVisible();
      const bg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgb(0, 0, 0)');
      expect(bg).not.toBe('rgba(0, 0, 0, 1)');
    });

    test('Typography includes serif fonts for headings', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const heading = page.getByTestId('source-pane').first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS('font-family', /serif/i);
    });

    test('Typography includes sans-serif fonts for UI elements', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();
      await expect(sidebar).toHaveCSS('font-family', /sans-serif/i);
    });

    test('Typography includes monospace fonts for code or specific data', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const codeBlock = page.getByTestId('book-metadata').first();
      await expect(codeBlock).toBeVisible();
      await expect(codeBlock).toHaveCSS('font-family', /monospace/i);
    });

    test('Professional tone requirement: greeting is present', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const greeting = page.getByText('How may I assist your studies today?');
      await expect(greeting).toBeVisible();
    });
  });

  test.describe('Feature 5: 3D Book Covers & Flip-open animation', () => {
    test('3D Book covers are visible in the library', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const bookCover = page.getByTestId('3d-book-cover').first();
      await expect(bookCover).toBeVisible();
    });

    test('Cover topic is rendered on the book cover', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const coverTopic = page.getByTestId('cover-topic').first();
      await expect(coverTopic).toBeVisible();
    });

    test('Clicking a 3D book cover triggers flip animation', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const bookCover = page.getByTestId('3d-book-cover').first();
      await expect(bookCover).toBeVisible();
      await bookCover.click({ force: true });
      await expect(bookCover).toHaveAttribute('data-animation-state', 'flipping');
    });

    test('3D book cover has correct ARIA roles', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const bookCover = page.getByTestId('3d-book-cover').first();
      await expect(bookCover).toBeVisible();
      await expect(bookCover).toHaveAttribute('role', 'button');
    });

    test('Flip animation completes and navigates to book detail view', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const bookCover = page.getByTestId('3d-book-cover').first();
      await expect(bookCover).toBeVisible();
      await bookCover.click({ force: true });
      const detailView = page.getByTestId('book-detail-view');
      await expect(detailView).toBeVisible();
    });

    test('3D Book cover has appropriate inline styles or CSS for 3D transform', async ({ page }) => {
      await page.goto('http://localhost:3000');
      const bookCover = page.getByTestId('3d-book-cover').first();
      await expect(bookCover).toBeVisible();
      await expect(bookCover).toHaveCSS('transform', /matrix3d|rotateY|perspective/);
    });
  });

  test.describe('Feature 6: Book Detail Split-View (Source / Notes)', () => {
    test('Book detail view displays both source pane and notes pane', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const sourcePane = page.getByTestId('source-pane');
      const notesPane = page.getByTestId('notes-pane');
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
    });

    test('Source pane is positioned to the left of the notes pane', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const sourcePane = page.getByTestId('source-pane');
      const notesPane = page.getByTestId('notes-pane');
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      const sourceBox = await sourcePane.boundingBox();
      const notesBox = await notesPane.boundingBox();
      
      expect(sourceBox).not.toBeNull();
      expect(notesBox).not.toBeNull();
      
      expect(sourceBox!.x + sourceBox!.width).toBeLessThanOrEqual(notesBox!.x);
    });

    test('Split-view container uses flex or grid layout', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const detailView = page.getByTestId('book-detail-view');
      await expect(detailView).toBeVisible();
      await expect(detailView).toHaveCSS('display', /flex|grid/);
    });

    test('Source pane and notes pane are vertically aligned', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const sourcePane = page.getByTestId('source-pane');
      const notesPane = page.getByTestId('notes-pane');
      
      await expect(sourcePane).toBeVisible();
      await expect(notesPane).toBeVisible();
      
      const sourceBox = await sourcePane.boundingBox();
      const notesBox = await notesPane.boundingBox();
      
      expect(sourceBox).not.toBeNull();
      expect(notesBox).not.toBeNull();
      
      expect(sourceBox!.y).toBeCloseTo(notesBox!.y, -1);
    });

    test('Source pane has aria-label or specific semantic role', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const sourcePane = page.getByTestId('source-pane');
      await expect(sourcePane).toBeVisible();
      await expect(sourcePane).toHaveAttribute('aria-label', /source/i);
    });

    test('Source pane is scrollable', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const sourcePane = page.getByTestId('source-pane');
      await expect(sourcePane).toBeVisible();
      await expect(sourcePane).toHaveCSS('overflow-y', /auto|scroll/);
    });

    test('Notes pane supports interactivity', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.getByTestId('3d-book-cover').first().click();
      const notesInput = page.getByTestId('notes-input');
      await expect(notesInput).toBeVisible();
      await notesInput.fill('Test note');
      await expect(notesInput).toHaveValue('Test note');
    });
  });
});
