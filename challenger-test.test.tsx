import { render, screen } from '@testing-library/react';
import { ParticleBackground } from './src/components/theme/ParticleBackground';
import { Sidebar } from './src/components/layout/Sidebar';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

describe('Adversarial Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ParticleBackground cleans up requestAnimationFrame on unmount', () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');

    const { unmount } = render(<ParticleBackground />);
    
    expect(rafSpy).toHaveBeenCalled();
    const initialCafCalls = cafSpy.mock.calls.length;
    
    unmount();
    
    expect(cafSpy.mock.calls.length).toBeGreaterThan(initialCafCalls);
    
    const rafCallsAfterUnmount = rafSpy.mock.calls.length;
    vi.advanceTimersByTime(1000);
    expect(rafSpy.mock.calls.length).toBe(rafCallsAfterUnmount);
  });

  it('Sidebar retains accessible names when collapsed', () => {
    render(
      <Sidebar activeView="teacher" onViewChange={() => {}} isCollapsed={true} onToggleCollapse={() => {}} />
    );
    
    const teacherTab = screen.getByRole('tab', { name: 'Teacher View' });
    const booksTab = screen.getByRole('tab', { name: 'Books View' });
    
    expect(teacherTab).toBeInTheDocument();
    expect(booksTab).toBeInTheDocument();
  });
});
