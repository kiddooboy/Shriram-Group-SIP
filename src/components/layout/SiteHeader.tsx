'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChevronDown, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Learn', sub: true },
  { label: 'Plan', sub: true },
  { label: 'Invest', sub: true },
  { label: 'Investor Corner', sub: true },
  { label: 'Distributor Corner', sub: true },
  { label: 'Shareholder Corner', sub: true },
]

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* ── Top utility bar ───────────────────────────────────────────── */}
      <div className="bg-shriram-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          {/* Left: Font size controls */}
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-[10px] font-medium hidden sm:block">Accessibility</span>
            <div className="flex items-center gap-1.5">
              {['A-', 'A', 'A+'].map((s) => (
                <button key={s} className="text-white/60 text-[11px] font-bold hover:text-shriram-gold transition-colors px-1">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Utility links */}
          <div className="flex items-center gap-4">
            {['About Us', 'Contact Us', 'Careers', 'PMS'].map((l) => (
              <a key={l} href="#" className="text-white/60 text-[11.5px] font-medium hover:text-white transition-colors hidden md:block">
                {l}
              </a>
            ))}
            <a
              href="#enroll"
              className="bg-shriram-gold text-shriram-dark text-[12px] font-extrabold px-4 py-1 rounded-md hover:bg-shriram-gold-dark transition-colors"
            >
              Enrol Now
            </a>
            <a href="tel:18001036066" className="text-white/60 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Main navbar ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-shriram-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[62px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-shriram-dark flex items-center justify-center shrink-0">
              <span className="text-shriram-gold font-extrabold text-[13px] leading-none">SMF</span>
            </div>
            <div>
              <div className="text-shriram-dark font-extrabold text-[15px] leading-tight tracking-tight font-display">
                Shriram Asset Management
              </div>
              <div className="text-shriram-muted text-[9px] font-semibold tracking-[0.14em] uppercase leading-none mt-0.5">
                Nurturing Trust · Shaping Dreams
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href="#"
                className="flex items-center gap-0.5 text-[13.5px] font-semibold text-shriram-charcoal hover:text-shriram-gold transition-colors"
              >
                {link.label}
                {link.sub && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-shriram-dark"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-shriram-line bg-white lg:hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href="#"
                    className="flex items-center justify-between py-2.5 text-[14px] font-semibold text-shriram-charcoal hover:text-shriram-gold border-b border-shriram-line/50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                    {link.sub && <ChevronDown className="w-4 h-4 opacity-50" />}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
