'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wifi, Info, ShieldCheck, ArrowRight, Clock, Award } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function BroadbandResultsPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <BroadbandResults />
    </React.Suspense>
  );
}

function BroadbandResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postcode = searchParams.get('postcode') || 'SW1A 1AA';

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [comparisonId, setComparisonId] = useState<number | null>(null);

  // Filters State
  const [minSpeed, setMinSpeed] = useState<number>(0);
  const [filterTvOnly, setFilterTvOnly] = useState(false);
  const [maxContractLength, setMaxContractLength] = useState<number>(24);

  useEffect(() => {
    async function fetchBroadbandDeals() {
      try {
        const response = await fetch(`${API_BASE}/comparisons/broadband`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('uswitch_token') || ''}`
          },
          body: JSON.stringify({
            postcode,
            currentProvider: 'BT',
            contractStatus: 'out-of-contract'
          })
        });
        const data = await response.json();
        setDeals(data.results.deals);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching broadband deals:', error);
        alert('Failed to connect to the broadband comparison service.');
      } finally {
        setLoading(false);
      }
    }

    fetchBroadbandDeals();
  }, [postcode]);

  const handleSwitchDeal = async (deal: any) => {
    const token = localStorage.getItem('uswitch_token');

    if (!token) {
      // Save details to session storage temporarily
      const tempSwitchInfo = {
        comparisonId,
        category: 'broadband',
        supplierName: deal.providerName,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 12 + (deal.setupCost || 0),
        savingAnnual: 120.00 // Simulated annual saving vs standard variable contract
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
          category: 'broadband',
          supplierName: deal.providerName,
          planName: deal.planName,
          costMonthly: deal.costMonthly,
          costAnnual: deal.costMonthly * 12 + (deal.setupCost || 0),
          savingAnnual: 120.00
        })
      });

      if (response.ok) {
        alert(`Successfully initiated switch to ${deal.providerName}! Redirecting to dashboard.`);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        alert(`Switch failed: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while completing deal switch.');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0', flex: 1 }}>
      <div className="results-header-summary">
        <div>
          <h2>Broadband deals in your area</h2>
          <p style={{ marginTop: '4px' }}>
            Showing broadband packages available for postcode <strong>{postcode}</strong>.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center animate-pulse" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
          <Wifi size={48} className="tracker-icon" />
          <h3>Searching for deals in your neighborhood...</h3>
        </div>
      ) : (
        <div className="results-grid">
          
          {/* Filters Sidebar */}
          <aside className="sidebar-filters">
            <div className="filter-section">
              <span className="filter-title">Minimum Speed</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="speed" 
                    checked={minSpeed === 0} 
                    onChange={() => setMinSpeed(0)} 
                  />
                  <span>Any Speed</span>
                </label>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="speed" 
                    checked={minSpeed === 60} 
                    onChange={() => setMinSpeed(60)} 
                  />
                  <span>Superfast (60+ Mbps)</span>
                </label>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="speed" 
                    checked={minSpeed === 500} 
                    onChange={() => setMinSpeed(500)} 
                  />
                  <span>Ultrafast (500+ Mbps)</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-title">Package Type</span>
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filterTvOnly} 
                  onChange={(e) => setFilterTvOnly(e.target.checked)} 
                />
                <span>Include TV Bundles</span>
              </label>
            </div>

            <div className="filter-section">
              <span className="filter-title">Max Contract Length</span>
              <select 
                className="form-control"
                value={maxContractLength}
                onChange={(e) => setMaxContractLength(parseInt(e.target.value))}
              >
                <option value={24}>Any contract (Up to 24m)</option>
                <option value={18}>18 months or less</option>
                <option value={12}>12 months or less</option>
              </select>
            </div>

            <div className="filter-section" style={{ border: 'none' }}>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Switching broadband is simple. Most new providers coordinate the transfer, so you don't experience downtime.</span>
              </div>
            </div>
          </aside>

          {/* Deals List */}
          <section className="results-list">
            {deals
              .filter(deal => {
                if (minSpeed > 0 && deal.speedMbps < minSpeed) return false;
                if (filterTvOnly && deal.type !== 'tv-bundle') return false;
                if (deal.contractLength > maxContractLength) return false;
                return true;
              })
              .map((deal, idx) => (
                <div key={idx} className="deal-card">
                  {idx === 0 && (
                    <span className="deal-badge">Top Recommendation</span>
                  )}
                  
                  <div className="deal-logo-col">
                    <span className="deal-supplier">{deal.providerName}</span>
                    <span className="deal-plan-name">{deal.planName}</span>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {deal.features.slice(0, 2).map((feat: string, fidx: number) => (
                        <span key={fidx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: '#edf2f7', color: 'var(--text-muted)' }}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="deal-info-col">
                    <span className="deal-info-label">Speed</span>
                    <span className="deal-info-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Wifi size={14} className="tracker-icon" /> {deal.speedMbps} Mbps
                    </span>
                  </div>

                  <div className="deal-info-col">
                    <span className="deal-info-label">Setup & Term</span>
                    <span className="deal-info-value" style={{ display: 'block' }}>
                      {deal.setupCost === 0 ? 'Free setup' : `£${deal.setupCost} setup`}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {deal.contractLength} Month contract
                    </span>
                  </div>

                  <div className="deal-price-col">
                    <span className="deal-price-monthly">£{deal.costMonthly}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ month</span>
                    <button 
                      onClick={() => handleSwitchDeal(deal)}
                      className="btn-primary" 
                      style={{ padding: '10px 16px', fontSize: '0.9rem', marginTop: '12px', width: '100%' }}
                    >
                      Switch Now <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </section>
          
        </div>
      )}
    </div>
  );
}
