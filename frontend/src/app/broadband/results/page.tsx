'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wifi, ArrowRight, Filter } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function BroadbandResultsPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '400px' }}>Loading deals...</div>}>
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
            'Authorization': `Bearer ${(localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token')) || ''}`
          },
          body: JSON.stringify({
            postcode,
            currentProvider: 'BT',
            contractStatus: 'out-of-contract'
          })
        });
        const data = await response.json();
        setDeals(data.results.deals || []);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching broadband deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBroadbandDeals();
  }, [postcode]);

  const handleSwitchDeal = async (deal: any) => {
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));

    if (!token) {
      const tempSwitchInfo = {
        comparisonId,
        category: 'broadband',
        supplierName: deal.providerName,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 12 + (deal.setupCost || 0),
        savingAnnual: 140.00
      };
      sessionStorage.setItem('nexgen_temp_switch', JSON.stringify(tempSwitchInfo));
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
          savingAnnual: 140.00
        })
      });

      if (response.ok) {
        alert(`Successfully initiated switch to ${deal.providerName}! Redirecting to your dashboard.`);
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

  const filteredDeals = deals.filter(deal => {
    if (minSpeed > 0 && deal.speedMbps < minSpeed) return false;
    if (filterTvOnly && deal.type !== 'tv-bundle') return false;
    if (deal.contractLength > maxContractLength) return false;
    return true;
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 76px)', padding: '40px 0' }}>
      <div className="container">
        {/* Results Banner */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              Broadband packages for <span style={{ color: 'var(--brand-accent)' }}>{postcode}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              We found {filteredDeals.length} available broadband & TV options in your neighborhood.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => router.push('/broadband')} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-accent)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
              Change Postcode
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-center animate-pulse" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
            <Wifi size={48} color="var(--brand-accent)" />
            <h3>Checking speed coverage for {postcode}...</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
            {/* Sidebar Filters */}
            <aside style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Filter size={18} color="var(--brand-accent)" /> Filter Broadband
              </div>

              {/* Speed Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                  Minimum Speed
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Any Speed', val: 0 },
                    { label: 'Fibre (30+ Mbps)', val: 30 },
                    { label: 'Superfast (65+ Mbps)', val: 65 },
                    { label: 'Ultrafast (200+ Mbps)', val: 200 }
                  ].map((s) => (
                    <label key={s.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                      <input type="radio" name="speed" checked={minSpeed === s.val} onChange={() => setMinSpeed(s.val)} />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Package Type Filter */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                  Package Features
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={filterTvOnly} onChange={(e) => setFilterTvOnly(e.target.checked)} />
                  <span>TV & Movie Bundles</span>
                </label>
              </div>

              {/* Contract Length */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Max Contract Term
                </label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontWeight: 600 }}
                  value={maxContractLength}
                  onChange={(e) => setMaxContractLength(parseInt(e.target.value))}
                >
                  <option value={24}>Up to 24 months</option>
                  <option value={18}>18 months or less</option>
                  <option value={12}>12 months or less</option>
                </select>
              </div>
            </aside>

            {/* Deals Column */}
            <div>
              {filteredDeals.length === 0 ? (
                <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h3>No deals match your filter criteria</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Try adjusting your speed or contract length filter options.</p>
                  <button onClick={() => { setMinSpeed(0); setFilterTvOnly(false); setMaxContractLength(24); }} className="btn-get-deal" style={{ marginTop: '16px' }}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredDeals.map((deal, idx) => (
                  <div key={idx} className="deal-card">
                    {/* Provider Logo & Features */}
                    <div className="deal-provider-info">
                      <div className="provider-logo-badge">{deal.providerName}</div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{deal.planName}</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {deal.features?.map((feat: string, fidx: number) => (
                          <span key={fidx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="deal-specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">Avg Speed</span>
                        <span className="spec-value" style={{ color: 'var(--brand-accent)' }}>{deal.speedMbps} Mbps</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Contract</span>
                        <span className="spec-value">{deal.contractLength} Months</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Setup Fee</span>
                        <span className="spec-value">{deal.setupCost === 0 ? 'FREE' : `£${deal.setupCost}`}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="deal-price-col">
                      <div className="deal-price">
                        £{deal.costMonthly} <span>/mo</span>
                      </div>
                      <button onClick={() => handleSwitchDeal(deal)} className="btn-get-deal">
                        Switch To Deal <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
