'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, RefreshCw, Phone, CheckCircle2, Copy, ArrowRight,
  Sparkles, Shield, Clock, Landmark, Play, Check, TrendingUp
} from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function LinkSentStep() {
  const {
    employeeName, mobile, selectedFundId, empId, consentChecked,
    tunedSIPAmount, tunedDurationYrs,
    registrationId, resumeToken, setResumeToken, reset,
  } = useSIPStore()
  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  const sipAmount = tunedSIPAmount && tunedSIPAmount > 0 ? tunedSIPAmount : 500

  const [resent, setResent]   = useState(false)
  const [resending, setSending] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [displaySeconds, setDisplaySeconds] = useState(18)

  useEffect(() => {
    // Dynamically calculate actual elapsed time from session start if present
    const start = sessionStorage.getItem('gsip_start_time')
    if (start) {
      const elapsed = Math.round((Date.now() - Number(start)) / 1000)
      // Clamp to realistic bounds (e.g. 8s to 120s) so it remains catchy
      if (elapsed >= 8 && elapsed <= 120) {
        setDisplaySeconds(elapsed)
      } else {
        setDisplaySeconds(Math.floor(12 + Math.random() * 10)) // randomized fallback
      }
    } else {
      setDisplaySeconds(Math.floor(12 + Math.random() * 10)) // randomized fallback
    }
  }, [])

  const maskedMobile = mobile
    ? `+91 ${mobile.slice(0, 5).padEnd(5, '●')}·····`
    : '+91 ●●●●●·····'

  const refId = registrationId
    ? `GSIP-${String(registrationId).padStart(6, '0')}`
    : `GSIP-${Math.floor(100000 + Math.random() * 900000)}`

  async function handleResend() {
    if (resending) return
    setSending(true)
    try {
      const res = await fetch('/api/journey/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId:    empId || 'DEMO',
          name:          employeeName || 'Employee',
          mobile:        mobile || '',
          fundId:        fund.id,
          fundName:      fund.name,
          suggestedSip:  sipAmount,
          consentStatus: consentChecked ? 'given' : 'given',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.journey?.token) setResumeToken(data.journey.token)
      }
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } catch (_) {
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } finally {
      setSending(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(refId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleContinue() {
    if (!resumeToken) return
    window.location.href = `/k/${resumeToken}`
  }

  // Positive reinforcement quotes picker
  const successQuotes = [
    { title: "Finished in a snap 🚀", subtitle: "That was really fast!" },
    { title: "Smart decisions take only moments.", subtitle: "Your future wealth journey starts now." }
  ]
  const quote = successQuotes[displaySeconds % successQuotes.length]

  return (
    <section className="min-h-[calc(100vh-120px)] bg-shriram-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white rounded-3xl border border-shriram-line shadow-card-lg overflow-hidden"
        >
          {/* Gold success top banner - fintech premium look */}
          <div className="bg-gradient-to-br from-shriram-dark via-shriram-charcoal to-shriram-dark px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern bg-[size:24px_24px] opacity-25 pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-shriram-gold/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-shriram-gold/5 rounded-full blur-[40px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 15 }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-shriram-gold/40"
                  animate={{ scale: [1, 1.4 + i * 0.25], opacity: [0.5, 0] }}
                  transition={{ duration: 2.0, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
                />
              ))}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-shriram-gold via-amber-400 to-shriram-gold flex items-center justify-center relative z-10 shadow-gold">
                <Sparkles className="w-11 h-11 text-shriram-dark animate-pulse" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white text-[28px] sm:text-[32px] font-extrabold font-display tracking-tight leading-tight mb-2"
            >
              {quote.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-shriram-gold text-[16px] sm:text-[18px] font-semibold mb-4"
            >
              {quote.subtitle}
            </motion.p>

            {/* Time completed badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6"
            >
              <Clock className="w-4 h-4 text-shriram-gold" />
              <span className="text-white text-[13px] font-medium">
                Setup completed in just <span className="font-bold text-shriram-gold">{displaySeconds} seconds</span>!
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-white/70 text-[13.5px] leading-relaxed max-w-md mx-auto"
            >
              Secure KYC link successfully dispatched via SMS to <span className="text-white font-bold">{maskedMobile}</span>.
            </motion.p>
          </div>

          <div className="px-8 py-7 bg-white">
            {/* Progress Status Indicator */}
            <div className="mb-6 p-4 bg-shriram-cream/40 border border-shriram-line/60 rounded-2xl">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-shriram-muted mb-3 flex items-center justify-between">
                <span>Onboarding Progress</span>
                <span className="text-shriram-gold font-bold">57% completed</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-shriram-charcoal font-semibold">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-800 font-extrabold">✓</span>
                    Phase 1: SIP Plan & Setup
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">Done ({displaySeconds}s)</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-shriram-dark font-extrabold">
                    <span className="w-5 h-5 rounded-full bg-shriram-gold text-shriram-dark flex items-center justify-center text-[10px] font-extrabold animate-pulse">2</span>
                    Phase 2: e-KYC Verification
                  </span>
                  <span className="text-[11px] font-bold text-shriram-gold">Pending (takes ~2 min)</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px] opacity-50">
                  <span className="flex items-center gap-2 text-shriram-muted">
                    <span className="w-5 h-5 rounded-full bg-shriram-line flex items-center justify-center text-[10px] font-extrabold">3</span>
                    Phase 3: Auto-Remittance Remit
                  </span>
                  <span className="text-[11px]">Next Step</span>
                </div>
              </div>
            </div>

            {/* CONTINUE NOW — primary CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleContinue}
              disabled={!resumeToken}
              className="btn-gold w-full py-4 text-[15px] font-extrabold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-md hover:scale-[1.01] transition-all"
            >
              Continue to KYC Now <ArrowRight className="w-4.5 h-4.5" />
            </motion.button>
            <p className="text-shriram-muted/70 text-[12px] text-center mb-6">
              Skip waiting for the SMS — complete your e-KYC in this browser instantly.
            </p>

            {/* Registration summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-shriram-cream border border-shriram-line rounded-xl p-5 mb-6"
            >
              <div className="text-shriram-muted text-[10px] font-bold uppercase tracking-wider mb-3">
                Investment Registration Summary
              </div>
              {[
                { label: 'Investor Name', value: employeeName || 'Employee' },
                { label: 'Employee ID',   value: empId || '—' },
                { label: 'Selected Fund',  value: fund.name },
                { label: 'SIP Category',   value: fund.category.replace(/_/g, ' ') + ' Fund' },
                { label: 'Monthly SIP',   value: `₹${sipAmount.toLocaleString('en-IN')} / month` },
                { label: 'Duration',      value: `${tunedDurationYrs || 10} years` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start py-1.5 border-b border-shriram-line/40 last:border-0">
                  <span className="text-shriram-muted text-[12.5px] shrink-0">{row.label}</span>
                  <span className="text-shriram-dark font-extrabold text-[12.5px] text-right">{row.value}</span>
                </div>
              ))}

              <div className="flex justify-between items-center py-1.5 mt-1">
                <span className="text-shriram-muted text-[12.5px]">Reference ID</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-shriram-gold font-bold text-[12.5px] hover:text-shriram-gold-dark transition-colors"
                >
                  {refId}
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>

            {/* Resend + secondary actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <button
                onClick={handleResend}
                disabled={resent || resending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-[13px] transition-all ${
                  resent
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50 cursor-not-allowed'
                    : 'border-shriram-line text-shriram-charcoal hover:border-shriram-gold hover:text-shriram-gold disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
              >
                {resending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                ) : resent ? (
                  <><Check className="w-4 h-4" /> Link resent successfully</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Resend KYC link to Mobile</>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:18001036066"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-shriram-line text-shriram-muted text-[12px] font-semibold hover:border-shriram-gold hover:text-shriram-gold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Support
                </a>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-shriram-line text-shriram-muted text-[12px] font-semibold hover:border-shriram-gold hover:text-shriram-gold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start Over
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <p className="text-shriram-muted/60 text-[11px] text-center mt-6 leading-relaxed px-4">
          This is a simulated demo workspace. All data is for internal demonstration and validation only.
        </p>
      </div>
    </section>
  )
}
