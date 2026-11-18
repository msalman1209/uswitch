import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Accreditation */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Nex<span>Gen</span> <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Power Solutions</span>
            </Link>
            <p className="footer-desc">
              NexGen Power Solutions is an independent UK energy & utilities comparison broker helping homes and businesses save money on energy tariffs, smart meters, green power, and utility services.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#00b050', fontWeight: '700' }}>
                ✓ Ofgem Confidence Code Accredited
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', fontWeight: '700' }}>
                ★ Trustpilot 4.8/5
              </div>
            </div>
          </div>

          {/* Column 1: Energy */}
          <div>
            <div className="footer-title">Energy</div>
            <ul className="footer-links">
              <li><Link href="/energy">Gas & Electricity</Link></li>
              <li><Link href="/energy">Green Energy Tariffs</Link></li>
              <li><Link href="/energy">Solar Panel Installation</Link></li>
              <li><Link href="/energy">Boiler Cover & Quotes</Link></li>
              <li><Link href="/energy">Smart Meters Guide</Link></li>
            </ul>
          </div>

          {/* Column 2: Broadband */}
          <div>
            <div className="footer-title">Broadband</div>
            <ul className="footer-links">
              <li><Link href="/broadband">Fibre Broadband Deals</Link></li>
              <li><Link href="/broadband">Broadband & TV Bundles</Link></li>
              <li><Link href="/broadband">Broadband Speed Test</Link></li>
            </ul>
          </div>

          {/* Column 3: Card Machines */}
          <div>
            <div className="footer-title">Card Machines</div>
            <ul className="footer-links">
              <li><Link href="/card-machines">Countertop Card Terminals</Link></li>
              <li><Link href="/card-machines">Portable & Wi-Fi Machines</Link></li>
              <li><Link href="/card-machines">Mobile 4G Card Readers</Link></li>
              <li><Link href="/card-machines">Virtual POS & Phone Payments</Link></li>
              <li><Link href="/card-machines">Compare Merchant Fees</Link></li>
            </ul>
          </div>

          {/* Column 4: About NexGen */}
          <div>
            <div className="footer-title">Company</div>
            <ul className="footer-links">
              <li><Link href="/energy">About NexGen Power Solutions</Link></li>
              <li><Link href="/dashboard">Customer Support</Link></li>
              <li><Link href="/energy">Energy Guide & Help</Link></li>
              <li><Link href="/broadband">Broadband Guide</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} NexGen Power Solutions Ltd. All rights reserved. Registered in England & Wales. Ofgem Confidence Code Accredited. Partnered with Jellyfish Energy.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
