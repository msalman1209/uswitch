'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Zap, Flame, ChevronRight, ChevronLeft, Building, CreditCard, 
  Leaf, Check, ShieldCheck, ArrowRight, Home,
  Sparkles, Star, Search, RefreshCw, X, FileText, CheckCircle2, MapPin, Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// UK Energy Suppliers with styling colors
const TOP_SUPPLIERS = [
  { name: 'Octopus Energy', color: '#ff0080', tag: 'UK #1 Rated' },
  { name: 'British Gas', color: '#00539b', tag: 'UK Largest' },
  { name: 'E.ON Next', color: '#e2001a', tag: '100% Renewable' },
  { name: 'EDF Energy', color: '#ea5a00', tag: 'Low Carbon' },
  { name: 'OVO Energy', color: '#008a00', tag: 'Green Plan' },
  { name: 'Scottish Power', color: '#008b8b', tag: 'Wind Energy' }
];

const TOP_BUSINESS_SUPPLIERS = [
  { name: 'British Gas Business', color: '#00539b', tag: 'UK #1 Commercial' },
  { name: 'Octopus Energy for Business', color: '#ff0080', tag: '100% Green Certified' },
  { name: 'TotalEnergies Gas & Power', color: '#ed1b24', tag: 'SME & Multi-Site' },
  { name: 'E.ON Next Business', color: '#e2001a', tag: 'Renewable B2B' },
  { name: 'EDF Energy Business', color: '#ea5a00', tag: 'Fixed Price Lock' },
  { name: 'ScottishPower Business', color: '#008b8b', tag: 'Commercial Rates' }
];

export default function EnergyJourneyPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: '#00b050' }} />
        <p style={{ fontWeight: 600, color: '#0a192f' }}>Loading your energy comparison...</p>
      </div>
    }>
      <EnergyJourney />
    </React.Suspense>
  );
}

function EnergyJourney() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postcodeParam = searchParams.get('postcode') || 'SW1A 1AA';
  const initialFuel = (searchParams.get('fuel') as any) || 'both';
  const initialType = (searchParams.get('type') as any) === 'business' ? 'business' : 'residential';

  const [customerType, setCustomerType] = useState<'residential' | 'business'>(initialType);
  const [postcode, setPostcode] = useState(postcodeParam);
  const [isEditingPostcode, setIsEditingPostcode] = useState(false);
  const [newPostcode, setNewPostcode] = useState(postcodeParam);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  
  // Address State
  const [addressList, setAddressList] = useState<string[]>([]);
  const [residentialAddresses, setResidentialAddresses] = useState<string[]>([]);
  const [businessAddresses, setBusinessAddresses] = useState<string[]>([]);
  const [locationInfo, setLocationInfo] = useState<{ district?: string; region?: string; ward?: string } | null>(null);
  const [addressLoading, setAddressLoading] = useState<boolean>(true);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addressSearch, setAddressSearch] = useState('');
  const [manualAddressMode, setManualAddressMode] = useState<boolean>(false);
  const [manualFlat, setManualFlat] = useState<string>('');
  const [manualStreet, setManualStreet] = useState<string>('');

  // Business Details State
  const [businessName, setBusinessName] = useState(initialType === 'business' ? 'NexGen Enterprises Ltd' : '');
  const [businessType, setBusinessType] = useState<'limited' | 'sole_trader' | 'partnership' | 'charity'>('limited');
  const [companyNumber, setCompanyNumber] = useState('');
  const [isVatRegistered, setIsVatRegistered] = useState(true);
  const [vatNumber, setVatNumber] = useState('');
  const [businessSector, setBusinessSector] = useState('Retail & Shops');
  const [signatoryName, setSignatoryName] = useState('Malik Salman');
  const [signatoryRole, setSignatoryRole] = useState('Managing Director');
  const [contractRenewal, setContractRenewal] = useState('1to3months');

  const [fuelType, setFuelType] = useState<'both' | 'electricity' | 'gas'>(initialFuel);
  const [sameSupplier, setSameSupplier] = useState(true);
  const [elecSupplier, setElecSupplier] = useState(initialType === 'business' ? 'British Gas Business' : 'Octopus Energy');
  const [gasSupplier, setGasSupplier] = useState(initialType === 'business' ? 'British Gas Business' : 'British Gas');
  const [paymentMethod, setPaymentMethod] = useState<'monthly-direct-debit' | 'quarterly-bill' | 'prepayment'>('monthly-direct-debit');
  const [usageType, setUsageType] = useState<'estimate' | 'exact'>('estimate');
  const [propertySize, setPropertySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [annualElecKwh, setAnnualElecKwh] = useState(initialType === 'business' ? '30000' : '2900');
  const [annualGasKwh, setAnnualGasKwh] = useState(initialType === 'business' ? '75000' : '11500');
  
  // Results Filters & Sorting
  const [filterGreenOnly, setFilterGreenOnly] = useState(false);
  const [filterNoExitFees, setFilterNoExitFees] = useState(false);
  const [filterFixedOnly, setFilterFixedOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'savings' | 'cost' | 'rating'>('savings');
  const [expandedTariffId, setExpandedTariffId] = useState<string | number | null>(null);

  // Switch Modal State
  const [switchModalDeal, setSwitchModalDeal] = useState<any | null>(null);
  const [switchSubmitting, setSwitchSubmitting] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState<any | null>(null);

  // Switch between Residential Home and Business Premises
  const handleToggleCustomerType = (type: 'residential' | 'business') => {
    setCustomerType(type);
    if (type === 'business') {
      const list = businessAddresses.length > 0 ? businessAddresses : addressList;
      setAddressList(list);
      if (list.length > 0) setSelectedAddress(list[0]);
      if (!businessName) setBusinessName('NexGen Enterprises Ltd');
      setElecSupplier('British Gas Business');
      setGasSupplier('British Gas Business');
      if (usageType === 'estimate') {
        setAnnualElecKwh('30000');
        setAnnualGasKwh('75000');
      }
    } else {
      const list = residentialAddresses.length > 0 ? residentialAddresses : addressList;
      setAddressList(list);
      if (list.length > 0) setSelectedAddress(list[0]);
      setElecSupplier('Octopus Energy');
      setGasSupplier('British Gas');
      if (usageType === 'estimate') {
        setAnnualElecKwh('2900');
        setAnnualGasKwh('11500');
      }
    }
  };

  // Fetch real UK location & dynamic addresses for the postcode
  useEffect(() => {
    let isCurrent = true;
    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const clean = postcode.replace(/\s+/g, '').toUpperCase();
        const res = await fetch(`${API_BASE}/postcode/lookup/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (isCurrent && data.success) {
            const resi = Array.isArray(data.addresses) && data.addresses.length > 0 ? data.addresses : [];
            const biz = Array.isArray(data.businessAddresses) && data.businessAddresses.length > 0 ? data.businessAddresses : [];
            setResidentialAddresses(resi);
            setBusinessAddresses(biz);
            setLocationInfo({ district: data.district, region: data.region, ward: data.ward });

            const activeList = customerType === 'business' && biz.length > 0 ? biz : resi;
            setAddressList(activeList);
            setSelectedAddress(activeList[0] || '');
            setManualStreet(data.street || `${data.district || 'High'} Street`);
            setAddressLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Postcode lookup error:', err);
      }

      // Graceful fallback if backend call fails
      if (isCurrent) {
        const fallbackResi = [
          `Flat 1, 10 High Street, ${postcode}`,
          `Flat 2, 10 High Street, ${postcode}`,
          `Flat 3, 10 High Street, ${postcode}`,
          `1 High Street, ${postcode}`,
          `5 High Street, ${postcode}`,
          `12 High Street, ${postcode}`,
          `24 High Street, ${postcode}`
        ];
        const fallbackBiz = [
          `Unit 1A, High Street Enterprise Park, ${postcode}`,
          `Suite 101, Commercial Chambers, 14 High Street, ${postcode}`,
          `Ground Floor Retail, 24 High Street, ${postcode}`,
          `Office 3, Business Hub, High Street, ${postcode}`
        ];
        setResidentialAddresses(fallbackResi);
        setBusinessAddresses(fallbackBiz);
        const active = customerType === 'business' ? fallbackBiz : fallbackResi;
        setAddressList(active);
        setSelectedAddress(active[0]);
        setAddressLoading(false);
      }
    };

    fetchAddresses();
    return () => { isCurrent = false; };
  }, [postcode, customerType]);

  // Handle applying manual address
  const handleApplyManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const flatPart = manualFlat.trim() ? `${manualFlat.trim()}, ` : '';
    const streetPart = manualStreet.trim() || 'High Street';
    const districtPart = locationInfo?.district ? `, ${locationInfo.district}` : '';
    const fullCustom = `${flatPart}${streetPart}${districtPart}, ${postcode}`;
    setSelectedAddress(fullCustom);
    if (!addressList.includes(fullCustom)) {
      setAddressList([fullCustom, ...addressList]);
    }
    setManualAddressMode(false);
  };

  // Stepper definition
  const STEP_TITLES = ['Fuel', 'Address', 'Supplier', 'Payment', 'Usage', 'Tariffs'];

  // Handle Postcode update
  const handleSavePostcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostcode.trim()) {
      setPostcode(newPostcode.trim().toUpperCase());
      setIsEditingPostcode(false);
    }
  };

  // Run Energy Comparison (Jellyfish Medusa API)
  const handleRunComparison = async () => {
    setLoading(true);
    try {
      const payload = {
        postcode,
        address: selectedAddress,
        customerType,
        isBusiness: customerType === 'business',
        businessName: customerType === 'business' ? (businessName.trim() || 'My Business Ltd') : undefined,
        businessType: customerType === 'business' ? businessType : undefined,
        companyNumber: customerType === 'business' ? companyNumber : undefined,
        vatNumber: customerType === 'business' && isVatRegistered ? vatNumber : undefined,
        sector: customerType === 'business' ? businessSector : undefined,
        signatoryName: customerType === 'business' ? signatoryName : undefined,
        signatoryRole: customerType === 'business' ? signatoryRole : undefined,
        contractEndDate: customerType === 'business' ? contractRenewal : undefined,
        currentSupplier: fuelType === 'gas' ? gasSupplier : elecSupplier,
        paymentMethod,
        usageType,
        propertySize,
        annualElecKwh: usageType === 'exact' ? parseFloat(annualElecKwh) : undefined,
        annualGasKwh: usageType === 'exact' ? parseFloat(annualGasKwh) : undefined,
        fuelType
      };

      let response = await fetch(`${API_BASE}/energy/jellyfish/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token')) || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        response = await fetch(`${API_BASE}/comparisons/energy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token')) || ''}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      setComparisonResults(data);
      setStep(6);
    } catch (error) {
      console.error('Error running comparison:', error);
      alert('Failed to connect to the comparison engine. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Open Switch Modal
  const openSwitchModal = (deal: any) => {
    setSwitchModalDeal(deal);
    setSwitchSuccess(null);
  };

  // Submit Deal Switch via Jellyfish Contract API
  const handleConfirmSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchModalDeal) return;
    setSwitchSubmitting(true);

    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));

    try {
      const contractResp = await fetch(`${API_BASE}/energy/jellyfish/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          comparisonId: comparisonResults?.comparisonId,
          searchId: comparisonResults?.searchId,
          dealId: switchModalDeal.id,
          supplierName: switchModalDeal.supplierName,
          planName: switchModalDeal.planName,
          costMonthly: switchModalDeal.costMonthly,
          costAnnual: switchModalDeal.costAnnual,
          savingAnnual: switchModalDeal.savingAnnual,
          client: {
            address: selectedAddress,
            postcode,
            isBusiness: customerType === 'business',
            businessName: customerType === 'business' ? businessName : undefined,
            businessType: customerType === 'business' ? businessType : undefined,
            companyNumber: customerType === 'business' ? companyNumber : undefined,
            vatNumber: customerType === 'business' && isVatRegistered ? vatNumber : undefined,
            signatoryName: customerType === 'business' ? signatoryName : undefined,
            signatoryRole: customerType === 'business' ? signatoryRole : undefined
          }
        })
      });

      const resData = await contractResp.json();
      setSwitchSuccess(resData);
    } catch (err: any) {
      console.error('Switch error:', err);
      alert('Could not complete switch. Please try again.');
    } finally {
      setSwitchSubmitting(false);
    }
  };

  // Helper selectors
  const nextStep = () => setStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Filtered addresses for search
  const searchQuery = addressSearch.trim().toLowerCase();
  const filteredAddresses = addressList.filter(a => 
    a.toLowerCase().includes(searchQuery)
  );

  // If user searched for something custom not in the list
  const customQueryAddress = addressSearch.trim().length > 1
    ? `${addressSearch.trim()}, ${locationInfo?.district ? locationInfo.district + ', ' : ''}${postcode}`
    : null;

  return (
    <div className="journey-page-wrapper">
      <div className="container">

        {/* TOP TRUST & PROGRESS HEADER */}
        {step < 6 && (
          <div className="stepper-container">
            {/* Trust Pill Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#166534', background: '#dcfce7', padding: '6px 16px', borderRadius: '999px', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> 100% Free & Impartial
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#0369a1', background: '#e0f2fe', padding: '6px 16px', borderRadius: '999px', fontWeight: 600 }}>
                <ShieldCheck size={16} /> Energy Switch Guarantee
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#7c3aed', background: '#f3e8ff', padding: '6px 16px', borderRadius: '999px', fontWeight: 600 }}>
                <Sparkles size={16} /> Jellyfish Medusa API Integrated
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="stepper-steps">
              <div 
                className="stepper-progress-fill" 
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              ></div>
              {STEP_TITLES.map((title, idx) => {
                const stepNum = idx + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;

                return (
                  <div 
                    key={idx} 
                    className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => isCompleted && setStep(stepNum)}
                  >
                    <div className="stepper-circle">
                      {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                    </div>
                    <span className="stepper-label">{title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOADING ANIMATION STATE */}
        {loading && (
          <div className="wizard-layout">
            <div className="wizard-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e6f7ec', color: '#00b050', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <RefreshCw size={40} className="animate-spin" />
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '8px' }}>
                Searching Live UK Energy Tariffs
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 24px' }}>
                Connecting to Jellyfish Energy Medusa platform to find the cheapest fixed and green tariffs for <strong>{postcode}</strong>...
              </p>
              <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                <div className="wizard-progress">
                  <div className="wizard-progress-bar" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: FUEL SELECTION */}
        {/* ========================================================================= */}
        {!loading && step === 1 && (
          <div className="wizard-layout">
            <div className="wizard-card">
              <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: '15%' }}></div>
              </div>

              <div className="wizard-header">
                <h2>Which fuel do you want to compare?</h2>
                <p>UK households save the most money by switching both gas and electricity together with a single supplier.</p>
              </div>

              <div className="wizard-options-grid">
                {/* DUAL FUEL */}
                <div 
                  className={`wizard-option-box ${fuelType === 'both' ? 'selected' : ''}`}
                  onClick={() => setFuelType('both')}
                >
                  <span className="wizard-option-badge">Most Popular • Save up to £240</span>
                  <div className="icon-wrap" style={{ display: 'flex', gap: '2px' }}>
                    <Zap size={24} />
                    <Flame size={24} />
                  </div>
                  <span className="wizard-option-title">Gas & Electricity</span>
                  <span className="wizard-option-subtitle">
                    Dual fuel deal. Combine both bills with one supplier for maximum discounts.
                  </span>
                </div>

                {/* ELEC ONLY */}
                <div 
                  className={`wizard-option-box ${fuelType === 'electricity' ? 'selected' : ''}`}
                  onClick={() => setFuelType('electricity')}
                >
                  <div className="icon-wrap">
                    <Zap size={28} />
                  </div>
                  <span className="wizard-option-title">Electricity Only</span>
                  <span className="wizard-option-subtitle">
                    For all-electric properties, flats, heat pumps, or storage heater setups.
                  </span>
                </div>

                {/* GAS ONLY */}
                <div 
                  className={`wizard-option-box ${fuelType === 'gas' ? 'selected' : ''}`}
                  onClick={() => setFuelType('gas')}
                >
                  <div className="icon-wrap">
                    <Flame size={28} />
                  </div>
                  <span className="wizard-option-title">Gas Only</span>
                  <span className="wizard-option-subtitle">
                    Mains gas boiler supply only (when electricity is billed separately).
                  </span>
                </div>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: CONFIRM ADDRESS */}
        {/* ========================================================================= */}
        {!loading && step === 2 && (
          <div className="wizard-layout">
            <div className="wizard-card">
              <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: '35%' }}></div>
              </div>

              <div className="wizard-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                  <h2>Confirm your {customerType === 'business' ? 'commercial business' : 'property'} address</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {locationInfo?.district && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e6f7ec', color: '#008a00', fontSize: '0.8rem', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                        <MapPin size={13} /> {locationInfo.district}{locationInfo.region ? `, ${locationInfo.region}` : ''}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '999px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                        Postcode: {postcode}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setIsEditingPostcode(!isEditingPostcode)} 
                        style={{ fontSize: '0.8rem', color: '#00b050', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {isEditingPostcode ? 'Cancel' : 'Change'}
                      </button>
                    </div>
                  </div>
                </div>
                <p>We use your postcode to fetch regional UK energy distribution rates (DNO charges).</p>
              </div>

              {/* Edit Postcode Drawer */}
              {isEditingPostcode && (
                <form onSubmit={handleSavePostcode} style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Enter new UK postcode (e.g. M1 1AE, B1 1BB)"
                    value={newPostcode}
                    onChange={(e) => setNewPostcode(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                    Update Postcode
                  </button>
                </form>
              )}

                            {/* Property Type Switcher Pills */}
              <div className="property-type-selector">
                <button
                  type="button"
                  className={`property-type-pill ${customerType === 'residential' ? 'active' : ''}`}
                  onClick={() => handleToggleCustomerType('residential')}
                >
                  <Home size={18} />
                  <span>Residential Home</span>
                </button>
                <button
                  type="button"
                  className={`property-type-pill ${customerType === 'business' ? 'active' : ''}`}
                  onClick={() => handleToggleCustomerType('business')}
                >
                  <Building size={18} />
                  <span>Business Premises</span>
                </button>
              </div>

              {/* Commercial Business Details Form */}
              {customerType === 'business' && (
                <div className="business-details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={20} style={{ color: '#00b050' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--brand-primary)' }}>
                        Commercial Business Information
                      </h3>
                    </div>
                    <span className="business-badge">B2B Commercial Energy</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Trading / Business Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Acme Tech Solutions Ltd"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Business Structure</label>
                      <select 
                        className="form-control" 
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value as any)}
                      >
                        <option value="limited">Limited Company (Ltd / PLC)</option>
                        <option value="sole_trader">Sole Trader / Self-Employed</option>
                        <option value="partnership">Partnership / LLP</option>
                        <option value="charity">Registered Charity / Non-Profit</option>
                      </select>
                    </div>

                    {businessType === 'limited' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.85rem' }}>Company Reg Number (CRN)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. 12345678"
                          value={companyNumber}
                          onChange={(e) => setCompanyNumber(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Business Sector / Industry</label>
                      <select 
                        className="form-control" 
                        value={businessSector}
                        onChange={(e) => setBusinessSector(e.target.value)}
                      >
                        <option value="Retail & Shops">Retail & High Street Shops</option>
                        <option value="Offices & Tech">Offices & Professional Services</option>
                        <option value="Hospitality & Pubs">Hospitality, Restaurants & Pubs</option>
                        <option value="Industrial & Warehousing">Manufacturing & Warehouses</option>
                        <option value="Healthcare & Care Homes">Healthcare & Medical</option>
                        <option value="Education & Schools">Education & Community</option>
                        <option value="Other">Other Commercial Premises</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Contract Renewal Window</label>
                      <select 
                        className="form-control" 
                        value={contractRenewal}
                        onChange={(e) => setContractRenewal(e.target.value)}
                      >
                        <option value="now">Out of contract (Deemed rollover rate)</option>
                        <option value="1to3months">Within next 1 - 3 months</option>
                        <option value="3to6months">Within 3 - 6 months</option>
                        <option value="moving">Moving to new business premises</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Authorized Decision Maker</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Full name (e.g. Malik Salman)"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Signatory Role</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Managing Director / Partner"
                        value={signatoryRole}
                        onChange={(e) => setSignatoryRole(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      <input 
                        type="checkbox" 
                        checked={isVatRegistered} 
                        onChange={(e) => setIsVatRegistered(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#00b050' }}
                      />
                      <span>Business is VAT Registered (20% standard rate applies)</span>
                    </label>
                    {isVatRegistered && (
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="UK VAT Number (e.g. GB123456789)"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        style={{ maxWidth: '240px', padding: '6px 12px', fontSize: '0.85rem' }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Toggle Between List / Manual Address */}
              {!manualAddressMode ? (
                <>
                  {/* Address Search Filter */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Search address or building</label>
                      <button 
                        type="button"
                        onClick={() => setManualAddressMode(true)}
                        style={{ fontSize: '0.85rem', color: '#00b050', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Enter address manually
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: '44px' }}
                        placeholder="Type flat number, house number, or street name..."
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredAddresses.length > 0) {
                              setSelectedAddress(filteredAddresses[0]);
                            } else if (customQueryAddress) {
                              setSelectedAddress(customQueryAddress);
                              if (!addressList.includes(customQueryAddress)) {
                                setAddressList([customQueryAddress, ...addressList]);
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* LOADING STATE */}
                  {addressLoading && (
                    <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      <RefreshCw size={28} className="animate-spin" style={{ color: '#00b050', margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: 600 }}>Fetching location & properties for {postcode}...</p>
                    </div>
                  )}

                  {/* CUSTOM QUERY PROMPT WHEN TYPING */}
                  {!addressLoading && customQueryAddress && !filteredAddresses.includes(selectedAddress) && (
                    <div 
                      onClick={() => {
                        setSelectedAddress(customQueryAddress);
                        if (!addressList.includes(customQueryAddress)) {
                          setAddressList([customQueryAddress, ...addressList]);
                        }
                      }}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', 
                        background: '#f0fdf4', border: '1.5px dashed #00b050', borderRadius: '12px', 
                        marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                    >
                      <Sparkles size={20} style={{ color: '#00b050', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#008a00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Address</span>
                        <div style={{ fontWeight: 700, color: '#0a192f', fontSize: '0.95rem' }}>
                          Use: {customQueryAddress}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00b050', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #00b050' }}>Select</span>
                    </div>
                  )}

                  {/* Selectable Address List Cards */}
                  {!addressLoading && (
                    <div className="form-group">
                      <label className="form-label">
                        Select your address ({filteredAddresses.length} found {locationInfo?.district ? `in ${locationInfo.district}` : ''})
                      </label>
                      <div className="address-list-picker">
                        {filteredAddresses.map((addr, idx) => {
                          const isSelected = selectedAddress === addr;
                          return (
                            <div 
                              key={idx} 
                              className={`address-item-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedAddress(addr)}
                            >
                              <div className="address-radio"></div>
                              <Building size={20} style={{ color: isSelected ? '#00b050' : '#64748b' }} />
                              <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0a192f' : '#334155', fontSize: '0.95rem' }}>
                                {addr}
                              </span>
                            </div>
                          );
                        })}

                        {filteredAddresses.length === 0 && !customQueryAddress && (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                            No matching address found. Click "Enter address manually" above to type your property details.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* MANUAL ADDRESS FORM */
                <form onSubmit={handleApplyManualAddress} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0a192f' }}>Enter Address Details</h3>
                    <button 
                      type="button" 
                      onClick={() => setManualAddressMode(false)}
                      style={{ fontSize: '0.85rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Back to list
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Flat / Apartment / House Number</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Flat 4B or 27"
                      value={manualFlat}
                      onChange={(e) => setManualFlat(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street / Road Name</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Victoria Road"
                      value={manualStreet}
                      onChange={(e) => setManualStreet(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Town / City</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={locationInfo?.district || 'London'}
                      readOnly
                      style={{ background: '#f1f5f9' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Save & Use This Address
                  </button>
                </form>
              )}

              {/* Reassurance Banner */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.875rem' }}>
                <ShieldCheck size={20} style={{ color: '#00b050', flexShrink: 0 }} />
                <span>
                  No physical work or engineer visits required. Your energy supply will not be interrupted during the switch.
                </span>
              </div>

              <div className="wizard-actions">
                <button onClick={prevStep} className="btn-outline">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={nextStep} className="btn-primary" disabled={!selectedAddress}>
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CURRENT SUPPLIER */}
        {/* ========================================================================= */}
        {!loading && step === 3 && (
          <div className="wizard-layout">
            <div className="wizard-card">
              <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: '60%' }}></div>
              </div>

              <div className="wizard-header">
                <h2>Who currently supplies your energy?</h2>
                <p>Choose your current energy provider so we can compare prices against your existing tariff.</p>
              </div>

              {fuelType === 'both' && (
                <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--brand-primary)' }}>
                    Are both gas & electricity with the same supplier?
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSameSupplier(true)}
                      style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: sameSupplier ? '#00b050' : '#e2e8f0', color: sameSupplier ? 'white' : '#64748b' }}
                    >
                      Yes
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSameSupplier(false)}
                      style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: !sameSupplier ? '#00b050' : '#e2e8f0', color: !sameSupplier ? 'white' : '#64748b' }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}

              {/* Electricity or Joint Supplier Grid */}
              <div className="form-group">
                <label className="form-label">
                  {fuelType === 'gas' ? 'Select Gas Supplier' : sameSupplier ? 'Select Current Supplier' : 'Select Electricity Supplier'}
                </label>
                <div className="supplier-grid">
                  {(customerType === 'business' ? TOP_BUSINESS_SUPPLIERS : TOP_SUPPLIERS).map((s, idx) => {
                    const current = fuelType === 'gas' ? gasSupplier : elecSupplier;
                    const isSelected = current === s.name;
                    return (
                      <div 
                        key={idx}
                        className={`supplier-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (fuelType === 'gas') setGasSupplier(s.name);
                          else {
                            setElecSupplier(s.name);
                            if (sameSupplier) setGasSupplier(s.name);
                          }
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color }}></div>
                        <span className="supplier-card-badge">{s.name}</span>
                        <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{s.tag}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Separate Gas Supplier Grid (if dual fuel and different suppliers) */}
              {fuelType === 'both' && !sameSupplier && (
                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label className="form-label">Select Gas Supplier</label>
                  <div className="supplier-grid">
                    {(customerType === 'business' ? TOP_BUSINESS_SUPPLIERS : TOP_SUPPLIERS).map((s, idx) => {
                      const isSelected = gasSupplier === s.name;
                      return (
                        <div 
                          key={idx}
                          className={`supplier-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setGasSupplier(s.name)}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color }}></div>
                          <span className="supplier-card-badge">{s.name}</span>
                          <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{s.tag}</span>
                        </div>
                      );
                    })}
                  </div>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PAYMENT METHOD */}
        {/* ========================================================================= */}
        {!loading && step === 4 && (
          <div className="wizard-layout">
            <div className="wizard-card">
              <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: '80%' }}></div>
              </div>

              <div className="wizard-header">
                <h2>How do you pay for your energy?</h2>
                <p>Paying by Direct Debit unlocks the cheapest fixed energy tariffs on the UK market.</p>
              </div>

              <div className="wizard-options-grid">
                {/* DIRECT DEBIT */}
                <div 
                  className={`wizard-option-box ${paymentMethod === 'monthly-direct-debit' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('monthly-direct-debit')}
                >
                  <span className="wizard-option-badge">Cheapest Tariffs</span>
                  <div className="icon-wrap">
                    <CreditCard size={28} />
                  </div>
                  <span className="wizard-option-title">Monthly Direct Debit</span>
                  <span className="wizard-option-subtitle">
                    Fixed regular monthly payments. Saves up to £80/year compared to bill payments.
                  </span>
                </div>

                {/* RECEIPT OF BILL */}
                <div 
                  className={`wizard-option-box ${paymentMethod === 'quarterly-bill' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('quarterly-bill')}
                >
                  <div className="icon-wrap">
                    <FileText size={28} />
                  </div>
                  <span className="wizard-option-title">Pay On Receipt of Bill</span>
                  <span className="wizard-option-subtitle">
                    Quarterly bills paid via card, online banking, or cheque when your bill arrives.
                  </span>
                </div>

                {/* PREPAYMENT */}
                <div 
                  className={`wizard-option-box ${paymentMethod === 'prepayment' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('prepayment')}
                >
                  <div className="icon-wrap">
                    <Zap size={28} />
                  </div>
                  <span className="wizard-option-title">Prepayment Meter</span>
                  <span className="wizard-option-subtitle">
                    Pay-as-you-go key, card, or smartphone top-up app before you use energy.
                  </span>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: USAGE ESTIMATOR */}
        {/* ========================================================================= */}
        {!loading && step === 5 && (
          <div className="wizard-layout">
            <div className="wizard-card">
              <div className="wizard-progress">
                <div className="wizard-progress-bar" style={{ width: '100%' }}></div>
              </div>

              <div className="wizard-header">
                <h2>How much energy do you use?</h2>
                <p>Select your home size or enter exact kWh from a recent energy bill.</p>
              </div>

              {/* Estimation Mode Toggle */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '999px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setUsageType('estimate')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: usageType === 'estimate' ? '#00b050' : 'transparent',
                    color: usageType === 'estimate' ? 'white' : '#64748b'
                  }}
                >
                  Estimate by Home Size
                </button>
                <button
                  type="button"
                  onClick={() => setUsageType('exact')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: usageType === 'exact' ? '#00b050' : 'transparent',
                    color: usageType === 'exact' ? 'white' : '#64748b'
                  }}
                >
                  Exact Usage (kWh / Bill)
                </button>
              </div>

              {/* Premises Consumption Cards */}
              {usageType === 'estimate' ? (
                <div className="wizard-options-grid">
                  {customerType === 'business' ? (
                    <>
                      <div 
                        className={`wizard-option-box ${propertySize === 'small' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('small');
                          setAnnualElecKwh('10000');
                          setAnnualGasKwh('25000');
                        }}
                      >
                        <div className="icon-wrap">
                          <Building size={28} />
                        </div>
                        <span className="wizard-option-title">Micro-business / Small Unit</span>
                        <span className="wizard-option-subtitle">
                          Local shop, independent cafe, small private office.<br />
                          ~10,000 kWh Elec • 25,000 kWh Gas
                        </span>
                      </div>

                      <div 
                        className={`wizard-option-box ${propertySize === 'medium' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('medium');
                          setAnnualElecKwh('30000');
                          setAnnualGasKwh('75000');
                        }}
                      >
                        <span className="wizard-option-badge">Most Common SME</span>
                        <div className="icon-wrap">
                          <Building size={32} />
                        </div>
                        <span className="wizard-option-title">Medium SME Premises</span>
                        <span className="wizard-option-subtitle">
                          Restaurant, multi-room commercial office, clinic.<br />
                          ~30,000 kWh Elec • 75,000 kWh Gas
                        </span>
                      </div>

                      <div 
                        className={`wizard-option-box ${propertySize === 'large' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('large');
                          setAnnualElecKwh('85000');
                          setAnnualGasKwh('200000');
                        }}
                      >
                        <div className="icon-wrap">
                          <Building size={36} />
                        </div>
                        <span className="wizard-option-title">Large Commercial / Industrial</span>
                        <span className="wizard-option-subtitle">
                          Warehouse, factory, hotel, supermarket, multi-site.<br />
                          ~85,000 kWh Elec • 200,000 kWh Gas
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className={`wizard-option-box ${propertySize === 'small' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('small');
                          setAnnualElecKwh('1800');
                          setAnnualGasKwh('6000');
                        }}
                      >
                        <div className="icon-wrap">
                          <Home size={28} />
                        </div>
                        <span className="wizard-option-title">1 - 2 Bedrooms</span>
                        <span className="wizard-option-subtitle">
                          Flat or small terraced house. 1-2 occupants.<br />
                          ~1,800 kWh Elec • 6,000 kWh Gas
                        </span>
                      </div>

                      <div 
                        className={`wizard-option-box ${propertySize === 'medium' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('medium');
                          setAnnualElecKwh('2900');
                          setAnnualGasKwh('11500');
                        }}
                      >
                        <span className="wizard-option-badge">UK Average</span>
                        <div className="icon-wrap">
                          <Home size={32} />
                        </div>
                        <span className="wizard-option-title">3 Bedrooms</span>
                        <span className="wizard-option-subtitle">
                          Semi-detached or terraced. 3-4 occupants.<br />
                          ~2,900 kWh Elec • 11,500 kWh Gas
                        </span>
                      </div>

                      <div 
                        className={`wizard-option-box ${propertySize === 'large' ? 'selected' : ''}`}
                        onClick={() => {
                          setPropertySize('large');
                          setAnnualElecKwh('4300');
                          setAnnualGasKwh('17000');
                        }}
                      >
                        <div className="icon-wrap">
                          <Home size={36} />
                        </div>
                        <span className="wizard-option-title">4+ Bedrooms</span>
                        <span className="wizard-option-subtitle">
                          Large detached home. 5+ occupants.<br />
                          ~4,300 kWh Elec • 17,000 kWh Gas
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  {fuelType !== 'gas' && (
                    <div className="form-group">
                      <label className="form-label">Electricity Usage (kWh / year)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={annualElecKwh}
                        onChange={(e) => setAnnualElecKwh(e.target.value)}
                        placeholder="e.g. 2900"
                      />
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Medium home default: 2,900 kWh
                      </span>
                    </div>
                  )}

                  {fuelType !== 'electricity' && (
                    <div className="form-group">
                      <label className="form-label">Gas Usage (kWh / year)</label>
                      <input 
                        type="number" 
                        className="form-control"
                        value={annualGasKwh}
                        onChange={(e) => setAnnualGasKwh(e.target.value)}
                        placeholder="e.g. 11500"
                      />
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Medium home default: 11,500 kWh
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Baseline Estimated Cost Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Current Price Cap Baseline:</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {propertySize === 'small' ? '£84.50 / month (£1,014 / yr)' : propertySize === 'large' ? '£168.20 / month (£2,018 / yr)' : '£124.80 / month (£1,498 / yr)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00b050', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Check size={18} /> Jellyfish Live Tariffs Ready
                </div>
              </div>

              <div className="wizard-actions">
                <button onClick={prevStep} className="btn-outline">
                  <ChevronLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleRunComparison} 
                  className="btn-primary"
                  style={{ fontSize: '1.05rem', padding: '14px 32px' }}
                >
                  Compare Live Tariffs <Sparkles size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: LIVE JELLYFISH RESULTS DASHBOARD */}
        {/* ========================================================================= */}
        {!loading && step === 6 && comparisonResults && (
          <div className="results-layout">
            
            {/* Header Results Summary Banner */}
            <div className="results-header-summary">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Live Medusa API Search
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Postcode: <strong>{postcode}</strong>
                  </span>
                </div>
                <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  {customerType === 'business' ? `Top Commercial Energy Deals for ${businessName || 'Your Business'}` : 'Top Energy Deals For Your Home'}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  {customerType === 'business'
                    ? `Showing ${comparisonResults.results.deals.length} fixed commercial tariffs compared against out-of-contract deemed rollover rates.`
                    : `Showing ${comparisonResults.results.deals.length} tariffs compared against the standard Ofgem energy price cap.`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 20px', borderRadius: '16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 600 }}>{customerType === 'business' ? 'Deemed Rollover Baseline' : 'Current Baseline Cost'}</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    £{comparisonResults.results.currentPlan?.costMonthly || '124.80'}/mo
                  </span>
                </div>

                <button 
                  onClick={() => setStep(1)} 
                  className="btn-outline" 
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Edit Answers
                </button>
              </div>
            </div>

            {/* Results Grid (Filters Sidebar + Deals List) */}
            <div className="results-grid">
              
              {/* SIDEBAR FILTERS */}
              <aside className="sidebar-filters">
                <div className="filter-section">
                  <span className="filter-title">Sort By</span>
                  <select 
                    className="form-control"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                  >
                    <option value="savings">Highest Annual Savings</option>
                    <option value="cost">Lowest Monthly Cost</option>
                    <option value="rating">Top Customer Rating</option>
                  </select>
                </div>

                <div className="filter-section">
                  <span className="filter-title">Filter Features</span>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filterGreenOnly}
                      onChange={(e) => setFilterGreenOnly(e.target.checked)}
                    />
                    <span>100% Green Energy Only</span>
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filterNoExitFees}
                      onChange={(e) => setFilterNoExitFees(e.target.checked)}
                    />
                    <span>No Exit Fees</span>
                  </label>
                  <label className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filterFixedOnly}
                      onChange={(e) => setFilterFixedOnly(e.target.checked)}
                    />
                    <span>Fixed Price Tariffs Only</span>
                  </label>
                </div>

                <div className="filter-section" style={{ border: 'none' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', color: '#166534', fontSize: '0.825rem', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Energy Switch Guarantee
                    </div>
                    Switches complete reliably within 5 working days with no interruptions to supply.
                  </div>
                </div>
              </aside>

              {/* DEALS LIST */}
              <section className="results-list">
                {comparisonResults.results.deals
                  .filter((deal: any) => {
                    if (filterGreenOnly && !deal.isGreen) return false;
                    if (filterNoExitFees && deal.exitFee > 0) return false;
                    if (filterFixedOnly && !deal.planName.toLowerCase().includes('fixed')) return false;
                    return true;
                  })
                  .sort((a: any, b: any) => {
                    if (sortOption === 'cost') return a.costMonthly - b.costMonthly;
                    if (sortOption === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
                    return b.savingAnnual - a.savingAnnual;
                  })
                  .map((deal: any, index: number) => {
                    const isExpanded = expandedTariffId === deal.id;

                    return (
                      <div key={index} className="deal-card">
                        {index === 0 ? (
                          <span className="deal-badge cheapest">★ Top Pick • Maximum Savings</span>
                        ) : customerType === 'business' ? (
                          <span className="deal-badge" style={{ background: '#1e3a8a', color: '#ffffff' }}>🏢 B2B Commercial Fixed</span>
                        ) : null}

                        {/* Supplier & Plan Col */}
                        <div>
                          <span className="deal-supplier">{deal.supplierName}</span>
                          <span className="deal-plan-name">{deal.planName}</span>
                          
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {deal.isGreen && (
                              <span className="deal-green-tag">
                                <Leaf size={12} /> 100% Green
                              </span>
                            )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '999px' }}>
                              <Star size={12} fill="#b45309" /> {deal.rating || 4.7}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '999px' }}>
                              {deal.contractLength || 12}M Fixed
                            </span>
                            {customerType === 'business' && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '3px 8px', borderRadius: '999px' }}>
                                CCL Exemption Eligible
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details / Exit fee */}
                        <div>
                          <span className="deal-info-label">Exit Fees</span>
                          <span className="deal-info-value">
                            {deal.exitFee === 0 ? '£0 No exit fee' : `£${deal.exitFee} per fuel`}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setExpandedTariffId(isExpanded ? null : deal.id)}
                            style={{ fontSize: '0.8rem', color: '#00b050', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isExpanded ? 'Hide rates ▲' : 'View tariff rates ▼'}
                          </button>
                        </div>

                        {/* Monthly & Annual Price */}
                        <div>
                          <span className="deal-price-monthly">£{deal.costMonthly}</span>
                          <span className="deal-price-annual">£{deal.costAnnual} / yr</span>
                        </div>

                        {/* Savings & Switch CTA */}
                        <div className="deal-savings-col">
                          {deal.savingAnnual > 0 ? (
                            <span className="deal-saving-tag">
                              Save £{deal.savingAnnual} / yr
                            </span>
                          ) : (
                            <span className="deal-saving-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>
                              Price Protected
                            </span>
                          )}
                          <button 
                            onClick={() => openSwitchModal(deal)}
                            className="btn-primary"
                            style={{ padding: '12px 22px', fontSize: '0.95rem' }}
                          >
                            Switch Deal <ArrowRight size={16} />
                          </button>
                        </div>

                        {/* Expandable Tariff Rates Breakdown */}
                        {isExpanded && (
                          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Electricity Unit Rate</span>
                              <span style={{ display: 'block', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                                {deal.elecUnitRate ? `${(deal.elecUnitRate * 100).toFixed(2)}p / kWh` : '24.50p / kWh'}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Elec Standing Charge</span>
                              <span style={{ display: 'block', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                                {deal.elecStandingCharge ? `${(deal.elecStandingCharge * 100).toFixed(2)}p / day` : '53.00p / day'}
                              </span>
                            </div>
                            {fuelType !== 'electricity' && (
                              <>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Gas Unit Rate</span>
                                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                                    {deal.gasUnitRate ? `${(deal.gasUnitRate * 100).toFixed(2)}p / kWh` : '6.24p / kWh'}
                                  </span>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Gas Standing Charge</span>
                                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                                    {deal.gasStandingCharge ? `${(deal.gasStandingCharge * 100).toFixed(2)}p / day` : '31.40p / day'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
              </section>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* SWITCH CONFIRMATION MODAL (JELLYFISH CONTRACT INTEGRATION) */}
        {/* ========================================================================= */}
        {switchModalDeal && (
          <div className="modal-overlay" onClick={() => setSwitchModalDeal(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  Confirm Switch to {switchModalDeal.supplierName}
                </h3>
                <button 
                  onClick={() => setSwitchModalDeal(null)} 
                  style={{ color: '#94a3b8', padding: '4px' }}
                >
                  <X size={24} />
                </button>
              </div>

              {!switchSuccess ? (
                <form onSubmit={handleConfirmSwitch}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#166534' }}>{switchModalDeal.planName}</span>
                      <span style={{ fontWeight: 800, color: '#166534', fontSize: '1.1rem' }}>£{switchModalDeal.costMonthly}/mo</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#15803d' }}>
                      <span>Estimated Annual Saving:</span>
                      <span style={{ fontWeight: 700 }}>Save £{switchModalDeal.savingAnnual}/year</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supply Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={`${selectedAddress}, ${postcode}`} 
                      readOnly 
                      style={{ background: '#f8fafc' }}
                    />
                  </div>

                  {customerType === 'business' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                        <div className="form-group">
                          <label className="form-label">Trading / Business Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={businessName} 
                            onChange={(e) => setBusinessName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company Number (CRN)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={companyNumber} 
                            onChange={(e) => setCompanyNumber(e.target.value)} 
                            placeholder="e.g. 12345678" 
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div className="form-group">
                          <label className="form-label">Authorized Signatory Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={signatoryName} 
                            onChange={(e) => setSignatoryName(e.target.value)} 
                            required 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Signatory Role / Position *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={signatoryRole} 
                            onChange={(e) => setSignatoryRole(e.target.value)} 
                            required 
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input type="text" className="form-control" defaultValue="Salman" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input type="text" className="form-control" defaultValue="Khan" required />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Email Address for Switch Updates</label>
                    <input type="email" className="form-control" defaultValue="salman@example.com" required />
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <CreditCard size={20} style={{ color: '#00b050' }} />
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.95rem' }}>Direct Debit Guarantee</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', lineHeight: '1.4' }}>
                      You are protected by the UK Direct Debit Guarantee. No payments will be taken until your new energy supply goes live.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setSwitchModalDeal(null)} 
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={switchSubmitting}
                    >
                      {switchSubmitting ? 'Creating Switch Contract...' : 'Confirm & Switch Now →'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#00b050', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Check size={36} strokeWidth={3} />
                  </div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '8px' }}>
                    Switch Successfully Initiated!
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '16px' }}>
                    Your contract has been registered on the Medusa Energy Platform.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', display: 'inline-block', marginBottom: '24px', fontSize: '0.9rem' }}>
                    <strong>Contract Reference:</strong> {switchSuccess.contractId || 'JF-MEDUSA-84920'}
                  </div>
                  <div>
                    <button 
                      onClick={() => router.push('/dashboard')} 
                      className="btn-primary"
                      style={{ padding: '12px 28px' }}
                    >
                      Go to My Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
