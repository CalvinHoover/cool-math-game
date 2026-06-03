'use client';
// src/app/duel/page.tsx
// Entry point for the duel section.
// Shows a lobby with two options: Find a multiplayer match, or play solo.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DuelBoard from '../../features/duel/components/DuelBoard';
import '../dashboard/Dashboard.css';

type Screen = 'menu' | 'waiting' | 'solo';

export default function DuelPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('menu');
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  // ── Solo game-over screen ──────────────────────────────────────────────────

  if (winner) {
    return (
      <div className="app-container">
        <h1 className="main-title">You {winner === 'player' ? 'win!' : 'lose!'}</h1>
        <div className="button-group">
          <MenuButton
            label="Play Again"
            onClick={() => { setWinner(null); setScreen('solo'); }}
            className="btn-profile"
          />
          <MenuButton
            label="Back to Menu"
            onClick={() => router.push('/dashboard')}
            className="btn-settings"
          />
        </div>
      </div>
    );
  }

  // ── Solo game board ────────────────────────────────────────────────────────

  if (screen === 'solo') {
    return <DuelBoard onGameOver={(result) => setWinner(result)} />;
  }

  // ── Waiting for opponent ───────────────────────────────────────────────────

  if (screen === 'waiting') {
    return (
      <div className="app-container">
        <h1 className="main-title">Finding opponent...</h1>
        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Waiting for another player to join.</p>
        <MenuButton
          label="Cancel"
          onClick={() => router.push('/dashboard')}
          className="btn-settings"
        />
      </div>
    );
  }

  // ── Main menu ──────────────────────────────────────────────────────────────

  const handleFindMatch = async () => {
    setScreen('waiting');

    try {
      const res = await fetch('/api/duel/matchmake', { method: 'POST' });
      if (!res.ok) throw new Error('Matchmake failed');

      const { matchId, role } = await res.json();

      if (role === 'player2') {
        // Opponent was already waiting — go straight to the game
        router.push(`/duel/${matchId}`);
        return;
      }

      // We created the match — poll until an opponent joins
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/duel/${matchId}/status`);
          const { status } = await statusRes.json();
          if (status === 'active') {
            clearInterval(interval);
            router.push(`/duel/${matchId}`);
          }
        } catch {
          // swallow transient errors and keep polling
        }
      }, 1000);
    } catch {
      alert('Could not connect to matchmaking. Please try again.');
      setScreen('menu');
    }
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Math Duels!</h1>
      <div className="button-group">
        <MenuButton
          label="Find Match"
          onClick={handleFindMatch}
          className="btn-profile"
        />
        <MenuButton
          label="Solo Practice"
          onClick={() => setScreen('solo')}
          className="btn-profile"
        />
        <MenuButton
          label="Back to Menu"
          onClick={() => router.push('/dashboard')}
          className="btn-settings"
        />
      </div>
    </div>
  );
}
