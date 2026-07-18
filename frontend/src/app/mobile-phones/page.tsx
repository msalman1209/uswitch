'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Info, ShieldCheck, ArrowRight, Check, Tag } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const HANDSETS = [
  { name: 'iPhone 15 Pro', brand: 'Apple', image: '📱' },
  { name: 'Samsung Galaxy S24', brand: 'Samsung', image: '📱' },
  { name: 'Google Pixel 8', brand: 'Google', image: '📱' }
];

export default function MobilePhonesPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <MobilePhones />
    </React.Suspense>
  );
}

function MobilePhones() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postcode = searchParams.get('postcode') || 'SW1A 1AA';
  const [selectedHandset, setSelectedHandset] = useState(HANDSETS[0].name);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [comparisonId, setComparisonId] = useState<number | null>(null);

  // Filters
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');

  useEffect(() => {
    async function fetchMobileDeals() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/comparisons/mobile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('uswitch_token') || ''}`
          },
          body: JSON.stringify({
            postcode: 'SW1A 1AA',
            handsetName: selectedHandset,
            networkProvider: selectedNetwork === 'All' ? undefined : selectedNetwork
          })
        });
        const data = await response.json();
        setDeals(data.results.deals);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching mobile deals:', error);
        alert('Failed to connect to the mobile comparison service.');
      } finally {
        setLoading(false);
      }
    }

    fetchMobileDeals();
  }, [selectedHandset, selectedNetwork]);

  const handleSwitchDeal = async (deal: any) => {
    const token = localStorage.getItem('uswitch_token');

    if (!token) {
      // Save details to session storage temporarily
      const tempSwitchInfo = {
        comparisonId,
        category: 'mobile',
        supplierName: `${deal.providerName} (${deal.handsetName})`,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 24 + deal.upfrontCost,
        savingAnnual: 100.00 // Simulated savings
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
          category: 'mobile',
          supplierName: `${deal.providerName} (${deal.handsetName})`,
          planName: deal.planName,
          costMonthly: deal.costMonthly,
          costAnnual: deal.costMonthly * 24 + deal.upfrontCost,
          savingAnnual: 100.00
        })
      });

      if (response.ok) {
        alert(`Successfully initiated mobile switch to ${deal.providerName}! Redirecting to dashboard.`);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Switch failed: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving mobile switch.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0', flex: 1 }}>
      <div className="results-header-summary">
        <div>
          <h2>Compare Mobile Phone Deals</h2>
          <p style={{ marginTop: '4px' }}>
            Find the cheapest monthly plans, zero upfront cost deals, and top UK contract networks.
          </p>
        </div>
      </div>

      {/* Handset Selector Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {HANDSETS.map((handset, idx) => (
          <button
            key={idx}
            className={`card ${selectedHandset === handset.name ? 'selected' : ''}`}
            onClick={() => setSelectedHandset(handset.name)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px 24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              border: selectedHandset === handset.name ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
              backgroundColor: selectedHandset === handset.name ? 'var(--brand-accent-light)' : 'var(--bg-card)'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{handset.image}</span>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{handset.brand}</span>
              <strong style={{ fontSize: '1rem', color: 'var(--brand-primary)' }}>{handset.name}</strong>
            </div>
          </button>
        ))}
      </div>

      <div className="results-grid">
        
        {/* Sidebar Filters */}
        <aside className="sidebar-filters">
          <div className="filter-section">
            <span className="filter-title">Filter by Network</span>
            <select 
              className="form-control"
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
            >
              <option value="All">All Networks</option>
              <option value="EE">EE Mobile</option>
              <option value="O2">O2 Mobile</option>
              <option value="Vodafone">Vodafone</option>
              <option value="Three">Three Mobile</option>
            </select>
          </div>

          <div className="filter-section" style={{ border: 'none' }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Contracts are subject to status and credit checks by the chosen network provider.</span>
            </div>
          </div>
        </aside>

        {/* Deals List */}
        <section className="results-list">
          {loading ? (
            <div className="flex-center animate-pulse" style={{ height: '200px', flexDirection: 'column', gap: '16px' }}>
              <Smartphone size={48} className="tracker-icon" />
              <h3>Retrieving network contract deals...</h3>
            </div>
          ) : deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <Smartphone size={48} style={{ strokeWidth: '1.5px', marginBottom: '12px' }} />
              <p>No contract deals found matching your filters.</p>
            </div>
          ) : (
            deals.map((deal, idx) => (
              <div key={idx} className="deal-card">
                {idx === 0 && (
                  <span className="deal-badge cheapest">Recommended Deal</span>
                )}
                
                <div className="deal-logo-col">
                  <span className="deal-supplier">{deal.providerName}</span>
                  <span className="deal-plan-name">{deal.planName}</span>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {deal.features.map((feat: string, fidx: number) => (
                      <span key={fidx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#edf2f7', color: 'var(--text-muted)' }}>
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="deal-info-col">
                  <span className="deal-info-label">Upfront Cost</span>
                  <span className="deal-info-value" style={{ fontSize: '1.15rem' }}>
                    {deal.upfrontCost === 0 ? 'No upfront fee' : `£${deal.upfrontCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="deal-info-col">
                  <span className="deal-info-label">Monthly Data & Term</span>
                  <span className="deal-info-value" style={{ display: 'block' }}>
                    {deal.dataGb === -1 ? 'Unlimited Data' : `${deal.dataGb} GB 5G`}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {deal.contractLength} Months contract
                  </span>
                </div>

                <div className="deal-price-col">
                  <span className="deal-price-monthly">£{deal.costMonthly.toFixed(2)}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ month</span>
                  <button 
                    onClick={() => handleSwitchDeal(deal)}
                    className="btn-primary" 
                    style={{ padding: '10px 16px', fontSize: '0.9rem', marginTop: '12px', width: '100%' }}
                  >
                    View Deal <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
        
      </div>
    </div>
  );
}
