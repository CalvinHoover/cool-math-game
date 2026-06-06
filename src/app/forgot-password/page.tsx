'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../login/Login.css';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      try {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
      } catch {
        setError('Something went wrong');
      }
    }
  }

  if (sent) {
    return (
      <div className="app-container">
        <h1 className="main-title">Cool Math Game</h1>
        <p className="sub-title">CHECK YOUR EMAIL</p>
        <p style={{ color: '#00FF00', fontFamily: 'Courier New', marginBottom: '24px', textAlign: 'center' }}>
          If that email has an account, a 6-digit code was sent to it.
        </p>
        <button
          className="btn-login"
          onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
        >
          Enter Code
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Cool Math Game</h1>
      <p className="sub-title">FORGOT PASSWORD</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="error-msg">{error}</p>}
        <button className="btn-login" type="submit">
          Send Code
        </button>
      </form>

      <p className="signup-link" onClick={() => router.push('/login')}>
        Back to login
      </p>
    </div>
  );
}
