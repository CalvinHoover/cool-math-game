'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../login/Login.css';

export default function VerifyCodePage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      try {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
      } catch {
        setError('Something went wrong');
      }
    }
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Cool Math Game</h1>
      <p className="sub-title">VERIFY LOGIN</p>
      <p style={{ color: '#00FFFF', fontFamily: 'Courier New', marginBottom: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        A 6-digit code was sent to your email.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="text"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          required
        />
        {error && <p className="error-msg">{error}</p>}
        <button className="btn-login" type="submit">
          Verify
        </button>
      </form>

      <p className="signup-link" onClick={() => router.push('/login')}>
        Back to login
      </p>
    </div>
  );
}
