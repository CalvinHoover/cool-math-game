'use client';
// src/app/leaderboard/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import '../dashboard/Dashboard.css';

interface LeaderboardEntry {
  id:       string;
  username: string;
  elo:      number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries,  setEntries]  = useState<LeaderboardEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load leaderboard');
        return res.json();
      })
      .then((data: LeaderboardEntry[]) => setEntries(data))
      .catch(() => setError('Could not load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-container">
      <h1 className="main-title">Leaderboard</h1>

      {loading && <p style={{ color: '#aaa' }}>Loading...</p>}
      {error   && <p style={{ color: '#f55' }}>{error}</p>}

      {!loading && !error && (
        <table style={{ width: '100%', maxWidth: '480px', borderCollapse: 'collapse', marginBottom: '2rem', fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaa' }}>
              <th style={{ textAlign: 'left',  padding: '6px 12px' }}>#</th>
              <th style={{ textAlign: 'left',  padding: '6px 12px' }}>Player</th>
              <th style={{ textAlign: 'right', padding: '6px 12px' }}>ELO</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                style={{
                  borderBottom: '1px solid #222',
                  color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#fff',
                }}
              >
                <td style={{ padding: '6px 12px' }}>{index + 1}</td>
                <td style={{ padding: '6px 12px' }}>{entry.username}</td>
                <td style={{ padding: '6px 12px', textAlign: 'right' }}>{entry.elo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <MenuButton
        label="Back to Menu"
        onClick={() => router.push('/dashboard')}
        className="btn-settings"
      />
    </div>
  );
}
