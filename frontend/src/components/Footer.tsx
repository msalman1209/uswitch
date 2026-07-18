import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2>U<span>switch</span></h2>
            <p>
              Uswitch is an independent, free-to-use online comparison service that helps you compare prices on gas, electricity, broadband, mobile phones, insurance, and personal finance products.
            </p>
          </div>
          
          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link href="/energy">Energy Comparison</Link></li>
              <li><Link href="/broadband">Broadband & TV</Link></li>
              <li><Link href="#">SIM Only Deals</Link></li>
              <li><Link href="#">Mobile Handsets</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>About Us</h4>
            <ul>
              <li><Link href="#">Who We Are</Link></li>
              <li><Link href="#">How We Make Money</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Help & FAQs</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Contact & Info</h4>
            <ul>
              <li><Link href="#">Contact Support</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Use</Link></li>
              <li><Link href="#">Cookie Preferences</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Uswitch Limited. All rights reserved. Registered in England and Wales.</p>
          <div className="footer-legal-links">
            <Link href="#">Accessibility</Link>
            <Link href="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
