'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, CheckCircle2, Star, Shield, ArrowRight, 
  Sparkles, Wifi, BatteryCharging, Clock, ChevronDown, Check, Building
} from 'lucide-react';

interface CardDeal {
  id: string;
  name: string;
  provider: string;
  type: 'Countertop' | 'Portable' | 'Mobile' | 'Virtual';
  typeLabel: string;
  badge?: string;
  rate: string;
  monthlyFee: string;
  payoutTime: string;
  contract: string;
  connectivity: string;
  rating: number;
  reviews: string;
  features: string[];
  bestFor: string;
  popular?: boolean;
}

const CARD_DEALS: CardDeal[] = [
  {
    id: 'dojo-go',
    name: 'Dojo Go 4G + Wi-Fi',
    provider: 'Dojo',
    type: 'Portable',
    typeLabel: 'Portable & Mobile',
    badge: 'Fastest Payout in UK',
    popular: true,
    rate: 'From 0.40% + 3p',
    monthlyFee: '£20/mo',
    payoutTime: '10:00 AM Next Day (inc. Weekends)',
    contract: '1 Month Rolling (No Lock-in)',
    connectivity: 'Free 4G SIM + Dual-Band Wi-Fi',
    rating: 4.9,
    reviews: '18,500+ Reviews',
    features: [
      'Built-in thermal receipt printer',
      'All-day battery life (10+ hours)',
      'Accepts Apple Pay, Google Pay, Amex & Visa/Mastercard',
      'Up to £3,000 buyout of your existing provider contract'
    ],
    bestFor: 'Restaurants, Cafes, Pubs, Retail & Mobile Traders'
  },
  {
    id: 'barclaycard-smartpay',
    name: 'Barclaycard Smartpay Touch',
    provider: 'Barclaycard',
    type: 'Countertop',
    typeLabel: 'Countertop & POS',
    badge: 'Best For Busy Retail',
    rate: 'From 0.35% Interchange+',
    monthlyFee: '£29/mo',
    payoutTime: 'Next Working Day',
    contract: '12 Months Fixed Rate',
    connectivity: 'Ethernet + Wi-Fi',
    rating: 4.7,
    reviews: '12,200+ Reviews',
    features: [
      'Integrated touchscreen point-of-sale terminal',
      'Real-time product inventory & stock management',
      'Robust metal base with customer-facing display',
      'Dedicated UK merchant support helpline'
    ],
    bestFor: 'High-street stores, busy boutiques & supermarkets'
  },
  {
    id: 'worldpay-terminal',
    name: 'Worldpay Axium DX8000',
    provider: 'Worldpay',
    type: 'Countertop',
    typeLabel: 'Countertop & Portable',
    badge: 'Enterprise Grade',
    rate: 'From 0.29% + Interchange',
    monthlyFee: 'Custom tailored',
    payoutTime: 'Next Working Day',
    contract: 'Flexible options',
    connectivity: '4G Roaming + Wi-Fi + IP',
    rating: 4.6,
    reviews: '24,000+ Reviews',
    features: [
      'Accepts global currencies & international cards (UnionPay, JCB, Diners)',
      'PCI DSS compliance assistance included',
      'Multi-till integration for multi-lane checkout',
      '24/7 UK emergency terminal replacement service'
    ],
    bestFor: 'Established businesses, multi-branch & franchise stores'
  },
  {
    id: 'zettle-terminal',
    name: 'Zettle by PayPal Terminal',
    provider: 'PayPal Zettle',
    type: 'Mobile',
    typeLabel: 'Mobile Reader',
    badge: 'Zero Monthly Fee',
    rate: '1.75% Flat Rate',
    monthlyFee: '£0 / month',
    payoutTime: '1 - 2 Business Days',
    contract: 'Pay As You Go (No Contract)',
    connectivity: 'Integrated 4G SIM + Wi-Fi',
    rating: 4.8,
    reviews: '31,000+ Reviews',
    features: [
      'No monthly rental or maintenance fees',
      'Built-in touchscreen — no phone or tablet needed',
      'Barcode scanning via camera for swift checkout',
      'Free cloud analytics & sales reporting app'
    ],
    bestFor: 'Startups, market stalls, beauty salons & sole traders'
  },
  {
    id: 'tide-reader-plus',
    name: 'Tide Card Reader Plus',
    provider: 'Tide Business',
    type: 'Mobile',
    typeLabel: 'Mobile & Portable',
    badge: 'Best For New Businesses',
    rate: '1.50% Flat Rate',
    monthlyFee: '£0 / month',
    payoutTime: 'Next Business Day',
    contract: 'No Contract Lock-in',
    connectivity: 'Free 4G Connectivity Included',
    rating: 4.7,
    reviews: '9,800+ Reviews',
    features: [
      'Free Tide UK Business Bank Account included',
      'Integrated auto-invoicing and bookkeeping sync',
      'Optional dock with thermal printer attachment',
      'Tap to Pay on iPhone support supported'
    ],
    bestFor: 'Tradespeople, mobile mechanics, contractors & pop-ups'
  }
];

export default function CardMachinesPage() {
  const [filterType, setFilterType] = useState<string>('All');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedDealForQuote, setSelectedDealForQuote] = useState<CardDeal | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Quote Form State
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    monthlyTurnover: '£10k - £25k',
    businessType: 'Retail'
  });

  const filteredDeals = filterType === 'All' 
    ? CARD_DEALS 
    : CARD_DEALS.filter(d => d.type === filterType || d.typeLabel.includes(filterType));

  const handleOpenQuote = (deal?: CardDeal) => {
    setSelectedDealForQuote(deal || null);
    setQuoteSubmitted(false);
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Hero Header */}
      <section style={{ 
        background: 'linear-gradient(180deg, #06162c 0%, #0d223f 100%)', 
        color: '#ffffff', 
        padding: '56px 0 64px',
        position: 'relative'
      }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#a78bfa',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <CreditCard size={15} /> UK Merchant Services & POS Comparison
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
              Cut your card machine fees. <span style={{ color: '#00b050' }}>Boost your margins.</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '28px' }}>
              Compare top UK countertop, portable, and mobile card readers. Slash transaction rates from <strong style={{ color: '#ffffff' }}>0.29%</strong>, enjoy <strong style={{ color: '#ffffff' }}>10am next-day settlement</strong>, and eliminate hidden merchant fees.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Next-Day Settlement</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Contactless, Apple & Google Pay</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> No Hidden PCI / Exit Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Content */}
      <div className="container" style={{ maxWidth: '1100px', marginTop: '-24px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Filter by Type:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['All', 'Countertop', 'Portable', 'Mobile'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: filterType === t ? '#06162c' : '#f1f5f9',
                    color: filterType === t ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t === 'All' ? 'All Terminals' : t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenQuote()}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#00b050',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,176,80,0.3)'
            }}
          >
            <Sparkles size={16} /> Get Custom Merchant Quote
          </button>
        </div>

        {/* Deals Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: deal.popular ? '2px solid #00b050' : '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                position: 'relative'
              }}
            >
              {deal.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '24px',
                  background: deal.popular ? '#00b050' : '#06162c',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em'
                }}>
                  {deal.badge}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                alignItems: 'center'
              }}>
                {/* Column 1: Provider & Basic Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: deal.badge ? '6px' : '0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', background: '#f5f3ff', padding: '3px 8px', borderRadius: '6px' }}>
                      {deal.typeLabel}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      <Star size={13} fill="#eab308" color="#eab308" /> {deal.rating} ({deal.reviews})
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {deal.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                    <strong>Ideal for:</strong> {deal.bestFor}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="#00b050" /> {deal.payoutTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Wifi size={14} color="#0284c7" /> {deal.connectivity}
                    </span>
                  </div>
                </div>

                {/* Column 2: Features list */}
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Key Features & Inclusions:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {deal.features.map((feat, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#334155' }}>
                        <Check size={14} color="#00b050" style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Pricing & Action Button */}
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Transaction Fee
                    </span>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#00b050' }}>
                      {deal.rate}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Terminal Rental: <strong style={{ color: '#0f172a' }}>{deal.monthlyFee}</strong> • {deal.contract}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenQuote(deal)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#06162c',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Select Terminal <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Guidance Box */}
        <div style={{
          marginTop: '48px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Why Compare Card Machines with NexGen Power Solutions?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#00b050', marginBottom: '6px' }}>
                ✓ Wholesale Interchange-Plus Rates
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Instead of paying 1.75% to 2.5% flat fees, high-volume UK businesses can drop transaction costs down to 0.29% + interchange, saving hundreds every month.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#00b050', marginBottom: '6px' }}>
                ✓ Rapid 10am Next-Day Payout
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Get your funds deposited 7 days a week, including Saturdays and Sundays, keeping your business cashflow healthy and predictable.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#00b050', marginBottom: '6px' }}>
                ✓ Contract Buyout Support
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Locked in with another provider? Many of our merchant partners offer up to £3,000 toward covering early cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote / Apply Modal */}
      {quoteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setQuoteModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              ✕
            </button>

            {!quoteSubmitted ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedDealForQuote ? `Apply for ${selectedDealForQuote.name}` : 'Get Custom Card Machine Quote'}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                      Free comparison with zero obligation. Guaranteed lowest rate.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manchester Bistro Ltd"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Business Type
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option>Retail Shop</option>
                        <option>Restaurant / Cafe / Pub</option>
                        <option>Hair & Beauty Salon</option>
                        <option>Trades & Services</option>
                        <option>Taxi & Transport</option>
                        <option>Online & E-commerce</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Monthly Card Turnover
                      </label>
                      <select
                        value={formData.monthlyTurnover}
                        onChange={(e) => setFormData({ ...formData, monthlyTurnover: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option>Under £5,000 / mo</option>
                        <option>£5,000 - £15,000 / mo</option>
                        <option>£15,000 - £40,000 / mo</option>
                        <option>£40,000 - £100,000 / mo</option>
                        <option>£100,000+ / mo</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Smith"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="07123 456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="manager@mybusiness.co.uk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#00b050',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,176,80,0.3)',
                      marginTop: '6px'
                    }}
                  >
                    Submit & Reveal Custom Rates →
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Quote Request Received!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                  Thank you, <strong>{formData.contactName}</strong>. Our UK merchant specialist is preparing your bespoke rate comparison for <strong>{formData.businessName}</strong>. We will email your formal quote package to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  style={{
                    padding: '10px 24px',
                    background: '#06162c',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

