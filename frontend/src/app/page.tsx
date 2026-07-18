'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Wifi, Smartphone, Star, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'energy' | 'broadband' | 'sim' | 'mobile'>('energy');
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.trim().length < 3) {
      setError('Please enter a valid postcode');
      return;
    }
    setError('');
    const formattedPostcode = encodeURIComponent(postcode.trim().toUpperCase());
    
    if (activeTab === 'energy') {
      router.push(`/energy/journey?postcode=${formattedPostcode}`);
    } else if (activeTab === 'broadband') {
      router.push(`/broadband/results?postcode=${formattedPostcode}`);
    } else if (activeTab === 'sim') {
      router.push(`/sim-only?postcode=${formattedPostcode}`);
    } else if (activeTab === 'mobile') {
      router.push(`/mobile-phones?postcode=${formattedPostcode}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          {/* Decorative Grid SVG */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <h1>Doing more to get you a better deal</h1>
          <p>Compare deals on energy, broadband, and mobile bills to start saving today.</p>
        </div>
      </section>

      {/* Hero Tabbed Widget */}
      <div className="container">
        <div className="hero-card">
          <div className="search-tabs">
            <button 
              className={`search-tab ${activeTab === 'energy' ? 'active' : ''}`}
              onClick={() => { setActiveTab('energy'); setError(''); }}
            >
              <Zap size={18} />
              Energy
            </button>
            <button 
              className={`search-tab ${activeTab === 'broadband' ? 'active' : ''}`}
              onClick={() => { setActiveTab('broadband'); setError(''); }}
            >
              <Wifi size={18} />
              Broadband
            </button>
            <button 
              className={`search-tab ${activeTab === 'sim' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sim'); setError(''); }}
            >
              <Smartphone size={18} />
              SIM Only
            </button>
            <button 
              className={`search-tab ${activeTab === 'mobile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('mobile'); setError(''); }}
            >
              <Smartphone size={18} />
              Mobiles
            </button>
          </div>

          <div className="search-tab-content">
            <form onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: '16px', color: '#0f2942' }}>
                {activeTab === 'energy' && 'Compare gas & electricity deals to find your savings'}
                {activeTab === 'broadband' && 'Compare fibre broadband & TV packages in your area'}
                {activeTab === 'sim' && 'Find the best SIM-only monthly deals'}
                {activeTab === 'mobile' && 'Find handset contracts on popular networks'}
              </h3>
              
              <div className="search-input-wrapper">
                <div className="search-input-field">
                  <div className="search-input-icon">
                    {activeTab === 'energy' && <Zap size={20} />}
                    {activeTab === 'broadband' && <Wifi size={20} />}
                    {activeTab === 'sim' && <Smartphone size={20} />}
                    {activeTab === 'mobile' && <Smartphone size={20} />}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your postcode (e.g. SW1A 1AA)"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                  {error && <span style={{ color: 'red', fontSize: '0.85rem', marginTop: '6px', display: 'block' }}>{error}</span>}
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                  Compare deals
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Trust Score Section */}
      <section className="container">
        <div className="trust-section">
          <div className="trust-item">
            <span className="trust-text" style={{ fontWeight: 'bold' }}>Excellent</span>
            <div className="trust-stars">
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
            </div>
            <span className="trust-text">TrustScore 4.7 | 45,000+ reviews</span>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="products-section container">
        <div className="section-header">
          <h2>Compare and save today</h2>
          <p>Select a product to start comparing and find a cheaper deal.</p>
        </div>
        
        <div className="products-grid">
          <div className="product-card">
            <div className="product-icon">
              <Zap size={24} />
            </div>
            <h3>Gas & Electricity</h3>
            <p>Save money by switching energy providers or checking out new fixed rate plans.</p>
            <button onClick={() => { setActiveTab('energy'); window.scrollTo({top: 200, behavior: 'smooth'}); }} className="btn-link">
              Compare energy <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-card">
            <div className="product-icon">
              <Wifi size={24} />
            </div>
            <h3>Broadband & TV</h3>
            <p>Check fibre availability and compare TV package bundles on top UK providers.</p>
            <button onClick={() => { setActiveTab('broadband'); window.scrollTo({top: 200, behavior: 'smooth'}); }} className="btn-link">
              Compare broadband <ArrowRight size={16} />
            </button>
          </div>

          <div className="product-card">
            <div className="product-icon">
              <Smartphone size={24} />
            </div>
            <h3>Mobiles & SIMs</h3>
            <p>Discover the latest handset contracts and cheap unlimited data SIMs.</p>
            <button onClick={() => { setActiveTab('sim'); window.scrollTo({top: 200, behavior: 'smooth'}); }} className="btn-link">
              Compare SIMs <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Uswitch Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why compare with Uswitch?</h2>
            <p>We do the hard work for you to make switching quick, easy, and secure.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '48px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(28,184,92,0.1)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>100% Free & Independent</h3>
              <p style={{ maxWidth: '300px' }}>Our service is completely free to use. We are impartial and independent, ensuring you find the right deals.</p>
            </div>
            
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(28,184,92,0.1)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>Helped Millions of Customers</h3>
              <p style={{ maxWidth: '300px' }}>Over the last 20 years, we have helped millions of households save money on their monthly household bills.</p>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(28,184,92,0.1)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>Quick & Seamless Process</h3>
              <p style={{ maxWidth: '300px' }}>Enter your postcode, choose a deal, and we will take care of the entire transition process for you.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
