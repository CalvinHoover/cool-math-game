import { describe, expect, it } from 'vitest';
import { cn } from '../src/lib/utils';

describe('cn', () => {
  it('merges base classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('handles conditional classes', () => {
    const active = true;
    expect(cn('base', active && 'active')).toBe('base active');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
