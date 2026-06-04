export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface EloResult {
  newElo: number;
  delta: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  elo: number;
  league: League;
}
