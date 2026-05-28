'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, RefreshCw, Phone, CheckCircle2, Copy, ArrowRight,
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
    // Hard navigation so the KYC route mounts cleanly with the new tab/back-button semantics.
    window.location.href = `/k/${resumeToken}`
  }

  return (
    <section className="min-h-[calc(100vh-120px)] bg-shriram-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-shriram-line shadow-card-lg overflow-hidden"
        >
          {/* Gold success top banner */}
          <div className="bg-gradient-to-br from-shriram-dark to-shriram-charcoal px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern bg-[size:20px_20px] opacity-50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-shriram-gold/10 rounded-full blur-[60px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative w-20 h-20 mx-auto mb-5"
            >
              {[1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-shriram-gold/30"
                  animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                />
              ))}
              <div className="w-20 h-20 rounded-full bg-shriram-gold flex items-center justify-center relative z-10 shadow-gold">
                <MessageSquare className="w-9 h-9 text-shriram-dark" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-white text-[24px] font-bold font-display tracking-tight mb-2"
            >
              Your KYC link has been sent successfully.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-white/65 text-[13.5px] leading-relaxed"
            >
              A secure resume link has been sent to<br />
              <span className="text-shriram-gold font-bold">{maskedMobile}</span>.
              Open it on any device to finish KYC — or continue right now.
            </motion.p>
          </div>

          <div className="px-8 py-7">
            {/* What to expect */}
            <div className="space-y-4 mb-7">
              {[
                { label: 'Click the link in your SMS', desc: 'Valid for 48 hours from now.' },
                { label: 'Complete e-KYC (≈ 2 min)',    desc: 'Personal, PAN, Aadhaar, bank, nominee, uploads.' },
                { label: 'Salary deduction activates',  desc: 'First SIP on the 1st of next month.' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex gap-3 items-start"
                >
                  <CheckCircle2 className="w-5 h-5 text-shriram-gold shrink-0 mt-0.5" />
                  <div>
                    <div className="text-shriram-dark font-semibold text-[13.5px]">{s.label}</div>
                    <div className="text-shriram-muted text-[12.5px]">{s.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Registration summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-shriram-cream border border-shriram-line rounded-xl p-5 mb-6"
            >
              <div className="text-shriram-muted text-[10.5px] font-bold uppercase tracking-wider mb-3">
                Registration summary
              </div>
              {[
                { label: 'Name',          value: employeeName || 'Employee' },
                { label: 'Employee ID',   value: empId || '—' },
                { label: 'Fund',          value: fund.shortName },
                { label: 'Monthly SIP',   value: `₹${sipAmount.toLocaleString('en-IN')} / month` },
                { label: 'Duration',      value: `${tunedDurationYrs || 10} years` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-shriram-line/50 last:border-0">
                  <span className="text-shriram-muted text-[12.5px]">{row.label}</span>
                  <span className="text-shriram-dark font-bold text-[13px]">{row.value}</span>
                </div>
              ))}

              <div className="flex justify-between items-center py-1.5 mt-1">
                <span className="text-shriram-muted text-[12.5px]">Reference ID</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-shriram-gold font-bold text-[13px] hover:text-shriram-gold-dark transition-colors"
                >
                  {refId}
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </motion.div>

            {/* CONTINUE NOW — primary CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              onClick={handleContinue}
              disabled={!resumeToken}
              className="btn-gold w-full py-4 text-[15px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3"
            >
              Continue Now <ArrowRight className="w-4 h-4" />
            </motion.button>
            <p className="text-shriram-muted/70 text-[11.5px] text-center mb-5">
              Skip the SMS — finish your KYC right now in this browser.
            </p>

            {/* Resend + secondary actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <button
                onClick={handleResend}
                disabled={resent || resending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-[13.5px] transition-all ${
                  resent
                    ? 'border-smf-teal text-smf-teal bg-smf-teal/5 cursor-not-allowed'
                    : 'border-shriram-line text-shriram-charcoal hover:border-shriram-gold hover:text-shriram-gold disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
              >
                {resending ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                ) : resent ? (
                  <><CheckCircle2 className="w-4 h-4" /> Link resent successfully</>
                ) : (
                  <><RefreshCw className="w-4 h-4" /> Resend KYC link</>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:18001036066"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-shriram-line text-shriram-muted text-[12.5px] font-semibold hover:border-shriram-gold hover:text-shriram-gold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call support
                </a>
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-shriram-line text-shriram-muted text-[12.5px] font-semibold hover:border-shriram-gold hover:text-shriram-gold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start over
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <p className="text-shriram-muted/60 text-[11px] text-center mt-6 leading-relaxed px-4">
          This is a demo portal. Your data is stored securely for Shriram Group internal records only.
        </p>
      </div>
    </section>
  )
}
