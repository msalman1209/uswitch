'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Flame, ShieldCheck, Search, ArrowRight, Leaf, RefreshCw, Building, Home } from 'lucide-react';

export default function EnergyLandingPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#00b050' }} />
        <p style={{ fontWeight: 600, color: '#0a192f' }}>Loading Energy Comparison...</p>
      </div>
    }>
      <EnergyLanding />
    </React.Suspense>
  );
}

function EnergyLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPostcode = searchParams.get('postcode') || '';
  const initialFuel = (searchParams.get('fuel') as any) || 'both';
  const initialType = (searchParams.get('type') as any) || 'residential';

  const [customerType, setCustomerType] = useState<'residential' | 'business'>(initialType);
  const [fuelType, setFuelType] = useState<'both' | 'electricity' | 'gas'>(initialFuel);
  const [postcode, setPostcode] = useState(initialPostcode);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.trim().length < 3) {
      setError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }
    router.push(`/energy/journey?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}&fuel=${fuelType}&type=${customerType}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ background: 'linear-gradient(180deg, #071e3d 0%, #0a192f 100%)', padding: '60px 0 80px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> Ofgem Confidence Code Accredited
              </div>
              <h1 className="hero-title">
                Compare Gas & Electricity. <span>Lower Your Bills.</span>
              </h1>
              <p className="hero-subtitle">
                Compare cheap fixed tariffs and 100% green energy options from top UK suppliers in under 3 minutes.
              </p>

              <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>✓ 100% Free Service</span>
                <span>✓ No disruption to supply</span>
                <span>✓ Fixed Price Protection</span>
              </div>
            </div>

            {/* Energy Switcher Calculator Card */}
            <div className="hero-calc-card">
              <h3 style={{ marginBottom: '14px', fontSize: '1.25rem' }}>Compare Energy Tariffs</h3>

              {/* Customer Type Toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setCustomerType('residential')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                    background: customerType === 'residential' ? '#0a192f' : '#f1f5f9',
                    color: customerType === 'residential' ? '#ffffff' : '#64748b',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Home size={15} /> Home
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('business')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
                    background: customerType === 'business' ? '#00b050' : '#f1f5f9',
                    color: customerType === 'business' ? '#ffffff' : '#64748b',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Building size={15} /> Business
                </button>
              </div>

              {/* Fuel Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
                <button
                  type="button"
                  onClick={() => setFuelType('both')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: fuelType === 'both' ? 'var(--brand-accent)' : 'transparent',
                    color: fuelType === 'both' ? 'white' : 'var(--text-muted)'
                  }}
                >
                  Gas & Elec
                </button>
                <button
                  type="button"
                  onClick={() => setFuelType('electricity')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: fuelType === 'electricity' ? 'var(--brand-accent)' : 'transparent',
                    color: fuelType === 'electricity' ? 'white' : 'var(--text-muted)'
                  }}
                >
                  Electricity Only
                </button>
                <button
                  type="button"
                  onClick={() => setFuelType('gas')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: fuelType === 'gas' ? 'var(--brand-accent)' : 'transparent',
                    color: fuelType === 'gas' ? 'white' : 'var(--text-muted)'
                  }}
                >
                  Gas Only
                </button>
              </div>

              <form onSubmit={handleSubmit} className="postcode-form">
                <div className="postcode-input-group">
                  <Search className="postcode-icon" size={20} />
                  <input
                    type="text"
                    className="postcode-input"
                    placeholder="Enter Postcode (e.g. SW1A 1AA)"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                {error && <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>{error}</span>}

                <button type="submit" className="btn-hero-action">
                  Find Cheaper Energy <ArrowRight size={18} />
                </button>
              </form>

              <div className="calc-guarantee">
                <Leaf size={14} color="#00b050" /> Includes 100% Renewable Green Tariffs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Categories */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Energy Options</span>
            <h2>Choose the energy tariff that fits your household</h2>
          </div>

          <div className="category-grid">
            <div className="category-card">
              <div>
                <div className="category-icon-wrapper" style={{ color: '#00b050', background: '#e6f7ec' }}>
                  <Zap size={24} />
                </div>
                <h3 className="category-card-title">Fixed Price Tariffs</h3>
                <p className="category-card-desc">Lock in your unit rates for 12 to 24 months to protect your budget against price cap increases.</p>
              </div>
              <div className="category-card-link">Compare Fixed Rates</div>
            </div>

            <div className="category-card" style={{ borderColor: '#00b050' }}>
              <div>
                <div className="category-icon-wrapper" style={{ color: '#ffffff', background: '#00b050' }}>
                  <Leaf size={24} />
                </div>
                <h3 className="category-card-title">100% Green Energy</h3>
                <p className="category-card-desc">Power your home with 100% renewable electricity generated from UK wind, solar, and hydro power.</p>
              </div>
              <div className="category-card-link">View Green Deals</div>
            </div>

            <div className="category-card">
              <div>
                <div className="category-icon-wrapper" style={{ color: '#eab308', background: '#fef9c3' }}>
                  <Flame size={24} />
                </div>
                <h3 className="category-card-title">Boiler Cover & Maintenance</h3>
                <p className="category-card-desc">Protect your heating system with annual boiler servicing, emergency repairs, and free quotes.</p>
              </div>
              <div className="category-card-link">Explore Boiler Cover</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
