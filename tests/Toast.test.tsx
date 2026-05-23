import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/ui/Toast';
import { ToastProvider, useToast } from '@/components/providers/ToastProvider';

describe('Toast component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title and description', () => {
    const onDismiss = vi.fn();
    render(
      <Toast id="1" title="Hello" description="World" onDismiss={onDismiss} />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('renders default variant classes', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Toast id="1" title="Default" onDismiss={onDismiss} />
    );
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-white');
  });

  it('renders success variant classes', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Toast id="1" title="Success" variant="success" onDismiss={onDismiss} />
    );
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-green-50');
  });

  it('renders xp variant classes', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Toast id="1" title="XP" variant="xp" onDismiss={onDismiss} />
    );
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-purple-50');
  });

  it('renders friend variant classes', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Toast id="1" title="Friend" variant="friend" onDismiss={onDismiss} />
    );
    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveClass('bg-blue-50');
  });

  it('auto-dismisses after duration', () => {
    const onDismiss = vi.fn();
    render(<Toast id="1" title="Auto" duration={1000} onDismiss={onDismiss} />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
    vi.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('dismisses manually on button click', () => {
    const onDismiss = vi.fn();
    render(<Toast id="1" title="Manual" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('does not call onDismiss if unmounted before timer', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <Toast id="1" title="Unmount" duration={5000} onDismiss={onDismiss} />
    );
    unmount();
    vi.advanceTimersByTime(5000);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('ToastProvider', () => {
  const ToastTrigger = () => {
    const { toast } = useToast();
    return (
      <div>
        <button onClick={() => toast({ title: 'Test Toast' })}>Add Toast</button>
        <button onClick={() => toast({ title: 'Second' })}>Add Second</button>
      </div>
    );
  };

  it('adds toast on call', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  it('stacks multiple toasts', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Add Toast' }));
    await user.click(screen.getByRole('button', { name: 'Add Second' }));
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('throws when useToast called outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      const Broken = () => {
        useToast();
        return null;
      };
      render(<Broken />);
    }).toThrow('useToast must be used within a ToastProvider');
    consoleError.mockRestore();
  });
});
