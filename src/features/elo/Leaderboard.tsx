'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard } from './api';
import { LeagueBadge } from './LeagueBadge';
import type { LeaderboardEntry } from './types';
import './elo.css';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => { setEntries(data); setStatus('done'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="leaderboard-page">
      <h1 className="leaderboard-title">Leaderboard</h1>

      {status === 'loading' && <p className="status-text">Loading...</p>}
      {status === 'error'   && <p className="error-text">Could not load leaderboard.</p>}

      {status === 'done' && (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>League</th>
              <th>ELO</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.username}>
                <td className={e.rank <= 3 ? 'rank-top' : 'rank-normal'}>{e.rank}</td>
                <td>{e.username}</td>
                <td><LeagueBadge league={e.league} /></td>
                <td className="elo-col">{e.elo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
