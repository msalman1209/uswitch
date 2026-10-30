'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <Login />
    </React.Suspense>
  );
}

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));
    if (token) {
      router.push(redirect);
    }
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('nexgen_token', data.token);
        localStorage.setItem('uswitch_token', data.token);
        localStorage.setItem('nexgen_user', JSON.stringify(data.user));
        localStorage.setItem('uswitch_user', JSON.stringify(data.user));
        
        // Push to redirect target
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-layout">
      <div className="wizard-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Sign in to NexGen Power Solutions</h2>
          <p style={{ marginTop: '6px' }}>Manage comparisons, smart meter usage, and switches</p>
        </div>

        {error && (
          <div className="alert-box warning" style={{ fontSize: '0.85rem', padding: '12px' }}>
            <Info size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} style={{ color: 'var(--brand-accent)', fontWeight: '600' }}>
            Register here
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-light-grey)', fontSize: '0.8rem', justifyContent: 'center', marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <ShieldCheck size={16} />
          <span>Secure SSL authentication portal</span>
        </div>
      </div>
    </div>
  );
}
