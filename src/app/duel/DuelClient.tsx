'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DuelBoard from '../../features/duel/components/DuelBoard';
import { joinQueue, leaveQueue } from '../../features/elo/api';
import '../dashboard/Dashboard.css';

type Phase = 'menu' | 'searching' | 'playing' | 'finished';

interface EloResult {
  newElo: number;
  delta: number;
}

function generateBotElo(playerElo: number): number {
  const offset = Math.floor(Math.random() * 200) - 100;
  return Math.max(500, playerElo + offset);
}

export default function DuelClient({ playerElo }: { playerElo: number }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('menu');
  const [countdown, setCountdown] = useState(5);
  const [botElo, setBotElo] = useState(1000);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [eloResult, setEloResult] = useState<EloResult | null>(null);

  // 5-second countdown then start game
  useEffect(() => {
    if (phase !== 'searching') return;

    setCountdown(5);
    const tick = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [phase]);

  async function beginSearch() {
    setBotElo(generateBotElo(playerElo));
    setPhase('searching');
  }

  async function startGame() {
    try {
      const result = await joinQueue();
      if (!result.matched) await leaveQueue();
    } catch {
      // queue unavailable — just start bot game
    }
    setPhase('playing');
  }

  async function handleGameOver(result: 'player' | 'opponent') {
    setWinner(result);
    setPhase('finished');

    try {
      const res = await fetch('/api/elo/bot-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botElo, playerWon: result === 'player' }),
      });
      if (res.ok) setEloResult(await res.json());
    } catch {
      // ELO update failed silently
    }
  }

  function playAgain() {
    setWinner(null);
    setEloResult(null);
    beginSearch();
  }

  if (phase === 'searching') {
    return (
      <div className="app-container">
        <h1 className="main-title">Math Duels!</h1>
        <p style={{ color: '#00FFFF', fontFamily: 'Courier New', fontSize: '1.2rem', marginBottom: '12px' }}>
          Searching for an opponent...
        </p>
        <p style={{ color: '#FFFF00', fontFamily: 'Courier New', fontSize: '3rem', fontWeight: 'bold' }}>
          {countdown}
        </p>
        <p style={{ color: '#888', fontFamily: 'Courier New', fontSize: '0.85rem', marginTop: '12px' }}>
          No match found? You&apos;ll face a bot.
        </p>
      </div>
    );
  }

  if (phase === 'playing') {
    return <DuelBoard onGameOver={handleGameOver} botElo={botElo} />;
  }

  if (phase === 'finished' && winner) {
    const won = winner === 'player';
    return (
      <div className="app-container">
        <h1 className="main-title">You {won ? 'Win!' : 'Lose!'}</h1>

        {eloResult ? (
          <div style={{ textAlign: 'center', marginBottom: '24px', fontFamily: 'Courier New' }}>
            <p style={{ color: eloResult.delta >= 0 ? '#00FF00' : '#FF4444', fontSize: '1.6rem', fontWeight: 'bold' }}>
              {eloResult.delta >= 0 ? '+' : ''}{eloResult.delta} ELO
            </p>
            <p style={{ color: '#FFFF00', fontSize: '1rem' }}>
              New rating: {eloResult.newElo}
            </p>
          </div>
        ) : (
          <p style={{ color: '#888', fontFamily: 'Courier New', marginBottom: '24px' }}>Updating ELO...</p>
        )}

        <div className="button-group">
          <MenuButton label="Play Again" onClick={playAgain} className="btn-profile" />
          <MenuButton label="Leaderboard" onClick={() => router.push('/leaderboard')} className="btn-leaderboard" />
          <MenuButton label="Back to Menu" onClick={() => router.push('/dashboard')} className="btn-settings" />
        </div>
      </div>
    );
  }

  // Menu
  return (
    <div className="app-container">
      <h1 className="main-title">Math Duels!</h1>
      <p style={{ color: '#00FFFF', fontFamily: 'Courier New', marginBottom: '20px' }}>
        Your ELO: {playerElo}
      </p>
      <div className="button-group">
        <MenuButton label="Find Match" onClick={beginSearch} className="btn-practice" />
        <MenuButton label="Back to Menu" onClick={() => router.push('/dashboard')} className="btn-settings" />
      </div>
    </div>
  );
}
