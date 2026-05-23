import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
  it('computes width percentage correctly', () => {
    render(<ProgressBar value={25} max={100} />);
    const inner = document.querySelector('.h-full.rounded-full');
    expect(inner).toHaveAttribute('style', expect.stringContaining('width: 25%'));
  });

  it('shows 0% when value is 0', () => {
    render(<ProgressBar value={0} max={100} />);
    const inner = document.querySelector('.h-full.rounded-full');
    expect(inner).toHaveAttribute('style', expect.stringContaining('width: 0%'));
  });

  it('shows 100% when value equals max', () => {
    render(<ProgressBar value={100} max={100} />);
    const inner = document.querySelector('.h-full.rounded-full');
    expect(inner).toHaveAttribute('style', expect.stringContaining('width: 100%'));
  });

  it('clamps above 100%', () => {
    render(<ProgressBar value={150} max={100} />);
    const inner = document.querySelector('.h-full.rounded-full');
    expect(inner).toHaveAttribute('style', expect.stringContaining('width: 100%'));
  });

  it('renders label and counter when provided', () => {
    render(<ProgressBar value={30} max={100} label="XP" />);
    expect(screen.getByText('XP')).toBeInTheDocument();
    expect(screen.getByText('30 / 100')).toBeInTheDocument();
  });

  it('does not render label when omitted', () => {
    render(<ProgressBar value={50} max={100} />);
    expect(screen.queryByText('50 / 100')).not.toBeInTheDocument();
  });

  it('applies custom color class', () => {
    render(<ProgressBar value={50} max={100} color="bg-green-500" />);
    const inner = document.querySelector('.h-full.rounded-full');
    expect(inner).toHaveClass('bg-green-500');
  });
});
