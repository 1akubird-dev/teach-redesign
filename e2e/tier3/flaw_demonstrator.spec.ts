import { test, expect } from '@playwright/test';

test.describe('Empirical Challenger Flaw Demonstrator', () => {
  test('Flaw 1: Sidebar toggle actually resizes split-view', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    await expect(page.getByTestId('split-view')).toBeVisible();

    const sidebarToggle = page.getByTestId('sidebar-toggle');
    const splitView = page.getByTestId('split-view');

    const initialBounds = await splitView.boundingBox();
    expect(initialBounds).not.toBeNull();

    await sidebarToggle.click();
    await page.waitForTimeout(500); // wait for animation/layout shift

    const newBounds = await splitView.boundingBox();
    expect(newBounds).not.toBeNull();
    // Prove that the original test missed checking actual resize
    expect(newBounds!.width).not.toBeCloseTo(initialBounds!.width, 1);
  });

  test('Flaw 3: Highlighting subset of text creates note with partial text', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('btn-library-mode').click();
    await page.getByTestId('3d-book-cover').first().click();
    await expect(page.getByTestId('split-view')).toBeVisible();
    
    const sourceText = page.getByTestId('source-text-content');
    
    await sourceText.evaluate(node => {
      const selection = window.getSelection();
      const range = document.createRange();
      
      const findTextNode = (n: Node): Node | null => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) return n;
        for (let i = 0; i < n.childNodes.length; i++) {
          const t = findTextNode(n.childNodes[i]);
          if (t) return t;
        }
        return null;
      };
      
      const textNode = findTextNode(node);
      if (textNode && textNode.textContent) {
        range.setStart(textNode, 0);
        range.setEnd(textNode, Math.min(10, textNode.textContent.length));
        selection?.removeAllRanges();
        selection?.addRange(range);
        node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      }
    });
    
    const highlightMenuBtn = page.getByTestId('btn-create-note-from-highlight');
    await highlightMenuBtn.click();
    
    const newNote = page.getByTestId('note-card').first();
    await expect(newNote).toBeVisible();
    
    const fullContent = await sourceText.textContent();
    const noteContent = await newNote.textContent();
    
    expect(noteContent).not.toContain(fullContent!.trim());
    expect(noteContent?.length).toBeLessThan(50); // should just be ~10 chars
  });
});
