'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap, Wifi, LayoutDashboard, ArrowRightLeft, 
  Settings, Play, CheckCircle, RefreshCw, AlertTriangle, Info
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = 'http://localhost:5000/api';

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="flex-center animate-pulse" style={{ height: '300px' }}>Loading...</div>}>
      <Dashboard />
    </React.Suspense>
  );
}

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState<any>(null);
  const [switches, setSwitches] = useState<any[]>([]);
  const [smartMeterData, setSmartMeterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Profile Edit State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check login and fetch details
  useEffect(() => {
    if (!mounted) return;
    
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));
    if (!token) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    async function loadDashboardData() {
      try {
        // 1. Check for temporary switch in session storage first
        const tempSwitch = sessionStorage.getItem('nexgen_temp_switch') || sessionStorage.getItem('uswitch_temp_switch');
        if (tempSwitch) {
          const switchObj = JSON.parse(tempSwitch);
          const saveRes = await fetch(`${API_BASE}/comparisons/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(switchObj)
          });
          if (saveRes.ok) {
            alert(`Your switch to ${switchObj.supplierName} has been synchronized and saved to your account!`);
          }
          sessionStorage.removeItem('nexgen_temp_switch');
          sessionStorage.removeItem('uswitch_temp_switch');
        }

        // 2. Fetch User Profile
        const profileRes = await fetch(`${API_BASE}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Auth failed');
        const profileData = await profileRes.json();
        setProfile(profileData);
        setFirstName(profileData.firstName);
        setLastName(profileData.lastName);
        setPhone(profileData.phone || '');
        setPostcode(profileData.postcode || '');

        // 3. Fetch Saved Deals / Switches
        const switchesRes = await fetch(`${API_BASE}/deals/saved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const switchesData = await switchesRes.json();
        setSwitches(switchesData);

        // 4. Fetch NexTrack Smart Meter Usage
        const usageRes = await fetch(`${API_BASE}/utrack/usage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usageData = await usageRes.json();
        setSmartMeterData(usageData);

      } catch (err) {
        console.error(err);
        localStorage.removeItem('uswitch_token');
        localStorage.removeItem('uswitch_user');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [mounted, router]);

  // Simulate advancing the switch timeline status
  const handleAdvanceSwitch = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'saved' ? 'switching' : 'completed';
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));
    
    try {
      const response = await fetch(`${API_BASE}/deals/saved/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        // Refresh switches lists
        const updated = switches.map(s => s.id === id ? { ...s, status: nextStatus } : s);
        setSwitches(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    const token = (localStorage.getItem('nexgen_token') || localStorage.getItem('uswitch_token'));
    
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ firstName, lastName, phone, postcode })
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data);
        localStorage.setItem('nexgen_user', JSON.stringify(data));
        localStorage.setItem('uswitch_user', JSON.stringify(data));
        setProfileSuccess('Profile updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex-center animate-pulse" style={{ height: '400px', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={48} className="tracker-icon" style={{ animation: 'spin 2s linear infinite' }} />
        <h3>Loading your NexGen Account...</h3>
      </div>
    );
  }

  // Pre-calculate weekly stats for Utrack from the last 7 items in smartMeterData
  const last7Days = smartMeterData.slice(-7);
  const weeklyElecKwh = last7Days.reduce((acc, curr) => acc + parseFloat(curr.electricityUsageKwh), 0);
  const weeklyGasKwh = last7Days.reduce((acc, curr) => acc + parseFloat(curr.gasUsageKwh), 0);
  const weeklyElecCost = last7Days.reduce((acc, curr) => acc + parseFloat(curr.electricityCost), 0);
  const weeklyGasCost = last7Days.reduce((acc, curr) => acc + parseFloat(curr.gasCost), 0);

  // Chart data setup for Utrack (Last 14 days)
  const last14Days = smartMeterData.slice(-14);
  const chartLabels = last14Days.map(item => {
    const d = new Date(item.recordDate);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Electricity Cost (£)',
        data: last14Days.map(item => parseFloat(item.electricityCost)),
        borderColor: '#1cb85c',
        backgroundColor: 'rgba(28, 184, 92, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Gas Cost (£)',
        data: last14Days.map(item => parseFloat(item.gasCost)),
        borderColor: '#0f2942',
        backgroundColor: 'rgba(15, 41, 66, 0.05)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <div className="dashboard-layout container">
      <div className="dashboard-grid">
        
        {/* Navigation Sidebar */}
        <aside className="dashboard-nav">
          <button 
            className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button 
            className={`dashboard-nav-item ${activeTab === 'switches' ? 'active' : ''}`}
            onClick={() => setActiveTab('switches')}
          >
            <ArrowRightLeft size={18} />
            My Switches ({switches.filter(s => s.status === 'switching').length})
          </button>
          <button 
            className={`dashboard-nav-item ${activeTab === 'utrack' ? 'active' : ''}`}
            onClick={() => setActiveTab('utrack')}
          >
            <Zap size={18} />
            NexTrack Smart Meter
          </button>
          <button 
            className={`dashboard-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Settings size={18} />
            Profile Settings
          </button>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content-card">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="dashboard-header">
                <div className="dashboard-welcome">
                  <h2>Welcome back, {profile?.firstName}!</h2>
                  <p>Check the status of your switches or track your household utility spending.</p>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Switch Requests</span>
                  <h3 style={{ fontSize: '2rem', marginTop: '6px' }}>
                    {switches.filter(s => s.status === 'switching').length}
                  </h3>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Electricity This Week</span>
                  <h3 style={{ fontSize: '2rem', marginTop: '6px', color: 'var(--brand-accent)' }}>
                    {weeklyElecKwh.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: '500' }}>kWh</span>
                  </h3>
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gas This Week</span>
                  <h3 style={{ fontSize: '2rem', marginTop: '6px', color: 'var(--brand-primary)' }}>
                    {weeklyGasKwh.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: '500' }}>kWh</span>
                  </h3>
                </div>
              </div>

              {/* Highlight Action alert */}
              {switches.filter(s => s.status === 'switching').length > 0 ? (
                <div className="alert-box success">
                  <CheckCircle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Your energy switch is in progress!</strong>
                    <span>We are handling the transition. Visit the "My Switches" tab to track step progress.</span>
                  </div>
                </div>
              ) : (
                <div className="alert-box info">
                  <Info size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block' }}>Ready to save on bills?</strong>
                    <span>You haven't run any switch applications yet. Start a new comparison.</span>
                  </div>
                </div>
              )}

              {/* Start Comparison Shortcuts */}
              <h3 style={{ marginBottom: '16px' }}>Start a new quote</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => router.push('/energy')}>
                  <Zap size={24} style={{ color: 'var(--brand-accent)', marginBottom: '12px' }} />
                  <h4>Compare Gas & Electricity</h4>
                  <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Compare standard cap variable plans with custom fixed terms.</p>
                </div>
                <div className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => router.push('/broadband')}>
                  <Wifi size={24} style={{ color: 'var(--brand-primary)', marginBottom: '12px' }} />
                  <h4>Compare Broadband & TV</h4>
                  <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Find fibre speeds and standard packages in your primary postal area.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY SWITCHES */}
          {activeTab === 'switches' && (
            <div>
              <div className="dashboard-header">
                <h2>My Active Switches</h2>
                <p>Track the transition timeline of your utility agreements.</p>
              </div>

              {switches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                  <ArrowRightLeft size={48} style={{ strokeWidth: '1.5px', marginBottom: '12px' }} />
                  <p>You have no switches saved. Start a comparison quote to switch deals!</p>
                </div>
              ) : (
                switches.map((item, idx) => (
                  <div key={idx} className="tracker-card">
                    <div className="tracker-header">
                      <div className="tracker-title-group">
                        {item.category === 'energy' ? <Zap size={24} className="tracker-icon" /> : <Wifi size={24} className="tracker-icon" />}
                        <div>
                          <span className="tracker-supplier-name">{item.supplierName}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{item.planName}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`tracker-badge ${item.status === 'switching' ? 'active' : ''}`}>
                          {item.status}
                        </span>
                        
                        {item.status !== 'completed' && (
                          <button 
                            className="btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleAdvanceSwitch(item.id, item.status)}
                          >
                            <Play size={12} /> Advance Step
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Timeline Stages progress rendering */}
                    <div className="tracker-steps">
                      <div className="tracker-line">
                        <div 
                          className="tracker-line-progress" 
                          style={{ 
                            width: item.status === 'saved' ? '0%' : item.status === 'switching' ? '50%' : '100%' 
                          }}
                        ></div>
                      </div>
                      
                      <div className={`tracker-step ${item.status !== 'saved' ? 'completed' : 'active'}`}>
                        <div className="tracker-step-circle">1</div>
                        <span className="tracker-step-label">Application Received</span>
                      </div>
                      <div className={`tracker-step ${item.status === 'completed' ? 'completed' : item.status === 'switching' ? 'active' : ''}`}>
                        <div className="tracker-step-circle">2</div>
                        <span className="tracker-step-label">Supplier Verification</span>
                      </div>
                      <div className={`tracker-step ${item.status === 'completed' ? 'completed' : ''}`}>
                        <div className="tracker-step-circle">3</div>
                        <span className="tracker-step-label">Switch Complete</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Estimated saving:</span>
                      <strong style={{ color: 'var(--brand-accent-hover)' }}>Save £{item.savingAnnual} / yr</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: UTRACK (SMART METER SIMULATOR) */}
          {activeTab === 'utrack' && (
            <div>
              <div className="dashboard-header">
                <h2>NexTrack - Live Energy Tracker</h2>
                <p>Simulating smart meter logs linking for electricity and gas consumption.</p>
              </div>

              {/* Mini cards for this week costs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Weekly Electricity cost</span>
                    <h3 style={{ fontSize: '1.75rem', marginTop: '4px', color: 'var(--brand-accent)' }}>
                      £{weeklyElecCost.toFixed(2)}
                    </h3>
                  </div>
                  <Zap size={32} style={{ color: 'var(--brand-accent)' }} />
                </div>
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Weekly Gas cost</span>
                    <h3 style={{ fontSize: '1.75rem', marginTop: '4px', color: 'var(--brand-primary)' }}>
                      £{weeklyGasCost.toFixed(2)}
                    </h3>
                  </div>
                  <Zap size={32} style={{ color: 'var(--brand-primary)' }} />
                </div>
              </div>

              {/* Chart.js graph container */}
              <div className="chart-card">
                <div className="chart-header">
                  <span className="chart-title">Daily utility costs (Last 14 Days)</span>
                </div>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (value) => `£${value}` }
                        }
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Energy Saving Tips */}
              <h3 style={{ margin: '32px 0 16px 0' }}>NexTrack smart suggestions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                  <AlertTriangle size={24} style={{ color: '#dd6b20', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Off-peak savings</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Run your washing machine between 10 PM and 6 AM to access lower unit rate pricing brackets.</p>
                  </div>
                </div>
                <div className="card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                  <AlertTriangle size={24} style={{ color: '#dd6b20', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>Thermostat setting</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Reducing your home thermostat setting by just 1°C saves up to £80 annually in heating bills.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div>
              <div className="dashboard-header">
                <h2>Account Settings</h2>
                <p>Modify your contact details and default switching postcode.</p>
              </div>

              {profileSuccess && (
                <div className="alert-box success">
                  <CheckCircle size={20} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label" htmlFor="postcode">Default Postcode</label>
                  <input
                    type="text"
                    id="postcode"
                    className="form-control"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                  Save changes
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
