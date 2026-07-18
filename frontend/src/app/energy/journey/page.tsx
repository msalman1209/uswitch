'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Zap, Wifi, ChevronRight, ChevronLeft, Building, CreditCard, 
  Leaf, Info, Check, Filter, ShieldCheck, ArrowRight 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Simulated address suggestions for postcode
const MOCK_ADDRESSES = [
  'Flat 1, 10 Buckingham Gate, London',
  'Flat 2, 10 Buckingham Gate, London',
  'Flat 3, 10 Buckingham Gate, London',
  'Flat 4, 10 Buckingham Gate, London',
  'Buckingham Palace, London'
];

export default function EnergyJourneyPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <EnergyJourney />
    </React.Suspense>
  );
}

function EnergyJourney() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postcode = searchParams.get('postcode') || 'SW1A 1AA';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [fuelType, setFuelType] = useState<'both' | 'electricity' | 'gas'>('both');
  const [elecSupplier, setElecSupplier] = useState('Octopus Energy');
  const [gasSupplier, setGasSupplier] = useState('British Gas');
  const [paymentMethod, setPaymentMethod] = useState('monthly-direct-debit');
  const [usageType, setUsageType] = useState<'estimate' | 'exact'>('estimate');
  const [propertySize, setPropertySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [annualElecKwh, setAnnualElecKwh] = useState('2900');
  const [annualGasKwh, setAnnualGasKwh] = useState('11500');
  
  // Results Filters
  const [filterGreenOnly, setFilterGreenOnly] = useState(false);
  const [filterNoExitFees, setFilterNoExitFees] = useState(false);
  const [sortOption, setSortOption] = useState<'savings' | 'cost'>('savings');

  // Load postcode address initially
  useEffect(() => {
    setSelectedAddress(MOCK_ADDRESSES[0]);
  }, [postcode]);

  // Handle Comparison Execution
  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comparisons/energy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('uswitch_token') || ''}`
        },
        body: JSON.stringify({
          postcode,
          currentSupplier: fuelType === 'gas' ? gasSupplier : elecSupplier,
          paymentMethod,
          usageType,
          propertySize,
          annualElecKwh: usageType === 'exact' ? annualElecKwh : undefined,
          annualGasKwh: usageType === 'exact' ? annualGasKwh : undefined,
          fuelType
        })
      });
      const data = await response.json();
      setComparisonResults(data);
      setStep(6); // Go to results step
    } catch (error) {
      console.error('Error running comparison:', error);
      alert('Failed to connect to the backend comparison engine.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Switch Deal execution
  const handleSwitchDeal = async (deal: any) => {
    const token = localStorage.getItem('uswitch_token');
    
    if (!token) {
      // Save details to session storage temporarily so we can proceed after registration/login
      const tempSwitchInfo = {
        comparisonId: comparisonResults.comparisonId,
        category: 'energy',
        supplierName: deal.supplierName,
        planName: deal.planName,
        costMonthly: deal.costMonthly,
        costAnnual: deal.costAnnual,
        savingAnnual: deal.savingAnnual
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
          comparisonId: comparisonResults.comparisonId,
          category: 'energy',
          supplierName: deal.supplierName,
          planName: deal.planName,
          costMonthly: deal.costMonthly,
          costAnnual: deal.costAnnual,
          savingAnnual: deal.savingAnnual
        })
      });

      if (response.ok) {
        alert(`Successfully initiated switch to ${deal.supplierName}! Redirecting to dashboard.`);
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

  // Helper selectors
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Render Wizard Step Content
  return (
    <div className="container" style={{ flex: 1, padding: '40px 0' }}>
      {step < 6 && (
        <div className="wizard-layout" style={{ minHeight: 'auto' }}>
          <div className="wizard-card">
            
            {/* Wizard Progress Bar */}
            <div className="wizard-progress">
              <div 
                className="wizard-progress-bar" 
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>

            {/* STEP 1: Address choice */}
            {step === 1 && (
              <div>
                <div className="wizard-header">
                  <h2>Confirm your address</h2>
                  <p>We found the following addresses for postcode <strong>{postcode}</strong></p>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Address</label>
                  <select 
                    className="form-control"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  >
                    {MOCK_ADDRESSES.map((addr, idx) => (
                      <option key={idx} value={addr}>{addr}</option>
                    ))}
                  </select>
                </div>
                <div className="wizard-actions">
                  <button onClick={() => router.push('/energy')} className="btn-outline">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Fuel Choice */}
            {step === 2 && (
              <div>
                <div className="wizard-header">
                  <h2>Which fuel do you want to compare?</h2>
                  <p>Most households save the most by switching both gas and electricity.</p>
                </div>
                <div className="wizard-options-grid">
                  <div 
                    className={`wizard-option-box ${fuelType === 'both' ? 'selected' : ''}`}
                    onClick={() => setFuelType('both')}
                  >
                    <Zap size={32} />
                    <span className="wizard-option-title">Gas & Electricity</span>
                  </div>
                  <div 
                    className={`wizard-option-box ${fuelType === 'electricity' ? 'selected' : ''}`}
                    onClick={() => setFuelType('electricity')}
                  >
                    <Zap size={32} />
                    <span className="wizard-option-title">Electricity Only</span>
                  </div>
                  <div 
                    className={`wizard-option-box ${fuelType === 'gas' ? 'selected' : ''}`}
                    onClick={() => setFuelType('gas')}
                  >
                    <Zap size={32} />
                    <span className="wizard-option-title">Gas Only</span>
                  </div>
                </div>
                <div className="wizard-actions">
                  <button onClick={prevStep} className="btn-outline">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Current Supplier */}
            {step === 3 && (
              <div>
                <div className="wizard-header">
                  <h2>Who is your current supplier?</h2>
                  <p>Choose the supplier that currently bills you for your fuel.</p>
                </div>
                
                {fuelType !== 'gas' && (
                  <div className="form-group">
                    <label className="form-label">Electricity Supplier</label>
                    <select 
                      className="form-control"
                      value={elecSupplier}
                      onChange={(e) => setElecSupplier(e.target.value)}
                    >
                      <option>Octopus Energy</option>
                      <option>British Gas</option>
                      <option>E.ON Next</option>
                      <option>EDF Energy</option>
                      <option>Scottish Power</option>
                      <option>OVO Energy</option>
                    </select>
                  </div>
                )}

                {fuelType !== 'electricity' && (
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Gas Supplier</label>
                    <select 
                      className="form-control"
                      value={gasSupplier}
                      onChange={(e) => setGasSupplier(e.target.value)}
                    >
                      <option>British Gas</option>
                      <option>Octopus Energy</option>
                      <option>E.ON Next</option>
                      <option>EDF Energy</option>
                      <option>Scottish Power</option>
                      <option>OVO Energy</option>
                    </select>
                  </div>
                )}

                <div className="wizard-actions">
                  <button onClick={prevStep} className="btn-outline">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Details */}
            {step === 4 && (
              <div>
                <div className="wizard-header">
                  <h2>How do you pay for your energy?</h2>
                  <p>Your payment method can affect the cost of some energy deals.</p>
                </div>
                <div className="wizard-options-grid">
                  <div 
                    className={`wizard-option-box ${paymentMethod === 'monthly-direct-debit' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('monthly-direct-debit')}
                  >
                    <CreditCard size={32} />
                    <span className="wizard-option-title">Monthly Direct Debit</span>
                  </div>
                  <div 
                    className={`wizard-option-box ${paymentMethod === 'quarterly-bill' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('quarterly-bill')}
                  >
                    <CreditCard size={32} />
                    <span className="wizard-option-title">Receipt of Bill</span>
                  </div>
                </div>
                <div className="wizard-actions">
                  <button onClick={prevStep} className="btn-outline">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Usage Details */}
            {step === 5 && (
              <div>
                <div className="wizard-header">
                  <h2>Tell us about your energy usage</h2>
                  <p>Providing accurate details helps us calculate precise deal savings.</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">How would you like to estimate usage?</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        checked={usageType === 'estimate'} 
                        onChange={() => setUsageType('estimate')}
                        accent-color="var(--brand-accent)"
                      />
                      <span>House Size Estimate</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        checked={usageType === 'exact'} 
                        onChange={() => setUsageType('exact')}
                        accent-color="var(--brand-accent)"
                      />
                      <span>Exact Annual Usage (kWh)</span>
                    </label>
                  </div>
                </div>

                {usageType === 'estimate' ? (
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Select Household Size</label>
                    <select 
                      className="form-control"
                      value={propertySize}
                      onChange={(e) => setPropertySize(e.target.value as any)}
                    >
                      <option value="small">Small Home / Flat (1-2 occupants)</option>
                      <option value="medium">Medium House (3-4 occupants)</option>
                      <option value="large">Large House (5+ occupants)</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px' }}>
                    {fuelType !== 'gas' && (
                      <div className="form-group">
                        <label className="form-label">Electricity Usage (kWh / year)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={annualElecKwh}
                          onChange={(e) => setAnnualElecKwh(e.target.value)}
                        />
                      </div>
                    )}
                    {fuelType !== 'electricity' && (
                      <div className="form-group" style={{ marginTop: '12px' }}>
                        <label className="form-label">Gas Usage (kWh / year)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={annualGasKwh}
                          onChange={(e) => setAnnualGasKwh(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="wizard-actions">
                  <button onClick={prevStep} className="btn-outline">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleRunComparison} 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Comparing...' : 'Compare Deals'} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* STEP 6: Results Dashboard Grid Layout */}
      {step === 6 && comparisonResults && (
        <div className="results-layout">
          
          <div className="results-header-summary">
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Top energy deals in your area</h2>
              <p style={{ marginTop: '4px' }}>
                Showing results for <strong>{postcode}</strong> based on {fuelType === 'both' ? 'Dual Fuel' : fuelType} comparison.
              </p>
            </div>
            <div style={{ backgroundColor: '#edf2f7', padding: '12px 20px', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Current Estimated Spend</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--brand-primary)' }}>
                £{comparisonResults.results.currentPlan.costMonthly}/month
              </strong>
            </div>
          </div>

          <div className="results-grid">
            
            {/* Sidebar Filters */}
            <aside className="sidebar-filters">
              <div className="filter-section">
                <span className="filter-title">Sort Results</span>
                <select 
                  className="form-control" 
                  style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                >
                  <option value="savings">Highest Savings</option>
                  <option value="cost">Lowest Cost</option>
                </select>
              </div>

              <div className="filter-section">
                <span className="filter-title">Preferences</span>
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={filterGreenOnly}
                    onChange={(e) => setFilterGreenOnly(e.target.checked)}
                  />
                  <span>100% Green Energy</span>
                </label>
                <label className="filter-option">
                  <input 
                    type="checkbox" 
                    checked={filterNoExitFees}
                    onChange={(e) => setFilterNoExitFees(e.target.checked)}
                  />
                  <span>No Exit Fees</span>
                </label>
              </div>

              <div className="filter-section" style={{ border: 'none' }}>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Switching is backed by the Energy Switch Guarantee. Safe, quick, and no loss of service.</span>
                </div>
              </div>
            </aside>

            {/* Deals List */}
            <section className="results-list">
              {comparisonResults.results.deals
                .filter((deal: any) => {
                  if (filterGreenOnly && !deal.isGreen) return false;
                  if (filterNoExitFees && deal.exitFee > 0) return false;
                  return true;
                })
                .sort((a: any, b: any) => {
                  if (sortOption === 'cost') return a.costMonthly - b.costMonthly;
                  return b.savingAnnual - a.savingAnnual;
                })
                .map((deal: any, index: number) => (
                  <div key={index} className="deal-card">
                    {index === 0 && (
                      <span className="deal-badge cheapest">Uswitch Rated</span>
                    )}

                    <div className="deal-logo-col">
                      <span className="deal-supplier">{deal.supplierName}</span>
                      <span className="deal-plan-name">{deal.planName}</span>
                      {deal.isGreen && (
                        <span className="deal-green-tag">
                          <Leaf size={12} /> Green Energy
                        </span>
                      )}
                    </div>

                    <div className="deal-info-col">
                      <span className="deal-info-label">Exit Fees</span>
                      <span className="deal-info-value">
                        {deal.exitFee === 0 ? 'No exit fee' : `£${deal.exitFee} per fuel`}
                      </span>
                    </div>

                    <div className="deal-price-col">
                      <span className="deal-price-monthly">£{deal.costMonthly}</span>
                      <span className="deal-price-annual">£{deal.costAnnual} / year</span>
                    </div>

                    <div className="deal-savings-col">
                      {deal.savingAnnual > 0 ? (
                        <span className="deal-saving-tag">
                          Save £{deal.savingAnnual}/yr
                        </span>
                      ) : (
                        <span className="deal-saving-tag" style={{ backgroundColor: '#edf2f7', color: 'var(--text-muted)' }}>
                          No direct saving
                        </span>
                      )}
                      <button 
                        onClick={() => handleSwitchDeal(deal)}
                        className="btn-primary" 
                        style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                      >
                        Switch Deal <ArrowRight size={16} />
                      </button>
                    </div>

                  </div>
                ))}
            </section>

          </div>
        </div>
      )}
    </div>
  );
}
