import { getLeague } from './leagues';
import { LeagueBadge } from './LeagueBadge';
import './elo.css';

export function EloDisplay({ elo }: { elo: number }) {
  const league = getLeague(elo);
  return (
    <div className="elo-display">
      <span className="elo-number">{elo}</span>
      <LeagueBadge league={league} />
    </div>
  );
}
