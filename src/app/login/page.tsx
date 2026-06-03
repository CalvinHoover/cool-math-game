'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Login.css';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.replace('/dashboard');
        }
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.replace('/dashboard');
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
      <h1 className="main-title">World of Math</h1>
      <p className="sub-title">LOGIN</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-msg">{error}</p>}

        <button className="btn-login" type="submit">
          Login
        </button>
      </form>

      <p className="signup-link" onClick={() => router.push('/signup')}>
        No account? Sign up here
      </p>
    </div>
  );
}
