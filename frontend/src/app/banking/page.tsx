'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, Sparkles, ChevronRight,
  Lock, RefreshCw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const TOP_BANKS_LOANS = [
  {
    id: 'loan-1',
    bank: 'Santander',
    logo: '🔴',
    planName: 'Personal Loan',
    representativeApr: 6.1,
    minAmount: 1000,
    maxAmount: 25000,
    decisionTime: 'Instant online decision',
    features: ['No setup fees', 'Overpayments allowed without penalty', 'Funds in account in 2 hours'],
    badge: 'Lowest Rate Pick'
  },
  {
    id: 'loan-2',
    bank: 'Barclays',
    logo: '🔵',
    planName: 'Fixed Rate Personal Loan',
    representativeApr: 6.4,
    minAmount: 1000,
    maxAmount: 35000,
    decisionTime: '5 minute decision',
    features: ['Top-up loan option available', 'Manage in Barclays app', 'Price match guarantee'],
    badge: 'Popular Choice'
  },
  {
    id: 'loan-3',
    bank: 'NatWest',
    logo: '🟣',
    planName: 'Unsecured Personal Loan',
    representativeApr: 6.3,
    minAmount: 1000,
    maxAmount: 25000,
    decisionTime: 'Instant decision',
    features: ['Fixed monthly repayments', 'Soft search eligibility checker', 'Repay early fee-free'],
    badge: 'Fast Payout'
  },
  {
    id: 'loan-4',
    bank: 'HSBC UK',
    logo: '⚪',
    planName: 'Flexible Personal Loan',
    representativeApr: 6.9,
    minAmount: 1000,
    maxAmount: 30000,
    decisionTime: 'Same day funds',
    features: ['Available to non-HSBC customers', 'Fixed interest rates', '3-month repayment holiday optional'],
    badge: 'Flexible Terms'
  }
];

const TOP_CREDIT_CARDS = [
  {
    id: 'card-1',
    bank: 'NatWest',
    name: 'Longest 0% Balance Transfer Card',
    cardType: 'balance-transfer',
    introPeriod: '30 Months 0% Interest',
    transferFee: '2.99% fee',
    standardApr: '24.9% representative variable',
    highlights: ['0% interest on balance transfers for 30 months', 'No annual fee', 'Soft credit check before apply'],
    badge: 'Market Leading 0%'
  },
  {
    id: 'card-2',
    bank: 'Barclaycard',
    name: 'Platinum 0% Purchase & Transfer',
    cardType: 'all-round',
    introPeriod: '21 Months 0% on Purchases & Transfers',
    transferFee: '2.5% fee',
    standardApr: '24.9% representative variable',
    highlights: ['0% on new spending for 21 months', '0% on balance transfers for 21 months', 'Contactless with Apple/Google Pay'],
    badge: 'Best All-Rounder'
  },
  {
    id: 'card-3',
    bank: 'American Express',
    name: 'Preferred Rewards Cashback Credit Card',
    cardType: 'cashback',
    introPeriod: '5% Cashback on First £2,500',
    transferFee: 'N/A',
    standardApr: '30.9% representative variable',
    highlights: ['5% cashback for first 3 months (up to £125)', '1% ongoing cashback afterwards', 'Comprehensive travel inconvenience protection'],
    badge: 'Top Cashback'
  }
];

export default function BankingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'loans' | 'cards' | 'mortgages'>('loans');

  // Loan Calculator State
  const [borrowAmount, setBorrowAmount] = useState<number>(7500);
  const [loanTermYears, setLoanTermYears] = useState<number>(3);
  const [cardFilter, setCardFilter] = useState<'all' | 'balance-transfer' | 'cashback'>('all');

  // Modal / Check Eligibility State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);

  // Repayment calculation formula: Monthly = (P + (P * r * t)) / (t * 12)
  const calcMonthly = (amount: number, years: number, apr: number) => {
    const totalInterest = amount * (apr / 100) * years;
    const totalPayable = amount + totalInterest;
    return totalPayable / (years * 12);
  };

  const handleCheckEligibility = async (product: any) => {
    setSelectedProduct(product);
    setEligibilityChecking(true);
    setEligibilityResult(null);

    // Simulate smart soft check against NexGen risk model
    setTimeout(async () => {
      const chance = Math.floor(Math.random() * 15) + 85; // 85% to 99% high chance
      const result = {
        productName: product.planName || product.name,
        bank: product.bank,
        approvalChance: `${chance}%`,
        guaranteedRate: product.representativeApr ? `${product.representativeApr}% APR` : product.introPeriod,
        softCheckPassed: true
      };
      setEligibilityResult(result);
      setEligibilityChecking(false);

      // Save to backend comparisons if logged in
      const token = localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token');
      if (token) {
        try {
          await fetch(`${API_BASE}/comparisons/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              category: 'banking',
              supplierName: product.bank,
              planName: product.planName || product.name,
              costMonthly: product.representativeApr ? calcMonthly(borrowAmount, loanTermYears, product.representativeApr) : 0,
              costAnnual: borrowAmount,
              savingAnnual: 180.00
            })
          });
        } catch (e) {
          console.warn('Could not save comparison silently:', e);
        }
      }
    }, 1800);
  };

  const filteredCards = TOP_CREDIT_CARDS.filter(c => {
    if (cardFilter === 'all') return true;
    if (cardFilter === 'balance-transfer') return c.cardType === 'balance-transfer' || c.cardType === 'all-round';
    if (cardFilter === 'cashback') return c.cardType === 'cashback';
    return true;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="hero-wrapper" style={{ background: 'linear-gradient(180deg, #071e3d 0%, #0a192f 100%)', padding: '60px 0 70px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> FCA Regulated & 100% Free Eligibility Check
              </div>
              <h1 className="hero-title">
                Compare UK Loans & Cards. <span>Pre-Approved Deals.</span>
              </h1>
              <p className="hero-subtitle">
                Compare low rate personal loans, 0% balance transfer cards, and tracker mortgages from top UK banks with zero impact on your credit score.
              </p>

              <div style={{ display: 'flex', gap: '24px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Soft credit search only</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> Rates from 6.1% APR</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={16} color="#00b050" /> 0% Balance Transfer for 30m</span>
              </div>
            </div>

            {/* Interactive Calculator Box */}
            <div className="hero-calc-card">
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('loans')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700,
                    background: activeTab === 'loans' ? '#00b050' : 'transparent',
                    color: activeTab === 'loans' ? '#ffffff' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  Personal Loans
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700,
                    background: activeTab === 'cards' ? '#00b050' : 'transparent',
                    color: activeTab === 'cards' ? '#ffffff' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  Credit Cards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mortgages')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700,
                    background: activeTab === 'mortgages' ? '#00b050' : 'transparent',
                    color: activeTab === 'mortgages' ? '#ffffff' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  Mortgages
                </button>
              </div>

              {activeTab === 'loans' && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>I want to borrow:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a192f' }}>£{borrowAmount.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min={1000}
                      max={25000}
                      step={500}
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#00b050', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>£1,000</span>
                      <span>£12,500</span>
                      <span>£25,000</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Repayment period:</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0a192f' }}>{loanTermYears} Years ({loanTermYears * 12} months)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setLoanTermYears(y)}
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: '8px',
                            border: loanTermYears === y ? '2px solid #00b050' : '1px solid #e2e8f0',
                            background: loanTermYears === y ? '#e6f7ec' : '#ffffff',
                            fontWeight: 700, fontSize: '0.85rem', color: loanTermYears === y ? '#00b050' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {y}y
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Estimated Monthly:</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00b050' }}>
                        £{calcMonthly(borrowAmount, loanTermYears, 6.1).toFixed(2)}<span style={{ fontSize: '0.85rem', fontWeight: 600 }}>/mo</span>
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      Based on representative 6.1% APR. Total payable: £{(calcMonthly(borrowAmount, loanTermYears, 6.1) * loanTermYears * 12).toFixed(2)}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="btn-hero-action" 
                    onClick={() => {
                      const el = document.getElementById('loans-table');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View Matching Loans <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {activeTab === 'cards' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a192f', marginBottom: '12px' }}>
                    Credit Card Smart Match
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                    Whether you want to clear debt with 0% balance transfer or earn cashback on everyday shopping:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={18} color="#00b050" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Up to 30 months 0% on debt balance transfer</span>
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={18} color="#00b050" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Up to 21 months 0% on brand new purchases</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-hero-action"
                    onClick={() => {
                      const el = document.getElementById('cards-table');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Compare 0% Credit Cards <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {activeTab === 'mortgages' && (
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a192f', marginBottom: '8px' }}>
                    UK Mortgage Rate Comparison
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                    Compare fixed and tracker deals across 100+ UK lenders. First-time buyer, remortgage, or moving home.
                  </p>
                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008a00' }}>Average 2-year fixed: 4.18%</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#008a00', marginTop: '4px' }}>Average 5-year fixed: 3.99%</div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-hero-action"
                    onClick={() => {
                      const el = document.getElementById('mortgages-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Mortgage Rates <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: PERSONAL LOANS COMPARISON TABLE */}
      <section id="loans-table" className="container" style={{ marginTop: '50px' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-tag">Lowest Rate Deals</span>
              <h2 style={{ fontSize: '1.75rem', margin: '4px 0' }}>Personal Loans for £{borrowAmount.toLocaleString()} over {loanTermYears} Years</h2>
              <p style={{ color: '#64748b', margin: 0 }}>All quotes are soft-search enabled and won't affect your credit rating.</p>
            </div>
            <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '999px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#00b050" /> Showing representative rates
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {TOP_BANKS_LOANS.map((loan) => {
            const monthly = calcMonthly(borrowAmount, loanTermYears, loan.representativeApr);
            const totalRepayable = monthly * loanTermYears * 12;

            return (
              <div 
                key={loan.id}
                style={{
                  background: '#ffffff', borderRadius: '16px', padding: '24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0',
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px', alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{loan.logo}</span>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0a192f' }}>{loan.bank}</h3>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{loan.planName}</span>
                    </div>
                  </div>
                  <span style={{ display: 'inline-block', background: '#e6f7ec', color: '#008a00', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                    {loan.badge}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Representative APR</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0a192f', marginTop: '2px' }}>
                    {loan.representativeApr}% <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Fixed</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00b050', fontWeight: 600 }}>{loan.decisionTime}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Monthly Payment</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00b050', marginTop: '2px' }}>
                    £{monthly.toFixed(2)}<span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total repayable: £{totalRepayable.toFixed(2)}</div>
                </div>

                <div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', fontSize: '0.8rem', color: '#475569' }}>
                    {loan.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <CheckCircle2 size={13} color="#00b050" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckEligibility(loan)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'center' }}
                  >
                    Check Eligibility <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: CREDIT CARDS COMPARISON */}
      <section id="cards-table" className="container" style={{ marginTop: '70px' }}>
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="section-tag">Credit Cards</span>
              <h2 style={{ fontSize: '1.75rem', margin: '4px 0' }}>Best 0% Balance Transfer & Rewards Cards</h2>
              <p style={{ color: '#64748b', margin: 0 }}>Stop paying credit card interest and cut existing debt with 0% interest windows.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCardFilter('all')}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                  background: cardFilter === 'all' ? '#0a192f' : '#ffffff',
                  color: cardFilter === 'all' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                All Cards
              </button>
              <button
                type="button"
                onClick={() => setCardFilter('balance-transfer')}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                  background: cardFilter === 'balance-transfer' ? '#0a192f' : '#ffffff',
                  color: cardFilter === 'balance-transfer' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                0% Balance Transfer
              </button>
              <button
                type="button"
                onClick={() => setCardFilter('cashback')}
                style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
                  background: cardFilter === 'cashback' ? '#0a192f' : '#ffffff',
                  color: cardFilter === 'cashback' ? '#ffffff' : '#64748b',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                Cashback & Perks
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCards.map((card) => (
            <div 
              key={card.id}
              style={{
                background: '#ffffff', borderRadius: '16px', padding: '24px',
                border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{card.bank}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0', color: '#0a192f' }}>{card.name}</h3>
                  </div>
                  <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px' }}>
                    {card.badge}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#00b050' }}>{card.introPeriod}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Transfer Fee: <strong>{card.transferFee}</strong> • Standard Rate: {card.standardApr}
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '0.85rem', color: '#475569' }}>
                  {card.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <CheckCircle2 size={15} color="#00b050" /> {h}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCheckEligibility(card)}
                className="btn-outline"
                style={{ width: '100%', padding: '10px', justifyContent: 'center', fontWeight: 700 }}
              >
                Check Card Eligibility <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: MORTGAGES GUIDANCE */}
      <section id="mortgages-section" className="container" style={{ marginTop: '70px' }}>
        <div style={{ background: 'linear-gradient(135deg, #071e3d 0%, #1e293b 100%)', borderRadius: '20px', padding: '40px', color: '#ffffff' }}>
          <div style={{ maxWidth: '640px' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              Free Broker Consultation
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '12px 0', color: '#ffffff' }}>
              Finding the right UK Mortgage Deal
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Whether you are buying your first home, moving up the ladder, or your current fixed term is ending — comparing 100+ lenders saves UK homeowners an average of £2,100 per year.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleCheckEligibility({ bank: 'NexGen Mortgage Hub', planName: 'Mortgage Agreement in Principle' })}
                className="btn-primary" 
                style={{ padding: '12px 24px' }}
              >
                Get Agreement in Principle <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="btn-outline" 
                style={{ color: '#ffffff', borderColor: '#ffffff', padding: '12px 24px' }}
              >
                Track Mortgage on Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY RESULT MODAL */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            {eligibilityChecking ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <RefreshCw size={44} className="animate-spin" style={{ color: '#00b050', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a192f' }}>Running Soft Credit Check...</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                  Matching with <strong>{selectedProduct.bank}</strong> criteria. This does not affect your credit score.
                </p>
              </div>
            ) : eligibilityResult ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f7ec', color: '#00b050', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <CheckCircle2 size={36} strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a192f', margin: 0 }}>
                    Pre-Approved Status!
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    for {eligibilityResult.bank} ({eligibilityResult.productName})
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Approval Chance:</span>
                    <span style={{ fontWeight: 800, color: '#00b050', fontSize: '1.1rem' }}>{eligibilityResult.approvalChance}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Guaranteed Rate:</span>
                    <span style={{ fontWeight: 800, color: '#0a192f' }}>{eligibilityResult.guaranteedRate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Search Footprint:</span>
                    <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.85rem' }}>Soft Search (Safe)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      alert(`Proceeding to ${eligibilityResult.bank} official application gateway.`);
                      setSelectedProduct(null);
                      router.push('/dashboard');
                    }}
                    className="btn-primary" 
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Continue to Lender <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="btn-outline" 
                    style={{ padding: '12px 18px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
