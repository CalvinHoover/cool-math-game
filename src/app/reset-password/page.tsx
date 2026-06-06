'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../login/Login.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: code.trim(), newPassword }),
    });

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      try {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
      } catch {
        setError('Something went wrong');
      }
    }
  }

  if (done) {
    return (
      <div className="app-container">
        <h1 className="main-title">Cool Math Game</h1>
        <p className="sub-title">ALL DONE!</p>
        <p style={{ color: '#00FF00', fontFamily: 'Courier New' }}>
          Password reset. Logging you in!
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="main-title">Cool Math Game</h1>
      <p className="sub-title">RESET PASSWORD</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="text"
          placeholder="6-digit code from email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          required
        />
        <input
          className="form-input"
          type="password"
          placeholder="New password (8+ chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
        {error && <p className="error-msg">{error}</p>}
        <button className="btn-login" type="submit">
          Reset Password
        </button>
      </form>

      <p className="signup-link" onClick={() => router.push('/forgot-password')}>
        Need a new code?
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
