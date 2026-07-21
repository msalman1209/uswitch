'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Info, ShieldCheck, ArrowRight, Star, Award, Filter } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SimOnlyDealsPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <SimOnlyDeals />
    </React.Suspense>
  );
}

function SimOnlyDeals() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [comparisonId, setComparisonId] = useState<number | null>(null);

  // Filters State
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [minData, setMinData] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(30);

  useEffect(() => {
    async function fetchSimDeals() {
      try {
        const response = await fetch(`${API_BASE}/comparisons/sim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('uswitch_token') || ''}`
          },
          body: JSON.stringify({
            postcode: 'SW1A 1AA',
            currentProvider: 'EE',
            contractStatus: 'rolling'
          })
        });
        const data = await response.json();
        setDeals(data.results.deals || []);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching SIM deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSimDeals();
  }, []);

  const handleSwitchDeal = async (deal: any) => {
    const token = localStorage.getItem('uswitch_token');

    if (!token) {
      const tempSwitchInfo = {
        comparisonId,
        category: 'sim',
        supplierName: deal.providerName,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 12,
        savingAnnual: 60.00
      };
      sessionStorage.setItem('uswitch_temp_switch', JSON.stringify(tempSwitchInfo));
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
          comparisonId,
          category: 'sim',
          supplierName: deal.providerName,
          planName: deal.planName,
          costMonthly: deal.costMonthly,
          costAnnual: deal.costMonthly * 12,
          savingAnnual: 60.00
        })
      });

      if (response.ok) {
        alert(`Successfully saved SIM switch to ${deal.providerName}! Redirecting to dashboard.`);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Switch failed: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving SIM switch.');
    }
  };

  const filteredDeals = deals.filter(deal => {
    if (selectedProvider !== 'All' && !deal.providerName.toLowerCase().includes(selectedProvider.toLowerCase())) return false;
    if (minData === 50 && deal.dataGb !== -1 && deal.dataGb < 50) return false;
    if (minData === -1 && deal.dataGb !== -1) return false;
    if (deal.costMonthly > maxPrice) return false;
    return true;
  });

  return (
    <div style={{ background: '#f8fafc', padding: '40px 0', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', margin: '0 0 32px' }}>
          <span className="section-tag">SIM Only Deals</span>
          <h2 style={{ fontSize: '2rem' }}>Compare 5G SIM Only Contracts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Keep your existing phone and switch to cheap 30-day rolling or 12-month SIM contracts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
          {/* Filters */}
          <aside style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', height: 'fit-content' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="var(--brand-accent)" /> Filter SIMs
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Network Provider
              </label>
              <select 
                className="form-control"
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="All">All Networks</option>
                <option value="EE">EE Mobile</option>
                <option value="O2">O2 Mobile</option>
                <option value="Vodafone">Vodafone</option>
                <option value="Three">Three Mobile</option>
                <option value="voxi">VOXI</option>
                <option value="Smarty">SMARTY</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Data Allowance
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <label style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="simData" checked={minData === 0} onChange={() => setMinData(0)} /> Any Data
                </label>
                <label style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="simData" checked={minData === 50} onChange={() => setMinData(50)} /> 50GB or more
                </label>
                <label style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="simData" checked={minData === -1} onChange={() => setMinData(-1)} /> Unlimited Data
                </label>
              </div>
            </div>
          </aside>

          {/* Deals */}
          <div>
            {loading ? (
              <div className="flex-center animate-pulse" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
                <Smartphone size={48} color="var(--brand-accent)" />
                <h3>Finding best SIM plans...</h3>
              </div>
            ) : (
              filteredDeals.map((deal, idx) => (
                <div key={idx} className="deal-card">
                  <div className="deal-provider-info">
                    <div className="provider-logo-badge">{deal.providerName}</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{deal.planName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--brand-accent)', fontWeight: 700, marginTop: '4px' }}>⚡ 5G Included</span>
                  </div>

                  <div className="deal-specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Monthly Data</span>
                      <span className="spec-value" style={{ color: 'var(--brand-accent)' }}>
                        {deal.dataGb === -1 ? 'Unlimited' : `${deal.dataGb} GB`}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Contract Term</span>
                      <span className="spec-value">{deal.contractLength === 1 ? '30-Day Rolling' : `${deal.contractLength} Months`}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Upfront Fee</span>
                      <span className="spec-value">FREE</span>
                    </div>
                  </div>

                  <div className="deal-price-col">
                    <div className="deal-price">
                      £{deal.costMonthly} <span>/mo</span>
                    </div>
                    <button onClick={() => handleSwitchDeal(deal)} className="btn-get-deal">
                      Get SIM <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
