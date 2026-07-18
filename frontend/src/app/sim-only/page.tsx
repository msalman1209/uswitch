'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Info, ShieldCheck, ArrowRight, Star, Award } from 'lucide-react';

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
  const postcode = searchParams.get('postcode') || 'SW1A 1AA';
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [comparisonId, setComparisonId] = useState<number | null>(null);

  // Filters State
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [minData, setMinData] = useState<number>(0); // 0 = Any, 20 = 20GB+, 50 = 50GB+, -1 = Unlimited
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
        setDeals(data.results.deals);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching SIM deals:', error);
        alert('Failed to connect to the SIM comparison service.');
      } finally {
        setLoading(false);
      }
    }

    fetchSimDeals();
  }, []);

  const handleSwitchDeal = async (deal: any) => {
    const token = localStorage.getItem('uswitch_token');

    if (!token) {
      // Save details to session storage temporarily
      const tempSwitchInfo = {
        comparisonId,
        category: 'sim',
        supplierName: deal.providerName,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 12,
        savingAnnual: 60.00 // Simulated annual savings
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

  return (
    <div className="container" style={{ padding: '40px 0', flex: 1 }}>
      <div className="results-header-summary">
        <div>
          <h2>Compare SIM Only Deals</h2>
          <p style={{ marginTop: '4px' }}>
            Find cheap unlimited data contracts, monthly rolling plans, and top UK network coverage.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center animate-pulse" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
          <Smartphone size={48} className="tracker-icon" />
          <h3>Retrieving best SIM deals...</h3>
        </div>
      ) : (
        <div className="results-grid">
          
          {/* Filters Sidebar */}
          <aside className="sidebar-filters">
            <div className="filter-section">
              <span className="filter-title">Filter by Network</span>
              <select 
                className="form-control"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="All">All Networks</option>
                <option value="EE">EE Mobile</option>
                <option value="O2">O2 Mobile</option>
                <option value="Vodafone">Vodafone</option>
                <option value="Three">Three Mobile</option>
                <option value="Lyca">Lyca Mobile</option>
                <option value="Smarty">Smarty</option>
              </select>
            </div>

            <div className="filter-section">
              <span className="filter-title">Minimum Data</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="data" 
                    checked={minData === 0} 
                    onChange={() => setMinData(0)} 
                  />
                  <span>Any Data</span>
                </label>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="data" 
                    checked={minData === 50} 
                    onChange={() => setMinData(50)} 
                  />
                  <span>50GB or more</span>
                </label>
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="data" 
                    checked={minData === -1} 
                    onChange={() => setMinData(-1)} 
                  />
                  <span>Unlimited Data</span>
                </label>
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-title">Max Monthly Price</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>£5</span>
                <input 
                  type="range" 
                  min={5} 
                  max={30} 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--brand-accent)' }}
                />
                <span>£{maxPrice}</span>
              </div>
            </div>

            <div className="filter-section" style={{ border: 'none' }}>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Keep your existing phone number easily by texting 'PAC' to 65075 to switch networks seamlessly.</span>
              </div>
            </div>
          </aside>

          {/* Deals List */}
          <section className="results-list">
            {deals
              .filter(deal => {
                if (selectedProvider !== 'All' && !deal.providerName.toLowerCase().includes(selectedProvider.toLowerCase())) return false;
                if (minData === 50 && deal.dataGb !== -1 && deal.dataGb < 50) return false;
                if (minData === -1 && deal.dataGb !== -1) return false;
                if (deal.costMonthly > maxPrice) return false;
                return true;
              })
              .map((deal, idx) => (
                <div key={idx} className="deal-card">
                  {idx === 0 && (
                    <span className="deal-badge cheapest">Popular Choice</span>
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
                    <span className="deal-info-label">Monthly Data</span>
                    <span className="deal-info-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1.25rem' }}>
                      {deal.dataGb === -1 ? 'Unlimited' : `${deal.dataGb} GB`}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--brand-accent)', fontWeight: '600' }}>5G Enabled</span>
                  </div>

                  <div className="deal-info-col">
                    <span className="deal-info-label">Contract Term</span>
                    <span className="deal-info-value" style={{ display: 'block' }}>
                      {deal.contractLength === 1 ? 'Rolling Contract' : `${deal.contractLength} Months`}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No upfront costs
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
                      Get SIM <ArrowRight size={16} />
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
