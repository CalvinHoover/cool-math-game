import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';

const TestConsumer = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.documentElement.classList.remove('light', 'dark');
    window.localStorage.clear();
    matchMediaMock = vi.fn((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies dark class when system prefers dark', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider defaultTheme="system">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('reads stored theme from localStorage on mount', () => {
    window.localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('updates class when setTheme is called', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Set Dark' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set Dark' }));
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });

  it('throws when useTheme is called outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      const BrokenConsumer = () => {
        useTheme();
        return null;
      };
      render(<BrokenConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    consoleError.mockRestore();
  });
});
