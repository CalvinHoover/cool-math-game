import type { League } from './types';

const THRESHOLDS: { league: League; min: number }[] = [
  { league: 'Master',   min: 1900 },
  { league: 'Diamond',  min: 1700 },
  { league: 'Platinum', min: 1500 },
  { league: 'Gold',     min: 1300 },
  { league: 'Silver',   min: 1100 },
  { league: 'Bronze',   min: 0    },
];

export function getLeague(elo: number): League {
  return THRESHOLDS.find(t => elo >= t.min)!.league;
}

export const LEAGUE_COLORS: Record<League, string> = {
  Bronze:   '#cd7f32',
  Silver:   '#C0C0C0',
  Gold:     '#FFD700',
  Platinum: '#00FFFF',
  Diamond:  '#b9f2ff',
  Master:   '#FF00FF',
};
