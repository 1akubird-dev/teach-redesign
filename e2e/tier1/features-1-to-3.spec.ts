import { test, expect } from '@playwright/test';

test.describe('Milestone 1: Tier 1 E2E Tests', () => {

  test.describe('Feature 1: Collapsible Sidebar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should render the sidebar and its navigation links by default', async ({ page }) => {
      const sidebar = page.getByRole('navigation', { name: /sidebar/i });
      await expect(sidebar).toBeVisible();

      const chatsLink = sidebar.getByRole('link', { name: /chats/i });
      const booksLink = sidebar.getByRole('link', { name: /books/i });

      await expect(chatsLink).toBeVisible();
      await expect(booksLink).toBeVisible();
    });

    test('should collapse the sidebar when toggle is clicked', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /toggle sidebar/i });
      
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      await toggleButton.click();
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('should expand the sidebar when toggle is clicked again', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /toggle sidebar/i });
      
      await toggleButton.click();
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      await toggleButton.click();
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('should navigate to appropriate views when sidebar links are clicked', async ({ page }) => {
      const sidebar = page.getByRole('navigation', { name: /sidebar/i });
      const booksLink = sidebar.getByRole('link', { name: /books/i });
      const chatsLink = sidebar.getByRole('link', { name: /chats/i });

      await booksLink.click();
      await expect(page).toHaveURL(/.*\/books/);

      await chatsLink.click();
      // Accommodate possible route patterns for chats
      await expect(page).toHaveURL(/.*\/teacher|.*\/chats/);
    });

    test('should fully support keyboard interaction for sidebar toggling', async ({ page }) => {
      const toggleButton = page.getByRole('button', { name: /toggle sidebar/i });
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

      await toggleButton.focus();
      await page.keyboard.press('Enter');

      await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      await page.keyboard.press('Enter');
      await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Feature 2: Teacher Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/teacher');
    });

    test('should display chat layout with history and input area', async ({ page }) => {
      const chatHistory = page.getByRole('log', { name: /chat history/i });
      const inputArea = page.getByRole('textbox', { name: /message/i });

      await expect(chatHistory).toBeVisible();
      await expect(inputArea).toBeVisible();
    });

    test('should display welcome message in empty state', async ({ page }) => {
      const welcomeMessage = page.getByText('How may I assist your studies today?');
      await expect(welcomeMessage).toBeVisible();
    });

    test('should append user message to chat history on send click', async ({ page }) => {
      const inputArea = page.getByRole('textbox', { name: /message/i });
      const sendButton = page.getByRole('button', { name: /send/i });
      const chatHistory = page.getByRole('log', { name: /chat history/i });

      await inputArea.fill('Hello, teacher!');
      await sendButton.click();

      await expect(chatHistory).toContainText('Hello, teacher!');
    });

    test('should submit message when Enter is pressed', async ({ page }) => {
      const inputArea = page.getByRole('textbox', { name: /message/i });
      const chatHistory = page.getByRole('log', { name: /chat history/i });

      await inputArea.fill('Testing enter key');
      await inputArea.press('Enter');

      await expect(chatHistory).toContainText('Testing enter key');
    });

    test('should auto-scroll to the newest message when chat exceeds viewport', async ({ page }) => {
      const inputArea = page.getByRole('textbox', { name: /message/i });
      const chatHistory = page.getByRole('log', { name: /chat history/i });

      for (let i = 1; i <= 20; i++) {
        await inputArea.fill(`Message ${i}`);
        await inputArea.press('Enter');
        await expect(chatHistory.getByText(`Message ${i}`)).toBeVisible();
      }

      const lastMessage = chatHistory.getByText('Message 20');
      // Ensure the message is physically visible in the viewport
      await expect(lastMessage).toBeInViewport();
    });
  });

  test.describe.serial('Feature 3: Books / Library Mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/books');
    });

    test('should render empty state when no books exist', async ({ page }) => {
      await expect(page.getByText(/empty|no books/i)).toBeVisible();
    });

    test.describe('With books', () => {
      test.beforeEach(async ({ page }) => {
        // Seed the data via UI
        await page.getByRole('button', { name: /add book|new book/i }).click();
      });

      test('should render the library grid containing book items', async ({ page }) => {
        const libraryGrid = page.getByRole('grid', { name: /library/i });
        await expect(libraryGrid).toBeVisible();
      });

      test('should display 3D book cover and metadata for each book', async ({ page }) => {
        const libraryGrid = page.getByRole('grid', { name: /library/i });
        const firstBookCover = libraryGrid.getByRole('figure').first();
        await expect(firstBookCover).toBeVisible();
      });

      test('should transition to book detail view upon clicking a book card', async ({ page }) => {
        const libraryGrid = page.getByRole('grid', { name: /library/i });
        const firstBook = libraryGrid.getByRole('link', { name: /book/i }).first();
        
        await firstBook.click();
        
        await expect(page).toHaveURL(/.*\/books\/.+/);
      });

      test('should support keyboard navigation through the library grid', async ({ page }) => {
        const libraryGrid = page.getByRole('grid', { name: /library/i });
        await libraryGrid.focus();
        
        await page.keyboard.press('Tab');
        
        const focusableTarget = libraryGrid.getByRole('link', { name: /book/i }).first();
        await expect(focusableTarget).toBeFocused();
      });
    });
  });

});
