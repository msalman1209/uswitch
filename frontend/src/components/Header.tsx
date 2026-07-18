'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Settings, Zap, ArrowRightLeft } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);

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
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-logo">
          U<span>switch</span>
        </Link>

        <nav className="navbar-links">
          <Link href="/energy" className={`navbar-link ${pathname.startsWith('/energy') ? 'active' : ''}`}>
            Energy
          </Link>
          <Link href="/broadband" className={`navbar-link ${pathname.startsWith('/broadband') ? 'active' : ''}`}>
            Broadband & TV
          </Link>
          <Link href="/sim-only" className={`navbar-link ${pathname.startsWith('/sim-only') ? 'active' : ''}`}>
            SIM Only
          </Link>
          <Link href="/mobile-phones" className={`navbar-link ${pathname.startsWith('/mobile-phones') ? 'active' : ''}`}>
            Mobile Phones
          </Link>
        </nav>

        <div className="navbar-auth">
          {user ? (
            <div className="profile-dropdown-container">
              <div className="profile-dropdown-trigger">
                <User size={18} />
                <span>Hi, {user.firstName}</span>
              </div>
              <div className="profile-dropdown-menu">
                <Link href="/dashboard" className="profile-dropdown-item">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="profile-dropdown-divider"></div>
                <button onClick={handleLogout} className="profile-dropdown-item" style={{ width: '100%', textAlign: 'left' }}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="navbar-btn-login">
                Sign In
              </Link>
            </>
          )}
          <Link href={user ? "/dashboard?tab=utrack" : "/login?redirect=/dashboard?tab=utrack"} className="navbar-btn-utrack">
            Utrack
          </Link>
        </div>
      </div>
    </header>
  );
}
