import { test, expect } from '@playwright/test';

test.describe('Tier 4: Scenario 2', () => {
  test('Teacher designs lesson plan starting in Chat, moving to Studio', async ({ page }) => {
    // 1. Open the application.
    await page.goto('/');

    // 2. Toggle the Collapsible Sidebar to enter Teacher Mode (Chat-centric layout).
    const sidebarToggle = page.getByTestId('sidebar-toggle');
    await sidebarToggle.click();
    
    const teacherModeLink = page.getByTestId('nav-teacher-mode');
    await teacherModeLink.click();

    // Verify chat layout is visible
    const chatLayout = page.getByTestId('chat-centric-layout');
    await expect(chatLayout).toBeVisible();

    // 3. Type a message in the chat input (e.g., "Design a lesson plan") and submit.
    const chatInput = page.getByTestId('chat-input');
    await chatInput.fill('Design a lesson plan');
    
    const chatSubmitBtn = page.getByTestId('chat-submit-btn');
    await chatSubmitBtn.click();

    // 4. Verify the chat history updates with the user's message and a placeholder response.
    const chatMessages = page.getByTestId('chat-message');
    // Expect at least user message and bot response
    await expect(chatMessages).toHaveCount(2);
    
    const userMessage = chatMessages.nth(0);
    await expect(userMessage).toContainText('Design a lesson plan');
    
    const botResponse = chatMessages.nth(1);
    await expect(botResponse).toBeVisible();

    // 5. Open the "Studio" Control Panel to configure the lesson settings.
    const studioToggleBtn = page.getByTestId('studio-toggle-btn');
    await studioToggleBtn.click();

    // 6. Verify the control panel opens alongside or over the chat interface.
    const studioPanel = page.getByTestId('studio-control-panel');
    await expect(studioPanel).toBeVisible();
    
    // Ensure chat layout is still in the DOM (maybe obscured, or alongside)
    await expect(chatLayout).toBeAttached();
    
    // Check an interactive element inside the studio
    const studioConfigInput = page.getByTestId('studio-config-input');
    await expect(studioConfigInput).toBeVisible();
  });
});
