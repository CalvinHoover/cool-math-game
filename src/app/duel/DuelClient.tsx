'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import DuelBoard from '../../features/duel/components/DuelBoard';
import '../dashboard/Dashboard.css';

type Phase = 'menu' | 'searching' | 'playing' | 'finished';

interface EloResult {
  newElo:  number;
  delta:   number;
}

function generateBotElo(playerElo: number): number {
  const offset = Math.floor(Math.random() * 200) - 100;
  return Math.max(500, playerElo + offset);
}

const SEARCH_SECONDS = 10; 

export default function DuelClient({ playerElo, username }: { playerElo: number, username: string }) {
  const router    = useRouter();
  const [phase,      setPhase]      = useState<Phase>('menu');
  const [countdown,  setCountdown]  = useState(SEARCH_SECONDS);
  const [botElo,     setBotElo]     = useState(1000);
  const [winner,     setWinner]     = useState<'player' | 'opponent' | null>(null);
  const [eloResult,  setEloResult]  = useState<EloResult | null>(null);

  const [opponentName, setOpponentName] = useState<string>('Bot');

  const matchIdRef  = useRef<string | null>(null);
  const matchedRef  = useRef(false);

  const leaveQueue = useCallback(async () => {
    try {
      await fetch('/api/duel/dequeue', { method: 'POST' }); 
    } catch { }
  }, []);

  // Catch the user closing the tab or reloading
  useEffect(() => {
    const handleUnload = () => {
      const matchId = matchIdRef.current;
      
      if (matchId) {
        if (!matchedRef.current) {
          // They closed the tab while searching
          navigator.sendBeacon('/api/duel/dequeue'); // Send a beacon to the dequeue route
        } else {
          //  They closed the tab while in am match
          // Send a 'game_over' event directly to the match channel.
          const payload = JSON.stringify({ type: 'game_over', payload: {} });
          
          // sendBeacon requires a Blob if you want to send JSON data
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`/api/duel/${matchId}/event`, blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  useEffect(() => {
    if (phase !== 'searching') return;

    setCountdown(SEARCH_SECONDS);
    matchedRef.current = false;
    setOpponentName('Bot');

    // 1. Initial matchmake attempt
    fetch('/api/duel/matchmake', { method: 'POST' })
      .then(res => res.json())
      .then((data) => {
        matchIdRef.current = data.matchId;

        // Player 2 joined an existing match instantly
        if (data.role === 'player2') {
          matchedRef.current = true;
          setOpponentName(data.opponentName);
          setPhase('playing');
        }
      })
      .catch(() => {});

    // 2. Polling if we are Player 1 waiting for Player 2
    const tick = setInterval(async () => {
      if (matchedRef.current) { clearInterval(tick); return; }

      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(tick);
          startBotGame(); 
          return 0;
        }
        return prev - 1;
      });

      const matchId = matchIdRef.current;
      if (matchId) {
        try {
          const res = await fetch(`/api/duel/${matchId}/status`);
          const data = await res.json();
          
          if (data.status === 'active' && !matchedRef.current) {
            matchedRef.current = true;
            setOpponentName(data.opponentName); 
            clearInterval(tick);
            setPhase('playing');
          }
        } catch { /* keep polling */ }
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      if (!matchedRef.current) {
        leaveQueue();
      }
    };
  }, [phase, leaveQueue]);

  // Helper for when the timer hits 0
  function startBotGame() {
    leaveQueue();
    matchIdRef.current = null;
    setPhase('playing');
  }

  async function handleGameOver(result: 'player' | 'opponent') {
    setWinner(result);
    setPhase('finished');

    try {
      const res = await fetch('/api/elo/bot-result', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ botElo, playerWon: result === 'player' }),
      });
      if (res.ok) setEloResult(await res.json());
    } catch { /* ELO update failed silently */ }
  }

  function beginSearch() {
    setBotElo(generateBotElo(playerElo));
    matchIdRef.current = null;
    setPhase('searching');
  }

  function playAgain() {
    setWinner(null);
    setEloResult(null);
    beginSearch();
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
    return (
      <DuelBoard 
        onGameOver={handleGameOver} 
        matchId={matchIdRef.current || undefined} 
        playerName={username} 
        opponentName={opponentName} 
      />
    );
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
          <MenuButton label="Play Again"     onClick={playAgain}                          className="btn-profile"     />
          <MenuButton label="Leaderboard"    onClick={() => router.push('/leaderboard')}  className="btn-leaderboard" />
          <MenuButton label="Back to Menu"   onClick={() => router.push('/dashboard')}    className="btn-settings"    />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Math Duels!</h1>
      <p style={{ color: '#00FFFF', fontFamily: 'Courier New', marginBottom: '20px' }}>
        Your ELO: {playerElo}
      </p>
      <div className="button-group">
        <MenuButton label="Find Match"   onClick={beginSearch}                        className="btn-practice" />
        <MenuButton label="Back to Menu" onClick={() => router.push('/dashboard')}    className="btn-settings" />
      </div>
    </div>
  );
}