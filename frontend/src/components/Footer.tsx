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
              U<span>switch</span>
            </Link>
            <p className="footer-desc">
              Uswitch is an independent online comparison service helping millions of UK households save money on energy, broadband, mobile phones, insurance, and personal finance products.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#00b050', fontWeight: '700' }}>
                ✓ Ofgem Confidence Code Accredited
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', fontWeight: '700' }}>
                ★ Trustpilot 4.5/5
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

          {/* Column 2: Broadband & Mobile */}
          <div>
            <div className="footer-title">Broadband & Mobile</div>
            <ul className="footer-links">
              <li><Link href="/broadband">Fibre Broadband Deals</Link></li>
              <li><Link href="/broadband">Broadband & TV Bundles</Link></li>
              <li><Link href="/sim-only">SIM Only Contracts</Link></li>
              <li><Link href="/mobile-phones">iPhone 16 Deals</Link></li>
              <li><Link href="/broadband">Broadband Speed Test</Link></li>
            </ul>
          </div>

          {/* Column 3: Finance & Insurance */}
          <div>
            <div className="footer-title">Finance & Insurance</div>
            <ul className="footer-links">
              <li><Link href="/insurance">Car Insurance</Link></li>
              <li><Link href="/insurance">Home Insurance</Link></li>
              <li><Link href="/banking">0% Credit Cards</Link></li>
              <li><Link href="/banking">Personal Loans</Link></li>
              <li><Link href="/banking">Mortgage Rates</Link></li>
            </ul>
          </div>

          {/* Column 4: About Uswitch */}
          <div>
            <div className="footer-title">Company</div>
            <ul className="footer-links">
              <li><Link href="#">About Uswitch</Link></li>
              <li><Link href="#">How We Make Money</Link></li>
              <li><Link href="#">Press & Media</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Customer Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Uswitch Limited. All rights reserved. Registered in England & Wales (No. 03612689). Authorized and regulated by the Financial Conduct Authority (FCA).
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Use</Link>
            <Link href="#">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
