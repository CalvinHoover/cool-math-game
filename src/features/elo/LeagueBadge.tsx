import type { League } from './types';
import { LEAGUE_COLORS } from './leagues';
import './elo.css';

export function LeagueBadge({ league }: { league: League }) {
  return (
    <span
      className="league-badge"
      style={{ backgroundColor: LEAGUE_COLORS[league] }}
    >
      {league}
    </span>
  );
}
