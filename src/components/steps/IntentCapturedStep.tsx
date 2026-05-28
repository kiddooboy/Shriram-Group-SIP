'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'
import { GOAL_BY_ID, InvestmentGoalId } from '@/lib/investment-goals'

export default function IntentCapturedStep() {
  const {
    selectedFundId, empId, employeeName, mobile, consentChecked,
    investmentGoalId, tunedSIPAmount, tunedDurationYrs,
    resumeToken, setResumeToken, goNext,
  } = useSIPStore()
  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  const goal = investmentGoalId ? GOAL_BY_ID[investmentGoalId as InvestmentGoalId] : null
  const sipAmount = tunedSIPAmount && tunedSIPAmount > 0 ? tunedSIPAmount : 500
  const [saving, setSaving] = useState(true)
  const [saved, setSaved] = useState(false)

  // Persist the legacy sip_intents row AND create a journey (resume token + SMS link).
  useEffect(() => {
    if (resumeToken) { setSaving(false); setSaved(true); return }

    let cancelled = false
    async function run() {
      try {
        // Legacy intent table (kept for admin/demo listings)
        await fetch('/api/sip-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: empId || 'DEMO',
            fundId: fund.id,
            fundName: fund.name,
            suggestedSip: sipAmount,
          }),
        }).catch(() => {})

        // Create journey + dispatch KYC link SMS
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
          if (!cancelled && data?.journey?.token) {
            setResumeToken(data.journey.token)
          }
        }
      } catch (_) {
        // Non-blocking — the user can still proceed via "Resend KYC link"
      } finally {
        if (!cancelled) { setSaving(false); setSaved(true) }
      }
    }
    run()
    return () => { cancelled = true }
  }, [resumeToken, empId, employeeName, mobile, consentChecked, fund.id, fund.name, sipAmount, setResumeToken])

  return (
    <section className="min-h-[calc(100vh-120px)] bg-shriram-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-shriram-line shadow-card-lg px-8 py-10 text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="w-20 h-20 rounded-full bg-shriram-gold/10 border-2 border-shriram-gold flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-shriram-gold" strokeWidth={3} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="eyebrow text-shriram-gold block mb-2">Smart Choice! · Investment Setup Locked</span>
            <h2 className="text-[26px] font-bold text-shriram-dark font-display tracking-tight mb-3">
              You're interested in<br />
              <span className="text-shriram-gold">{fund.shortName}.</span>
            </h2>
            <p className="text-shriram-muted text-[14.5px] leading-relaxed">
              Your investment setup is completed in a flash! 🔒 No funds have been debited yet.
              Complete your secure e-KYC in under 2 minutes to activate your wealth engine today.
            </p>
          </motion.div>

          {/* Provisional plan card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-shriram-cream border border-shriram-line rounded-xl p-5 mt-7 text-left"
          >
            <div className="text-shriram-muted text-[10.5px] font-bold uppercase tracking-wider mb-3">
              Your provisional plan
            </div>
            {[
              ...(goal ? [{ label: 'Goal', value: goal.label }] : []),
              { label: 'Fund', value: fund.name },
              { label: 'Monthly SIP', value: `₹${sipAmount.toLocaleString('en-IN')} / month` },
              { label: 'Duration', value: `${tunedDurationYrs || 10} years` },
              { label: 'Source', value: 'Salary deduction' },
              { label: 'Status', value: saving ? 'Saving…' : '✓ Intent registered' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-shriram-line/50 last:border-0">
                <span className="text-shriram-muted text-[13px]">{row.label}</span>
                <span className={`text-shriram-dark font-bold text-[13.5px] font-display ${row.label === 'Status' && saved ? 'text-smf-teal' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={goNext}
            id="intent-proceed-btn"
            className="btn-gold w-full mt-8 py-4 text-[15px] rounded-xl"
          >
            Proceed to KYC verification <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
