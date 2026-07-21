'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Landmark, PiggyBank, ArrowRight, ShieldCheck, CheckCircle2, Percent, Calculator } from 'lucide-react';

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'loans' | 'mortgages'>('cards');
  const [loanAmount, setLoanAmount] = useState(5000);

  const bankingProducts = [
    {
      id: 'cards',
      title: 'Credit Cards',
      icon: <CreditCard size={28} />,
      desc: '0% balance transfer cards, 0% purchase offers & cashback rewards.',
      badge: 'Up to 30m 0% APR',
      color: '#ec4899'
    },
    {
      id: 'loans',
      title: 'Personal Loans',
      icon: <Landmark size={28} />,
      desc: 'Low interest unsecured loans from £1,000 to £25,000 with flexible terms.',
      badge: 'From 6.1% APR',
      color: '#3b82f6'
    },
    {
      id: 'mortgages',
      title: 'Mortgages & Remortgage',
      icon: <PiggyBank size={28} />,
      desc: 'Compare fixed-rate, tracker, and first-time buyer mortgage deals.',
      badge: 'Compare 100+ Lenders',
      color: '#00b050'
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-wrapper" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', padding: '60px 0 80px' }}>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} /> Check Eligibility Without Impacting Credit Score
              </div>
              <h1 className="hero-title">
                Smart Banking & Loans. <span>Lowest APR Rates.</span>
              </h1>
              <p className="hero-subtitle">
                Compare credit cards, low-interest personal loans, and remortgage rates from UK leading banks.
              </p>

              <div style={{ display: 'flex', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>✓ Soft Credit Check</span>
                <span>✓ 0% Interest Deals</span>
                <span>✓ FCA Regulated</span>
              </div>
            </div>

            {/* Loan Rate Calculator Card */}
            <div className="hero-calc-card">
              <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Personal Loan Calculator</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 700 }}>
                  <span>Borrow Amount:</span>
                  <span style={{ color: 'var(--brand-accent)', fontSize: '1.2rem' }}>£{loanAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min={1000}
                  max={25000}
                  step={500}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-accent)' }}
                />
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Monthly Repayment:</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>£{((loanAmount / 36) * 1.06).toFixed(2)}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Representative 6.1% APR</span>
                  <span>36 Months Term</span>
                </div>
              </div>

              <button className="btn-hero-action" onClick={() => alert('Redirecting to card & loan eligibility check...')}>
                Check Card & Loan Rates <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Financial Products</span>
            <h2>Compare Cards, Loans & Mortgages</h2>
          </div>

          <div className="category-grid">
            {bankingProducts.map((p) => (
              <div key={p.id} className="category-card">
                <div>
                  <div className="category-icon-wrapper" style={{ color: p.color, background: `${p.color}15` }}>
                    {p.icon}
                  </div>
                  <h3 className="category-card-title">{p.title}</h3>
                  <p className="category-card-desc">{p.desc}</p>
                </div>
                <div className="category-card-link" style={{ color: p.color }}>
                  Compare Deals <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
