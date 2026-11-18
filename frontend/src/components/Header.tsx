'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Wifi, Zap, CreditCard, ChevronDown, 
  User, LogOut, LayoutDashboard, Flame, Sun, Tv, 
  Home, Gauge, Sparkles, Menu, X, Shield
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('nexgen_user') || localStorage.getItem('uswitch_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('uswitch_user');
      }
    }
  }, [pathname]);

  // Close mega menu on route change
  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexgen_token');
    localStorage.removeItem('nexgen_user');
    localStorage.removeItem('uswitch_token');
    localStorage.removeItem('uswitch_user');
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="header-wrapper">
      {/* Top Banner Bar */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-trust">
            <span className="trust-star">★ Trustpilot</span>
            <span>Rated 4.5/5 by over 20,000+ UK customers</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
            <Link href="/energy">Ofgem Accredited</Link>
            <span>•</span>
            <Link href="/broadband">Fast & Free Switching</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            Nex<span>Gen</span>
            <span className="navbar-logo-sub" style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>
              Power Solutions
            </span>
            <span className="logo-badge">UK</span>
          </Link>

          {/* Desktop Navigation with Mega-Menus */}
          <div className="nav-menu" onMouseLeave={handleMouseLeave}>
            {/* Broadband Mega Menu */}
            <div 
              className="nav-item"
              onMouseEnter={() => handleMouseEnter('broadband')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/broadband" 
                className={`nav-link ${activeMenu === 'broadband' ? 'active-hover' : ''} ${pathname.startsWith('/broadband') ? 'active' : ''}`}
              >
                Broadband & TV <ChevronDown size={14} className={`chevron-icon ${activeMenu === 'broadband' ? 'rotate-180' : ''}`} />
              </Link>
              <div 
                className={`mega-menu ${activeMenu === 'broadband' ? 'is-open' : ''}`}
                onMouseEnter={() => handleMouseEnter('broadband')}
                onMouseLeave={handleMouseLeave}
              >
                <div>
                  <div className="mega-column-title">Broadband Deals</div>
                  <div className="mega-link-list">
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-icon-box"><Wifi size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Compare All Broadband</span>
                        <span className="mega-link-desc">Save up to £480/yr</span>
                      </div>
                    </Link>
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-icon-box"><Sparkles size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Fibre Broadband</span>
                        <span className="mega-link-desc">Ultra-fast speeds</span>
                      </div>
                    </Link>
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-icon-box"><Tv size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Broadband & TV Bundles</span>
                        <span className="mega-link-desc">Sky, Virgin & BT</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Top Providers</div>
                  <div className="mega-link-list">
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">Sky Broadband</span>
                        <span className="mega-link-desc">From £26/mo</span>
                      </div>
                    </Link>
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">Virgin Media</span>
                        <span className="mega-link-desc">Speeds up to 1.1Gbps</span>
                      </div>
                    </Link>
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">BT Fibre Broadband</span>
                        <span className="mega-link-desc">Reliable home WiFi</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Free Tools</div>
                  <div className="mega-link-list">
                    <Link href="/broadband" className="mega-link-item">
                      <div className="mega-icon-box"><Gauge size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Speed Test Tool</span>
                        <span className="mega-link-desc">Check your current speed</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="mega-promo-box">
                  <div>
                    <div className="mega-promo-title">Broadband Guarantee</div>
                    <div className="mega-promo-desc">Switch seamlessly in under 5 minutes without losing connection.</div>
                  </div>
                  <Link href="/broadband" className="mega-promo-btn">Compare Broadband</Link>
                </div>
              </div>
            </div>

            {/* Energy Mega Menu */}
            <div 
              className="nav-item"
              onMouseEnter={() => handleMouseEnter('energy')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/energy" 
                className={`nav-link ${activeMenu === 'energy' ? 'active-hover' : ''} ${pathname.startsWith('/energy') ? 'active' : ''}`}
              >
                Energy <ChevronDown size={14} className={`chevron-icon ${activeMenu === 'energy' ? 'rotate-180' : ''}`} />
              </Link>
              <div 
                className={`mega-menu ${activeMenu === 'energy' ? 'is-open' : ''}`}
                onMouseEnter={() => handleMouseEnter('energy')}
                onMouseLeave={handleMouseLeave}
              >
                <div>
                  <div className="mega-column-title">Compare Tariffs</div>
                  <div className="mega-link-list">
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-icon-box"><Zap size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Gas & Electricity</span>
                        <span className="mega-link-desc">Dual fuel savings</span>
                      </div>
                    </Link>
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-icon-box"><Sun size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Green Energy Tariffs</span>
                        <span className="mega-link-desc">100% renewable power</span>
                      </div>
                    </Link>
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-icon-box"><Flame size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Boiler Cover & Replacement</span>
                        <span className="mega-link-desc">Protect your home</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Energy Suppliers</div>
                  <div className="mega-link-list">
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">Octopus Energy</span>
                      </div>
                    </Link>
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">British Gas</span>
                      </div>
                    </Link>
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-link-text">
                        <span className="mega-link-title">E.ON Next & OVO</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Help & Advice</div>
                  <div className="mega-link-list">
                    <Link href="/energy" className="mega-link-item">
                      <div className="mega-icon-box"><Gauge size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Smart Meters Guide</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="mega-promo-box" style={{ background: 'linear-gradient(135deg, #00b050 0%, #008f40 100%)' }}>
                  <div>
                    <div className="mega-promo-title">NexTrack Energy App</div>
                    <div className="mega-promo-desc">Track your hourly energy consumption and save up to £200 extra per year.</div>
                  </div>
                  <Link href="/dashboard?tab=utrack" className="mega-promo-btn" style={{ background: '#0a192f' }}>Launch NexTrack</Link>
                </div>
              </div>
            </div>

            {/* Card Machines Mega Menu */}
            <div 
              className="nav-item"
              onMouseEnter={() => handleMouseEnter('card-machines')}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                href="/card-machines" 
                className={`nav-link ${activeMenu === 'card-machines' ? 'active-hover' : ''} ${pathname.startsWith('/card-machines') ? 'active' : ''}`}
              >
                Card Machines <ChevronDown size={14} className={`chevron-icon ${activeMenu === 'card-machines' ? 'rotate-180' : ''}`} />
              </Link>
              <div 
                className={`mega-menu ${activeMenu === 'card-machines' ? 'is-open' : ''}`}
                onMouseEnter={() => handleMouseEnter('card-machines')}
                onMouseLeave={handleMouseLeave}
              >
                <div>
                  <div className="mega-column-title">Card Terminals</div>
                  <div className="mega-link-list">
                    <Link href="/card-machines" className="mega-link-item">
                      <div className="mega-icon-box"><CreditCard size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Countertop Terminals</span>
                        <span className="mega-link-desc">Fast, reliable retail checkout</span>
                      </div>
                    </Link>
                    <Link href="/card-machines" className="mega-link-item">
                      <div className="mega-icon-box"><CreditCard size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Portable & Mobile Readers</span>
                        <span className="mega-link-desc">Wi-Fi & 4G on-the-go taking</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Merchant Solutions</div>
                  <div className="mega-link-list">
                    <Link href="/card-machines" className="mega-link-item">
                      <div className="mega-icon-box"><Sparkles size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Next-Day Payouts</span>
                        <span className="mega-link-desc">Faster business cashflow</span>
                      </div>
                    </Link>
                    <Link href="/card-machines" className="mega-link-item">
                      <div className="mega-icon-box"><CreditCard size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Virtual POS & Terminals</span>
                        <span className="mega-link-desc">Take phone & online payments</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="mega-promo-box">
                  <div>
                    <div className="mega-promo-title">Lowest UK Rates</div>
                    <div className="mega-promo-desc">Slash transaction fees from 0.29% + zero exit penalties.</div>
                  </div>
                  <Link href="/card-machines" className="mega-promo-btn">Compare Terminals</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            <Link href={user ? "/dashboard?tab=utrack" : "/login?redirect=/dashboard?tab=utrack"} className="btn-utrack">
              <span className="btn-utrack-dot"></span>
              Utrack
            </Link>

            {user ? (
              <div className="profile-menu-container">
                <button className="profile-btn">
                  <User size={16} />
                  <span>Hi, {user.firstName}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="profile-dropdown-box">
                  <Link href="/dashboard" className="profile-dropdown-item">
                    <LayoutDashboard size={16} />
                    Saved Deals & Dashboard
                  </Link>
                  <button onClick={handleLogout} className="profile-dropdown-item" style={{ width: '100%', color: '#ef4444' }}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-sign-in">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="mobile-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-links">
              <Link 
                href="/broadband" 
                className={`mobile-nav-link ${pathname.startsWith('/broadband') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-nav-link-left">
                  <div className="mobile-icon-box" style={{ color: '#00b050', background: 'rgba(0,176,80,0.1)' }}>
                    <Wifi size={18} />
                  </div>
                  <span>Broadband & TV</span>
                </div>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </Link>

              <Link 
                href="/energy" 
                className={`mobile-nav-link ${pathname.startsWith('/energy') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-nav-link-left">
                  <div className="mobile-icon-box" style={{ color: '#eab308', background: 'rgba(234,179,8,0.1)' }}>
                    <Zap size={18} />
                  </div>
                  <span>Gas & Electricity</span>
                </div>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </Link>

              <Link 
                href="/card-machines" 
                className={`mobile-nav-link ${pathname.startsWith('/card-machines') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-nav-link-left">
                  <div className="mobile-icon-box" style={{ color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}>
                    <CreditCard size={18} />
                  </div>
                  <span>Card Machines & POS</span>
                </div>
                <ChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: '#94a3b8' }} />
              </Link>
            </div>

            <div className="mobile-nav-footer">
              <Link 
                href={user ? "/dashboard?tab=utrack" : "/login?redirect=/dashboard?tab=utrack"} 
                className="mobile-btn-utrack"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="btn-utrack-dot"></span>
                Utrack Live Tracker
              </Link>

              {user ? (
                <div className="mobile-user-row">
                  <Link 
                    href="/dashboard" 
                    className="mobile-user-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} /> Hi, {user.firstName}
                  </Link>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="mobile-btn-signin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
