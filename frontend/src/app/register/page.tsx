'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Info } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function RegisterPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <Register />
    </React.Suspense>
  );
}

function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');
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
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          postcode: postcode || 'SW1A 1AA', // default fallback
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('nexgen_token', data.token);
        localStorage.setItem('uswitch_token', data.token);
        localStorage.setItem('nexgen_user', JSON.stringify(data.user));
        localStorage.setItem('uswitch_user', JSON.stringify(data.user));
        localStorage.setItem('uswitch_user', JSON.stringify(data.user));
        
        // Push to redirect target
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
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
      <div className="wizard-card" style={{ maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Create your NexGen Account</h2>
          <p style={{ marginTop: '6px' }}>Save your comparisons, track active switches, and track smart meter costs</p>
        </div>

        {error && (
          <div className="alert-box warning" style={{ fontSize: '0.85rem', padding: '12px' }}>
            <Info size={16} />
            <div>
              {error === 'Email already registered' ? (
                <span>
                  Yeh email pehle se registered hai! Aap{' '}
                  <Link href={`/login?email=${encodeURIComponent(email)}`} style={{ textDecoration: 'underline', fontWeight: 700, color: '#00b050' }}>
                    Yahan Click Karke Sign In Karein
                  </Link>{' '}
                  ya koi doosra email use karein.
                </span>
              ) : (
                <span>{error}</span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                className="form-control"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label" htmlFor="postcode">Home Postcode</label>
            <input
              type="text"
              id="postcode"
              className="form-control"
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Min 6 characters"
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
            {loading ? 'Creating account...' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: 'var(--brand-accent)', fontWeight: '600' }}>
            Sign in
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '8px', color: 'var(--text-light-grey)', fontSize: '0.8rem', justifyContent: 'center', marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <ShieldCheck size={16} />
          <span>Your information is protected by industry standard encryption.</span>
        </div>
      </div>
    </div>
  );
}
