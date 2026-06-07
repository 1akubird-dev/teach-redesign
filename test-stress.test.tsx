import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';
import { describe, it, expect } from 'vitest';

describe('App Stress Test', () => {
  it('handles rapid random state transitions without breaking invariants', () => {
    render(<App />);
    
    const teacherTab = screen.getByRole('tab', { name: /teacher view/i });
    const booksTab = screen.getByRole('tab', { name: /books view/i });
    const nav = screen.getByRole('navigation');
    const main = screen.getByRole('tabpanel');
    
    // Perform 1000 random actions
    const ITERATIONS = 1000;
    
    let isCollapsed = false;
    let activeView = 'teacher';
    
    for (let i = 0; i < ITERATIONS; i++) {
      const action = Math.floor(Math.random() * 3);
      
      switch (action) {
        case 0:
          fireEvent.click(teacherTab);
          activeView = 'teacher';
          break;
        case 1:
          fireEvent.click(booksTab);
          activeView = 'books';
          break;
        case 2: {
          const toggleButton = screen.getByRole('button', { 
            name: isCollapsed ? /expand sidebar/i : /collapse sidebar/i 
          });
          fireEvent.click(toggleButton);
          isCollapsed = !isCollapsed;
          break;
        }
      }
      
      // Verification (Oracle): Check invariants after each step
      if (isCollapsed) {
        expect(nav).toHaveClass('md:w-16');
      } else {
        expect(nav).toHaveClass('md:w-64');
      }
      
      expect(teacherTab).toHaveAttribute('aria-selected', activeView === 'teacher' ? 'true' : 'false');
      expect(booksTab).toHaveAttribute('aria-selected', activeView === 'books' ? 'true' : 'false');
      
      const expectedLabelId = activeView === 'teacher' ? 'tab-teacher' : 'tab-books';
      expect(main).toHaveAttribute('aria-labelledby', expectedLabelId);
    }
  });
});
