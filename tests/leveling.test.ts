import { describe, expect, it } from 'vitest';
import { getLevel, getGlobalLevel } from '../src/features/xp/leveling';

describe('getLevel', () => {
  it('returns level 1 for 0 XP', () => {
    const info = getLevel(0);
    expect(info.level).toBe(1);
    expect(info.currentLevelXp).toBe(0);
  });

  it('increases level at threshold', () => {
    const info = getLevel(100);
    expect(info.level).toBe(2);
    expect(info.currentLevelXp).toBe(0);
  });

  it('handles large XP values', () => {
    const info = getLevel(10000);
    expect(info.level).toBe(101);
  });
});

describe('getGlobalLevel', () => {
  it('returns level 1 with no topics', () => {
    const info = getGlobalLevel([]);
    expect(info.level).toBe(1);
  });

  it('sums XP across topics', () => {
    const info = getGlobalLevel([
      { xp: 50 },
      { xp: 30 },
    ]);
    expect(info.level).toBe(1);
    expect(info.currentLevelXp).toBe(80);
  });
});
