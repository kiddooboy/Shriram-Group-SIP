'use client'

import { Shield, Phone, Mail } from 'lucide-react'

const quickLinks = ['About Us', 'Careers', 'Contact Us', 'Privacy Policy', 'Disclaimer', 'SEBI Registration']
const fundLinks = ['Shriram Multi Asset Fund', 'Shriram ELSS Fund', 'Shriram Flexi Cap Fund', 'Shriram Aggressive Hybrid']

export default function SiteFooter() {
  return (
    <footer className="bg-shriram-dark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-shriram-gold flex items-center justify-center shrink-0">
              <span className="text-shriram-dark font-extrabold text-[13px]">SMF</span>
            </div>
            <div>
              <div className="text-white font-extrabold text-[15px] font-display">Shriram Asset Management</div>
              <div className="text-white/40 text-[9px] font-semibold uppercase tracking-[0.14em] mt-0.5">
                Nurturing Trust · Shaping Dreams
              </div>
            </div>
          </div>
          <p className="text-white/50 text-[12.5px] leading-relaxed max-w-xs">
            Shriram Asset Management Co. Ltd. is registered with SEBI as an Asset Management Company.
            CIN: U65991TN1994PLC028197. SEBI Registration No.: IMF/023/04.
          </p>
          <div className="flex items-center gap-5 mt-5">
            <a href="tel:18001036066" className="flex items-center gap-2 text-white/60 text-[12px] hover:text-shriram-gold transition-colors">
              <Phone className="w-3.5 h-3.5" /> 1800 103 6066
            </a>
            <a href="mailto:investors@shriramamt.com" className="flex items-center gap-2 text-white/60 text-[12px] hover:text-shriram-gold transition-colors">
              <Mail className="w-3.5 h-3.5" /> investors@shriramamt.com
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white/40 text-[10px] uppercase tracking-[0.16em] font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {quickLinks.map(l => (
              <li key={l}>
                <a href="#" className="text-white/65 text-[13px] hover:text-shriram-gold transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Fund links */}
        <div>
          <h4 className="text-white/40 text-[10px] uppercase tracking-[0.16em] font-bold mb-4">Our Funds</h4>
          <ul className="space-y-2.5">
            {fundLinks.map(l => (
              <li key={l}>
                <a href="#" className="text-white/65 text-[13px] hover:text-shriram-gold transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compliance bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-shriram-gold shrink-0 mt-0.5" />
            <p className="text-white/35 text-[11px] leading-relaxed">
              <strong className="text-white/50">Disclaimer:</strong> Mutual Fund investments are subject to market risks.
              Please read all scheme-related documents carefully before investing. Past performance is not indicative of future returns.
              This portal is for Shriram Group employee benefit registration only. Employee data is processed under applicable data
              protection regulations and Shriram Group's Privacy Policy. KYC is mandatory as per SEBI guidelines. Projections shown
              are illustrative and assume 11% annualized returns; not guaranteed.
            </p>
          </div>
          <div className="mt-4 text-white/25 text-[11px]">
            © {new Date().getFullYear()} Shriram Asset Management Co. Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
