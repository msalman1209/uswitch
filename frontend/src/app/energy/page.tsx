'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function EnergyLanding() {
  const router = useRouter();
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.trim().length < 3) {
      setError('Please enter a valid UK postcode');
      return;
    }
    router.push(`/energy/journey?postcode=${encodeURIComponent(postcode.trim().toUpperCase())}`);
  };

  return (
    <div className="wizard-layout">
      <div className="wizard-card" style={{ maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-accent-light)', color: 'var(--brand-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Zap size={24} />
          </div>
          <h2>Compare Energy Prices</h2>
          <p style={{ marginTop: '8px' }}>Compare gas and electricity deals in your area to see how much you could save.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="postcode">Your Postcode</label>
            <input
              type="text"
              id="postcode"
              className="form-control"
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            {error && <span style={{ color: 'red', fontSize: '0.85rem' }}>{error}</span>}
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Start Comparison
          </button>
        </form>
      </div>
    </div>
  );
}
