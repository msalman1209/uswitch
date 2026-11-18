'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wifi, Zap, Smartphone, ShieldCheck, Landmark, Search, ArrowRight, 
  CheckCircle2, Star, Shield, ChevronRight, Building, Home
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'broadband' | 'energy' | 'mobile' | 'insurance' | 'banking'>('broadband');
  const [postcode, setPostcode] = useState('');
  const [customerType, setCustomerType] = useState<'residential' | 'business'>('residential');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handlePostcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    
    if (activeTab === 'broadband') {
      router.push(`/broadband/results?postcode=${encodeURIComponent(postcode)}`);
    } else if (activeTab === 'energy') {
      router.push(`/energy/journey?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}&fuel=both&type=${customerType}`);
    } else if (activeTab === 'mobile') {
      router.push(`/sim-only?postcode=${encodeURIComponent(postcode)}`);
    } else if (activeTab === 'insurance') {
      router.push(`/insurance?postcode=${encodeURIComponent(postcode)}`);
    } else {
      router.push(`/banking?postcode=${encodeURIComponent(postcode)}`);
    }
  };

  const categories = [
    {
      id: 'broadband',
      title: 'Broadband & TV',
      desc: 'Compare superfast fibre broadband & TV bundles from Sky, Virgin, BT and more.',
      icon: <Wifi size={28} />,
      badge: 'Save up to £480/yr',
      href: '/broadband',
      color: '#00b050'
    },
    {
      id: 'energy',
      title: 'Gas & Electricity',
      desc: 'Switch energy suppliers in under 5 minutes and lock in fixed rates.',
      icon: <Zap size={28} />,
      badge: 'Fixed & Green Tariffs',
      href: '/energy',
      color: '#eab308'
    },
    {
      id: 'insurance',
      title: 'Car & Home Insurance',
      desc: 'Compare quotes from over 100 top UK insurers in one quick search.',
      icon: <ShieldCheck size={28} />,
      badge: 'Save up to £319',
      href: '/insurance',
      color: '#8b5cf6'
    },
    {
      id: 'banking',
      title: 'Cards & Personal Loans',
      desc: 'Compare 0% balance transfer credit cards and low interest loans.',
      icon: <Landmark size={28} />,
      badge: 'Check Eligibility',
      href: '/banking',
      color: '#ec4899'
    }
  ];

  const topDeals = [
    {
      category: 'Broadband',
      provider: 'Virgin Media',
      title: 'M250 Fibre Broadband',
      speed: '264 Mbps',
      contract: '18 Months',
      price: '28.00',
      tag: 'Best Speed Deal'
    },
    {
      category: 'Broadband',
      provider: 'Sky',
      title: 'Ultrafast Fibre + Sky TV',
      speed: '145 Mbps',
      contract: '18 Months',
      price: '39.00',
      tag: 'Popular Bundle'
    }
  ];

  const faqs = [
    {
      q: 'Is NexGen Power SolutionsNexGen completely free to use?',
      a: 'Yes,  Power Solutions is 100% free for customers. We earn a commission from energy suppliers, broadband providers, and financial institutions when you successfully switch through our site.'
    }, 
    {
      q: 'Will my energy or broadband connection be interrupted when I switch?',
      a: 'No! Your physical supply remains continuous. There is no downtime or loss of power/internet connection during the switching process.'
    },
    {
      q: 'How long does a broadband switch take?',
      a: 'Most broadband switches take around 10 to 14 working days. Your new provider will handle transferring your line and contacting your old provider for you.'
    },
    {
      q: 'What is the NexTrack Energy Tracker?',
      a: 'NexTrack is NexGen Power Solutions’ free smart meter app integration. It securely syncs with your smart meter to show your real-time electricity and gas usage, spot spikes, and recommend personalized lower tariffs.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> Ofgem Accredited & UK's Trusted Utilities Comparison Service
              </div>
              <h1 className="hero-title">
                Switch household bills. <span>Save hundreds.</span>
              </h1>
              <p className="hero-subtitle">
                Join thousands of UK households who have saved money on Broadband, Energy, Mobile & Insurance with NexGen Power Solutions.
              </p>

              <div className="hero-trust-list">
                <span className="hero-trust-item"><CheckCircle2 size={18} color="#00b050" /> Fast & Free Switch</span>
                <span className="hero-trust-item"><CheckCircle2 size={18} color="#00b050" /> No hidden fees</span>
                <span className="hero-trust-item"><CheckCircle2 size={18} color="#00b050" /> Official Guarantee</span>
              </div>
            </div>

            {/* Right Interactive Calculator Card */}
            <div className="hero-calc-card">
              <div className="calc-tab-list">
                <button 
                  type="button"
                  className={`calc-tab-btn ${activeTab === 'broadband' ? 'active' : ''}`}
                  onClick={() => setActiveTab('broadband')}
                >
                  <Wifi size={15} /> Broadband
                </button>
                <button 
                  type="button"
                  className={`calc-tab-btn ${activeTab === 'energy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('energy')}
                >
                  <Zap size={15} /> Energy
                </button>
              </div>

              {/* Energy Customer Type (Home vs Business) */}
              {activeTab === 'energy' && (
                <div className="calc-subtab-list">
                  <button
                    type="button"
                    onClick={() => setCustomerType('residential')}
                    className={`calc-subtab-btn ${customerType === 'residential' ? 'active-residential' : ''}`}
                  >
                    <Home size={14} /> Home Energy
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('business')}
                    className={`calc-subtab-btn ${customerType === 'business' ? 'active-business' : ''}`}
                  >
                    <Building size={14} /> Business Energy
                  </button>
                </div>
              )}

              <form onSubmit={handlePostcodeSubmit} className="postcode-form">
                <label className="postcode-label">
                  Enter your UK Postcode to compare deals in your area
                </label>
                <div className="postcode-input-group">
                  <Search className="postcode-icon" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g. SW1A 1AA or M1 1AG"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="postcode-input"
                    required
                  />
                </div>

                <button type="submit" className="btn-hero-action">
                  Compare {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Deals <ArrowRight size={18} />
                </button>
              </form>

              <div className="calc-guarantee">
                <Shield size={14} color="#00b050" /> Takes under 2 minutes • 100% Free Service
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Services Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Compare Services</span>
            <h2>One platform for all your household bills</h2>
            <p className="section-subtitle">
              Select a service below to start comparing rates, checking availability, and locking in lower prices today.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.id} href={cat.href} className="category-card">
                <div>
                  <div className="category-card-top">
                    <div className="category-icon-wrapper" style={{ color: cat.color, background: `${cat.color}15` }}>
                      {cat.icon}
                    </div>
                    <span className="category-badge" style={{ color: cat.color, background: `${cat.color}15` }}>
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="category-card-title">{cat.title}</h3>
                  <p className="category-card-desc">{cat.desc}</p>
                </div>
                <div className="category-card-link">
                  Compare Deals <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals Teaser Section */}
      <section className="section-padding" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Popular Deals</span>
            <h2>Top Recommended Household Offers</h2>
            <p className="section-subtitle">Hand-picked broadband and mobile packages with maximum customer satisfaction.</p>
          </div>

          <div>
            {topDeals.map((deal, idx) => (
              <div key={idx} className="deal-card">
                <div className="deal-provider-info">
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
                    {deal.category} • {deal.tag}
                  </span>
                  <div className="provider-logo-badge">{deal.provider}</div>
                  <div className="deal-rating">
                    <Star size={14} fill="#eab308" color="#eab308" /> 4.8 / 5 Customer Rating
                  </div>
                </div>

                <div className="deal-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Package</span>
                    <span className="spec-value">{deal.title}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Speed / Data</span>
                    <span className="spec-value">{deal.speed}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Contract</span>
                    <span className="spec-value">{deal.contract}</span>
                  </div>
                </div>

                <div className="deal-price-col">
                  <div className="deal-price">
                    £{deal.price} <span>/mo</span>
                  </div>
                  <Link href="/broadband" className="btn-get-deal">
                    View Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Provider Logos */}
      <section className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '32px', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 600 }}>
            COMPARE LEADING UK PROVIDERS IN ONE PLACE
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '40px', opacity: 0.8 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#001080' }}>VIRGIN MEDIA</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0072c6' }}>SKY</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#5514b4' }}>BT FIBRE</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>OCTOPUS ENERGY</span>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="section-padding" style={{ background: '#ffffff', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header">
            <span className="section-tag">Help & FAQs</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden',
                  background: 'var(--bg-card)'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--brand-primary)',
                    textAlign: 'left'
                  }}
                >
                  {faq.q}
                  <ChevronRight 
                    size={20} 
                    style={{ 
                      transform: openFaq === index ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </button>
                {openFaq === index && (
                  <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
