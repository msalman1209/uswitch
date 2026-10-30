'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Car, Home, HeartPulse, Plane, ArrowRight, 
  CheckCircle2, ChevronRight, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const MOCK_INSURANCE_QUOTES = {
  car: [
    {
      id: 'ins-car-1',
      provider: 'Admiral',
      logo: '🚗',
      planName: 'Gold Comprehensive Cover',
      monthlyPrice: 38.50,
      annualPrice: 420.00,
      excess: 250,
      rating: 4.8,
      includes: ['Courtesy Car Included', 'Windscreen Repair Covered', '£100k Motor Legal Protection', '24/7 UK Claims Helpline'],
      badge: 'Best Value Pick'
    },
    {
      id: 'ins-car-2',
      provider: 'Aviva',
      logo: '🛡️',
      planName: 'Aviva Zero Carbon Comprehensive',
      monthlyPrice: 41.20,
      annualPrice: 450.00,
      excess: 200,
      rating: 4.7,
      includes: ['RAC Roadside Breakdown included', 'Uninsured driver promise', 'Personal belongings up to £500', 'New car replacement'],
      badge: 'Includes Breakdown'
    },
    {
      id: 'ins-car-3',
      provider: 'Hastings Direct',
      logo: '⚡',
      planName: 'Hastings Premier Cover',
      monthlyPrice: 34.90,
      annualPrice: 385.00,
      excess: 300,
      rating: 4.6,
      includes: ['Vandalism cover promise', 'European driving cover (90 days)', 'Key cover up to £1,500', 'Manage on Hastings App'],
      badge: 'Lowest Price'
    }
  ],
  home: [
    {
      id: 'ins-home-1',
      provider: 'Direct Line',
      logo: '🏠',
      planName: 'Combined Buildings & Contents',
      monthlyPrice: 19.50,
      annualPrice: 215.00,
      excess: 150,
      rating: 4.9,
      includes: ['Up to £1M Buildings Cover', '£75k Contents Cover', 'Home Emergency 24/7 Helpline', 'Accidental Damage Protection'],
      badge: 'Top Rated Home'
    },
    {
      id: 'ins-home-2',
      provider: 'Churchill',
      logo: '🐶',
      planName: 'Home Plus Protection',
      monthlyPrice: 16.80,
      annualPrice: 185.00,
      excess: 200,
      rating: 4.7,
      includes: ['New for old contents replacement', 'Alternative accommodation cover', 'Garden and outdoor contents up to £2,500'],
      badge: 'Popular Deal'
    }
  ],
  pet: [
    {
      id: 'ins-pet-1',
      provider: 'Bought By Many (ManyPets)',
      logo: '🐾',
      planName: 'Lifetime Pet Health Plan',
      monthlyPrice: 14.20,
      annualPrice: 155.00,
      excess: 99,
      rating: 4.8,
      includes: ['£7,000 vet fee cover replenished annually', 'Video vet consultations free 24/7', 'Dental illness and accident included'],
      badge: 'Lifetime Vet Cover'
    }
  ],
  travel: [
    {
      id: 'ins-travel-1',
      provider: 'AllClear Travel',
      logo: '✈️',
      planName: 'Worldwide Annual Multi-Trip',
      monthlyPrice: 8.50,
      annualPrice: 95.00,
      excess: 50,
      rating: 4.9,
      includes: ['Up to £15M Emergency Medical cover', '£5,000 Cancellation cover', 'Baggage & passport loss cover', 'COVID-19 coverage included'],
      badge: 'Worldwide Cover'
    }
  ]
};

export default function InsurancePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<'car' | 'home' | 'pet' | 'travel'>('car');
  const [postcode, setPostcode] = useState('SW1A 1AA');
  const [coverLevel, setCoverLevel] = useState<'comprehensive' | 'third-party'>('comprehensive');
  const [ncdYears, setNcdYears] = useState<number>(5);

  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotes, setQuotes] = useState<any[]>(MOCK_INSURANCE_QUOTES.car);
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const insuranceTypes = [
    { id: 'car', title: 'Car Insurance', icon: <Car size={24} />, badge: 'Save up to £319' },
    { id: 'home', title: 'Home & Contents', icon: <Home size={24} />, badge: 'From £16/mo' },
    { id: 'pet', title: 'Pet Insurance', icon: <HeartPulse size={24} />, badge: 'Up to £7k Vet' },
    { id: 'travel', title: 'Travel Insurance', icon: <Plane size={24} />, badge: 'From £8/mo' }
  ];

  const handleCategorySwitch = (catId: 'car' | 'home' | 'pet' | 'travel') => {
    setActiveCategory(catId);
    setLoadingQuotes(true);
    setTimeout(() => {
      setQuotes(MOCK_INSURANCE_QUOTES[catId] || []);
      setLoadingQuotes(false);
    }, 400);
  };

  const handleSelectQuote = async (quote: any) => {
    setSelectedQuote(quote);
    setSavingPolicy(false);
    setSaveSuccess(false);
  };

  const handleConfirmSwitch = async () => {
    if (!selectedQuote) return;
    setSavingPolicy(true);

    const token = localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token');
    if (!token) {
      const tempInfo = {
        category: 'insurance',
        supplierName: selectedQuote.provider,
        planName: selectedQuote.planName,
        costMonthly: selectedQuote.monthlyPrice,
        costAnnual: selectedQuote.annualPrice,
        savingAnnual: 120.00
      };
      sessionStorage.setItem('nexgen_temp_switch', JSON.stringify(tempInfo));
      sessionStorage.setItem('uswitch_temp_switch', JSON.stringify(tempInfo));
      router.push('/login?redirect=/dashboard');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/comparisons/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: 'insurance',
          supplierName: selectedQuote.provider,
          planName: selectedQuote.planName,
          costMonthly: selectedQuote.monthlyPrice,
          costAnnual: selectedQuote.annualPrice,
          savingAnnual: 120.00
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSelectedQuote(null);
          router.push('/dashboard');
        }, 1500);
      } else {
        alert('Could not save policy to dashboard.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPolicy(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #0a192f 100%)', padding: '60px 0 70px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> Compare 100+ Top UK Insurers • FCA Authorized
              </div>
              <h1 className="hero-title">
                Compare Insurance Quotes. <span>Save Up to £319.</span>
              </h1>
              <p className="hero-subtitle">
                Compare competitive cover from Admiral, Aviva, Churchill, Direct Line and Hastings Direct in under 2 minutes.
              </p>

              <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Instant online quotes</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> No hidden broker fees</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Free legal cover options</span>
              </div>
            </div>

            {/* Quote Configurator Card */}
            <div className="hero-calc-card">
              <h3 style={{ marginBottom: '14px', fontSize: '1.25rem' }}>Select Insurance Type</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '18px' }}>
                {insuranceTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleCategorySwitch(t.id as any)}
                    style={{
                      padding: '10px 12px', borderRadius: '12px',
                      border: activeCategory === t.id ? '2px solid #00b050' : '1px solid #e2e8f0',
                      background: activeCategory === t.id ? '#e6f7ec' : '#ffffff',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ color: activeCategory === t.id ? '#00b050' : '#64748b' }}>{t.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a192f' }}>{t.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#00b050', fontWeight: 600 }}>{t.badge}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Filter Inputs */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Your Postcode</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>No Claims Discount</label>
                  <select 
                    className="form-control"
                    value={ncdYears}
                    onChange={(e) => setNcdYears(parseInt(e.target.value))}
                    style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Year' : 'Years'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-hero-action"
                onClick={() => {
                  const el = document.getElementById('quotes-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Compare Live Quotes <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTES LIST CONTAINER */}
      <section id="quotes-container" className="container" style={{ marginTop: '50px' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-tag">{activeCategory.toUpperCase()} INSURANCE</span>
              <h2 style={{ fontSize: '1.75rem', margin: '4px 0' }}>
                Live Quotes for {postcode} ({ncdYears}y No Claims Discount)
              </h2>
              <p style={{ color: '#64748b', margin: 0 }}>Showing fully regulated policies with immediate cover start available.</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCoverLevel('comprehensive')}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                  background: coverLevel === 'comprehensive' ? '#00b050' : '#ffffff',
                  color: coverLevel === 'comprehensive' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                Comprehensive
              </button>
              <button
                type="button"
                onClick={() => setCoverLevel('third-party')}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                  background: coverLevel === 'third-party' ? '#00b050' : '#ffffff',
                  color: coverLevel === 'third-party' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                Third Party Only
              </button>
            </div>
          </div>
        </div>

        {loadingQuotes ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: '#00b050', margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 600, color: '#0a192f' }}>Fetching real-time insurance quotes...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {quotes.map((q) => (
              <div 
                key={q.id}
                style={{
                  background: '#ffffff', borderRadius: '16px', padding: '24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{q.logo}</span>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0a192f' }}>{q.provider}</h3>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{q.planName}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: '#e6f7ec', color: '#008a00', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                      {q.badge}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      ★ {q.rating}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Voluntary Excess</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0a192f', marginTop: '2px' }}>
                    £{q.excess}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00b050', fontWeight: 600 }}>Includes £100 compulsory excess</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Payment Options</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#00b050', marginTop: '2px' }}>
                    £{q.monthlyPrice.toFixed(2)}<span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Or pay £{q.annualPrice.toFixed(2)} annually</div>
                </div>

                <div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', fontSize: '0.8rem', color: '#475569' }}>
                    {q.includes.map((inc: string, i: number) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <CheckCircle2 size={13} color="#00b050" /> {inc}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectQuote(q)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'center' }}
                  >
                    Select Quote <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONFIRMATION / SWITCH MODAL */}
      {selectedQuote && (
        <div className="modal-backdrop" onClick={() => setSelectedQuote(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f7ec', color: '#00b050', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={36} strokeWidth={2.5} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0a192f', margin: 0 }}>
                Lock In {selectedQuote.provider} Quote
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                {selectedQuote.planName}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Monthly Premium:</span>
                <span style={{ fontWeight: 800, color: '#00b050', fontSize: '1.15rem' }}>£{selectedQuote.monthlyPrice.toFixed(2)}/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Annual Equivalent:</span>
                <span style={{ fontWeight: 700, color: '#0a192f' }}>£{selectedQuote.annualPrice.toFixed(2)}/yr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Estimated Annual Saving:</span>
                <span style={{ fontWeight: 800, color: '#00b050' }}>£120.00</span>
              </div>
            </div>

            {saveSuccess ? (
              <div style={{ textAlign: 'center', padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem' }}>
                ✓ Policy saved to your NexGen Dashboard! Redirecting...
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleConfirmSwitch}
                  disabled={savingPolicy}
                  className="btn-primary" 
                  style={{ flex: 1, padding: '12px' }}
                >
                  {savingPolicy ? 'Confirming...' : 'Confirm Policy & Switch'} <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => setSelectedQuote(null)} 
                  className="btn-outline" 
                  style={{ padding: '12px 18px' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
