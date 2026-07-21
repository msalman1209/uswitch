'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Car, Home, HeartPulse, Plane, Search, ArrowRight, CheckCircle2, Star } from 'lucide-react';

export default function InsurancePage() {
  const [activeCategory, setActiveCategory] = useState<'car' | 'home' | 'pet' | 'travel'>('car');
  const [postcode, setPostcode] = useState('');

  const insuranceTypes = [
    {
      id: 'car',
      title: 'Car Insurance',
      icon: <Car size={28} />,
      desc: 'Compare quotes from 110+ UK car insurers & save up to £319/yr.',
      badge: 'Save up to £319',
      color: '#8b5cf6'
    },
    {
      id: 'home',
      title: 'Home Insurance',
      icon: <Home size={28} />,
      desc: 'Protect your building and contents against flood, fire, and theft.',
      badge: 'Buildings & Contents',
      color: '#00b050'
    },
    {
      id: 'pet',
      title: 'Pet Insurance',
      icon: <HeartPulse size={28} />,
      desc: 'Cover vet fees for dogs, cats, and exotic pets with zero hassle.',
      badge: 'Up to £12k Vet Cover',
      color: '#ec4899'
    },
    {
      id: 'travel',
      title: 'Travel Insurance',
      icon: <Plane size={28} />,
      desc: 'Single trip & annual multi-trip cover for medical and cancellation.',
      badge: 'Worldwide Coverage',
      color: '#3b82f6'
    }
  ];

  const insurers = ['ADMIRAL', 'AVIVA', 'AXA', 'DIRECT LINE', 'CHURCHILL', 'HASTINGS DIRECT'];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ background: 'linear-gradient(180deg, #2e1065 0%, #0a192f 100%)', padding: '60px 0 80px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> Compare 100+ Top UK Insurers
              </div>
              <h1 className="hero-title">
                Insurance Quotes. <span>Guaranteed Savings.</span>
              </h1>
              <p className="hero-subtitle">
                Don't overpay on auto, home, or travel insurance. Get tailored quotes from leading brands in under 2 minutes.
              </p>

              <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>✓ Instant Quotes</span>
                <span>✓ No hidden charges</span>
                <span>✓ FCA Authorized</span>
              </div>
            </div>

            {/* Quote Card */}
            <div className="hero-calc-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Get Instant Insurance Quote</h3>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
                {insuranceTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveCategory(type.id as any)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: activeCategory === type.id ? 'var(--brand-accent)' : 'transparent',
                      color: activeCategory === type.id ? 'white' : 'var(--text-muted)'
                    }}
                  >
                    {type.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('Redirecting to insurance quote wizard...'); }} className="postcode-form">
                <div className="postcode-input-group">
                  <Search className="postcode-icon" size={20} />
                  <input
                    type="text"
                    className="postcode-input"
                    placeholder="Enter Postcode (e.g. SW1A 1AA)"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-hero-action">
                  Compare {activeCategory.toUpperCase()} Quotes <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Types Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Insurance Categories</span>
            <h2>Protect what matters most for less</h2>
          </div>

          <div className="category-grid">
            {insuranceTypes.map((item) => (
              <div key={item.id} className="category-card">
                <div>
                  <div className="category-icon-wrapper" style={{ color: item.color, background: `${item.color}15` }}>
                    {item.icon}
                  </div>
                  <h3 className="category-card-title">{item.title}</h3>
                  <p className="category-card-desc">{item.desc}</p>
                </div>
                <div className="category-card-link" style={{ color: item.color }}>
                  Get Quote <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Insurers Banner */}
      <section className="section-padding" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            COMPARE TOP UK INSURERS IN ONE PLACE
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', fontWeight: 900, color: 'var(--brand-primary)', fontSize: '1.25rem', opacity: 0.85 }}>
            {insurers.map((ins, i) => (
              <span key={i}>{ins}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
