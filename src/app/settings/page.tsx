'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MenuButton } from '../../components/interface/MenuButton';
import '../dashboard/Dashboard.css';

export default function Settings() {
  const router = useRouter();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleMsg, setToggleMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/2fa/status')
      .then((r) => r.json())
      .then((data) => setTwoFactorEnabled(data.twoFactorEnabled ?? false))
      .catch(() => setTwoFactorEnabled(false));
  }, []);

  async function handleToggle2FA() {
    setToggling(true);
    setToggleMsg('');
    try {
      const res = await fetch('/api/auth/2fa/toggle', { method: 'POST' });
      const data = await res.json();
      setTwoFactorEnabled(data.twoFactorEnabled);
      setToggleMsg(data.twoFactorEnabled ? '2FA enabled!' : '2FA disabled.');
    } catch {
      setToggleMsg('Something went wrong.');
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Settings</h1>

      <div className="button-group">
        <MenuButton
          label="Audio"
          onClick={() => console.log('Audio button clicked')}
          className="btn-practice"
        />
        <MenuButton
          label="Difficulty"
          onClick={() => console.log('Difficulty button clicked')}
          className="btn-multiplayer"
        />
        <MenuButton
          label="Back to Menu"
          onClick={() => router.push('/dashboard')}
          className="btn-settings"
        />
      </div>

      {/* 2FA Security Section */}
      <div style={{
        marginTop: '40px',
        border: '4px outset #444',
        padding: '20px 28px',
        width: '300px',
        background: '#111',
      }}>
        <p style={{ color: '#FFFF00', fontFamily: 'Courier New', fontWeight: 'bold', marginBottom: '6px', fontSize: '1rem' }}>
          SECURITY
        </p>
        <p style={{ color: '#AAAAAA', fontFamily: 'Courier New', fontSize: '0.8rem', marginBottom: '14px' }}>
          Two-Factor Authentication requires a code emailed to you every time you log in.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{
            fontFamily: 'Courier New',
            fontSize: '0.9rem',
            color: twoFactorEnabled ? '#00FF00' : '#888888',
          }}>
            2FA: {twoFactorEnabled === null ? '...' : twoFactorEnabled ? 'ON' : 'OFF'}
          </span>

          <button
            onClick={handleToggle2FA}
            disabled={toggling || twoFactorEnabled === null}
            style={{
              padding: '8px 16px',
              fontFamily: 'Courier New',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              border: '4px outset #CCCCCC',
              cursor: toggling ? 'not-allowed' : 'pointer',
              background: twoFactorEnabled ? '#FF4444' : '#00CC00',
              color: '#000000',
              textTransform: 'uppercase',
            }}
          >
            {toggling ? '...' : twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {toggleMsg && (
          <p style={{ color: '#00FFFF', fontFamily: 'Courier New', fontSize: '0.8rem', marginTop: '10px' }}>
            {toggleMsg}
          </p>
        )}
      </div>
    </div>
  );
}
