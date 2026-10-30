'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const HANDSETS = [
  { name: 'iPhone 16 Pro', brand: 'Apple', icon: '📱' },
  { name: 'Samsung Galaxy S24', brand: 'Samsung', icon: '📱' },
  { name: 'Google Pixel 9', brand: 'Google', icon: '📱' }
];

export default function MobilePhonesPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading deals...</div>}>
      <MobilePhones />
    </React.Suspense>
  );
}

function MobilePhones() {
  const router = useRouter();
  const [selectedHandset, setSelectedHandset] = useState(HANDSETS[0].name);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [comparisonId, setComparisonId] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');

  useEffect(() => {
    async function fetchMobileDeals() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/comparisons/mobile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token')) || ''}`
          },
          body: JSON.stringify({
            postcode: 'SW1A 1AA',
            handsetName: selectedHandset,
            networkProvider: selectedNetwork === 'All' ? undefined : selectedNetwork
          })
        });
        const data = await response.json();
        setDeals(data.results.deals || []);
        setComparisonId(data.comparisonId);
      } catch (error) {
        console.error('Error fetching mobile deals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMobileDeals();
  }, [selectedHandset, selectedNetwork]);

  const handleSwitchDeal = async (deal: any) => {
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));

    if (!token) {
      const tempSwitchInfo = {
        comparisonId,
        category: 'mobile',
        supplierName: `${deal.providerName} (${deal.handsetName})`,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costMonthly * 24 + deal.upfrontCost,
        savingAnnual: 100.00
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
          category: 'mobile',
          supplierName: `${deal.providerName} (${deal.handsetName})`,
          planName: deal.planName,
          costMonthly: deal.costMonthly,
          costAnnual: deal.costMonthly * 24 + deal.upfrontCost,
          savingAnnual: 100.00
        })
      });

      if (response.ok) {
        alert(`Successfully initiated mobile switch to ${deal.providerName}!`);
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
    <div style={{ background: '#f8fafc', padding: '40px 0', minHeight: 'calc(100vh - 76px)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', margin: '0 0 32px' }}>
          <span className="section-tag">Mobile Phone Deals</span>
          <h2 style={{ fontSize: '2rem' }}>Compare Latest Phone Contracts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Zero upfront fee options, trade-in savings, and 5G contracts from top UK networks.
          </p>
        </div>

        {/* Handset Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {HANDSETS.map((handset, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedHandset(handset.name)}
              style={{
                background: selectedHandset === handset.name ? 'var(--brand-accent-light)' : '#ffffff',
                border: selectedHandset === handset.name ? '2px solid var(--brand-accent)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                boxShadow: selectedHandset === handset.name ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{handset.icon}</span>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{handset.brand}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{handset.name}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
          {/* Sidebar */}
          <aside style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', height: 'fit-content' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Filter Network
            </div>
            <select 
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontWeight: 600 }}
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
            >
              <option value="All">All Networks</option>
              <option value="EE">EE Mobile</option>
              <option value="O2">O2 Mobile</option>
              <option value="Vodafone">Vodafone</option>
              <option value="Three">Three Mobile</option>
            </select>
          </aside>

          {/* Deals List */}
          <div>
            {loading ? (
              <div className="flex-center animate-pulse" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
                <Smartphone size={48} color="var(--brand-accent)" />
                <h3>Loading deals for {selectedHandset}...</h3>
              </div>
            ) : (
              deals.map((deal, idx) => (
                <div key={idx} className="deal-card">
                  <div className="deal-provider-info">
                    <div className="provider-logo-badge">{deal.providerName}</div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{deal.handsetName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{deal.planName}</span>
                  </div>

                  <div className="deal-specs-grid">
                    <div className="spec-item">
                      <span className="spec-label">Upfront Fee</span>
                      <span className="spec-value">{deal.upfrontCost === 0 ? 'FREE' : `£${deal.upfrontCost}`}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Data</span>
                      <span className="spec-value" style={{ color: 'var(--brand-accent)' }}>
                        {deal.dataGb === -1 ? 'Unlimited 5G' : `${deal.dataGb} GB 5G`}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Term</span>
                      <span className="spec-value">{deal.contractLength} Months</span>
                    </div>
                  </div>

                  <div className="deal-price-col">
                    <div className="deal-price">
                      £{deal.costMonthly} <span>/mo</span>
                    </div>
                    <button onClick={() => handleSwitchDeal(deal)} className="btn-get-deal">
                      Get Deal <ArrowRight size={16} />
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
