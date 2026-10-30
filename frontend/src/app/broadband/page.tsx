'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, Gauge, Search, Tv, Sparkles, ArrowRight } from 'lucide-react';

export default function BroadbandLanding() {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [speedResult, setSpeedResult] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.trim().length < 3) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    router.push(`/broadband/results?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}`);
  };

  const runSpeedTest = () => {
    setSpeedTestRunning(true);
    setSpeedResult(null);
    setTimeout(() => {
      setSpeedResult(Math.floor(Math.random() * 80) + 45); // Simulated speed test
      setSpeedTestRunning(false);
    }, 2500);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <Wifi size={16} /> UK's #1 Broadband Comparison Service
              </div>
              <h1 className="hero-title">
                Compare Broadband Deals & <span>Save Up To £480</span>
              </h1>
              <p className="hero-subtitle">
                Find superfast fibre & TV packages available at your exact postcode from BT, Sky, Virgin Media, Vodafone, and more.
              </p>
              
              <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>✓ Seamless Switch</span>
                <span>✓ No connection loss</span>
                <span>✓ Free Setup Deals</span>
              </div>
            </div>

            {/* Postcode Card */}
            <div className="hero-calc-card">
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Check Broadband Availability</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Enter your postcode to see exact speeds & prices available in your street.
              </p>

              <form onSubmit={handleSubmit} className="postcode-form">
                <div className="postcode-input-group">
                  <Search className="postcode-icon" size={20} />
                  <input
                    type="text"
                    className="postcode-input"
                    placeholder="e.g. SW1A 1AA or M1 1AG"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                {error && <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>{error}</span>}

                <button type="submit" className="btn-hero-action">
                  Compare Broadband Deals <ArrowRight size={18} />
                </button>
              </form>

              {/* Speed Test Modal / Trigger */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Don't know your current internet speed?
                </div>
                <button 
                  onClick={runSpeedTest} 
                  disabled={speedTestRunning}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  <Gauge size={16} color="var(--brand-accent)" /> 
                  {speedTestRunning ? 'Testing your connection...' : 'Run Broadband Speed Test'}
                </button>

                {speedResult !== null && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--brand-accent-light)', borderRadius: 'var(--radius-sm)', color: 'var(--brand-accent)', fontWeight: 700 }}>
                    ⚡ Your estimated download speed is <strong>{speedResult} Mbps</strong>!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Speed & Package Options */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Broadband Types</span>
            <h2>Choose the right internet speed for your home</h2>
          </div>

          <div className="category-grid">
            <div className="category-card">
              <div>
                <div className="category-icon-wrapper">
                  <Wifi size={24} />
                </div>
                <h3 className="category-card-title">Standard Fibre</h3>
                <p className="category-card-desc">Average 35 - 67 Mbps. Perfect for everyday web browsing, streaming HD videos, and small households.</p>
              </div>
              <div className="category-card-link">From £22/mo</div>
            </div>

            <div className="category-card" style={{ borderColor: 'var(--brand-accent)' }}>
              <div>
                <div className="category-icon-wrapper" style={{ background: 'var(--brand-accent)', color: 'white' }}>
                  <Sparkles size={24} />
                </div>
                <h3 className="category-card-title">Ultrafast Full Fibre</h3>
                <p className="category-card-desc">Average 100 - 900+ Mbps. Ideal for 4K streaming, heavy gaming, working from home, and multiple connected devices.</p>
              </div>
              <div className="category-card-link">From £28/mo</div>
            </div>

            <div className="category-card">
              <div>
                <div className="category-icon-wrapper">
                  <Tv size={24} />
                </div>
                <h3 className="category-card-title">Broadband & TV Bundles</h3>
                <p className="category-card-desc">Combine high-speed broadband with Sky TV, Virgin Stream, or BT Entertainment packages to save extra.</p>
              </div>
              <div className="category-card-link">From £38/mo</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
