'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Wifi, Zap, Smartphone, ShieldCheck, Landmark, ChevronDown, 
  User, LogOut, LayoutDashboard, Flame, Sun, Tv, CreditCard, 
  Car, Home, HeartPulse, Plane, Gauge, Sparkles, Menu, X, ArrowRight, Star
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('uswitch_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('uswitch_user');
      }
    }
  }, [pathname]);

  const handleLogout = () => {
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
            U<span>switch</span>
            <span className="logo-badge">UK</span>
          </Link>

          {/* Desktop Navigation with Mega-Menus */}
          <div className="nav-menu">
            {/* Broadband Mega Menu */}
            <div className="nav-item">
              <Link href="/broadband" className={`nav-link ${pathname.startsWith('/broadband') ? 'active' : ''}`}>
                Broadband & TV <ChevronDown size={14} className="chevron-icon" />
              </Link>
              <div className="mega-menu">
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
            <div className="nav-item">
              <Link href="/energy" className={`nav-link ${pathname.startsWith('/energy') ? 'active' : ''}`}>
                Energy <ChevronDown size={14} className="chevron-icon" />
              </Link>
              <div className="mega-menu">
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
                    <div className="mega-promo-title">Utrack Energy App</div>
                    <div className="mega-promo-desc">Track your hourly energy consumption and save up to £200 extra per year.</div>
                  </div>
                  <Link href="/dashboard?tab=utrack" className="mega-promo-btn" style={{ background: '#0a192f' }}>Launch Utrack</Link>
                </div>
              </div>
            </div>



            {/* Insurance Mega Menu */}
            <div className="nav-item">
              <Link href="/insurance" className={`nav-link ${pathname.startsWith('/insurance') ? 'active' : ''}`}>
                Insurance <ChevronDown size={14} className="chevron-icon" />
              </Link>
              <div className="mega-menu">
                <div>
                  <div className="mega-column-title">Popular Insurance</div>
                  <div className="mega-link-list">
                    <Link href="/insurance" className="mega-link-item">
                      <div className="mega-icon-box"><Car size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Car Insurance</span>
                        <span className="mega-link-desc">Save up to £319</span>
                      </div>
                    </Link>
                    <Link href="/insurance" className="mega-link-item">
                      <div className="mega-icon-box"><Home size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Home Insurance</span>
                        <span className="mega-link-desc">Buildings & contents</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">More Insurance</div>
                  <div className="mega-link-list">
                    <Link href="/insurance" className="mega-link-item">
                      <div className="mega-icon-box"><HeartPulse size={16} /></div>
                      <div className="mega-link-text"><span className="mega-link-title">Pet & Health Insurance</span></div>
                    </Link>
                    <Link href="/insurance" className="mega-link-item">
                      <div className="mega-icon-box"><Plane size={16} /></div>
                      <div className="mega-link-text"><span className="mega-link-title">Travel Cover</span></div>
                    </Link>
                  </div>
                </div>

                <div className="mega-promo-box">
                  <div>
                    <div className="mega-promo-title">Quick Quote</div>
                    <div className="mega-promo-desc">Compare 100+ insurance providers in 2 minutes.</div>
                  </div>
                  <Link href="/insurance" className="mega-promo-btn">Get Quotes</Link>
                </div>
              </div>
            </div>

            {/* Banking Mega Menu */}
            <div className="nav-item">
              <Link href="/banking" className={`nav-link ${pathname.startsWith('/banking') ? 'active' : ''}`}>
                Banking <ChevronDown size={14} className="chevron-icon" />
              </Link>
              <div className="mega-menu">
                <div>
                  <div className="mega-column-title">Personal Finance</div>
                  <div className="mega-link-list">
                    <Link href="/banking" className="mega-link-item">
                      <div className="mega-icon-box"><CreditCard size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Credit Cards</span>
                        <span className="mega-link-desc">0% Balance Transfer</span>
                      </div>
                    </Link>
                    <Link href="/banking" className="mega-link-item">
                      <div className="mega-icon-box"><Landmark size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Personal Loans</span>
                        <span className="mega-link-desc">Low interest rates</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="mega-column-title">Merchant & Home Loans</div>
                  <div className="mega-link-list">
                    <Link href="/banking" className="mega-link-item">
                      <div className="mega-icon-box"><CreditCard size={16} /></div>
                      <div className="mega-link-text">
                        <span className="mega-link-title">Card Machines & Terminals</span>
                        <span className="mega-link-desc">Stripe, Zettle & Worldpay</span>
                      </div>
                    </Link>
                    <Link href="/banking" className="mega-link-item">
                      <div className="mega-link-text"><span className="mega-link-title">Mortgages & Remortgage</span></div>
                    </Link>
                  </div>
                </div>

                <div className="mega-promo-box">
                  <div>
                    <div className="mega-promo-title">Credit Check</div>
                    <div className="mega-promo-desc">Check your card eligibility without affecting your credit score.</div>
                  </div>
                  <Link href="/banking" className="mega-promo-btn">Compare Cards</Link>
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
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
