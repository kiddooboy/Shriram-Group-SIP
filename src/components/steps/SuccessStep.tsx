'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Calendar } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function SuccessStep() {
  const { employee, selectedFundId, selectedGoal, tunedSIPAmount, reset } = useSIPStore()
  const [burst, setBurst] = useState(true)

  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  const amount = tunedSIPAmount || 500

  // Horizon and projections
  const returnRate = fund.threeYearReturn || 11.0
  const r = (returnRate / 100) / 12
  const years = 30
  const months = years * 12
  const fv = amount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const projectedLakhs = Math.round(fv / 100000)

  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + 1, 1)

  useEffect(() => {
    const t = setTimeout(() => setBurst(false), 3000)
    return () => clearTimeout(t)
  }, [])

  const milestones = [
    { pct: '25%', year: '7 yr', amt: `₹${Math.round(projectedLakhs * 0.18)} Lakh` },
    { pct: '50%', year: '15 yr', amt: `₹${Math.round(projectedLakhs * 0.45)} Lakh` },
    { pct: '100%', year: '30 yr', amt: `₹${projectedLakhs} Lakh` },
  ]

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Dynamic ambient background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-smf-teal-light rounded-full blur-[100px] pointer-events-none opacity-60" />

      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 justify-between overflow-y-auto">
        
        {/* Animated Checkmark and Success greeting */}
        <div className="flex flex-col items-center text-center mt-4">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative mb-5"
          >
            {burst && [...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i % 2 ? '#B5731B' : '#0B5C47', top: '50%', left: '50%' }}
                animate={{
                  x: Math.cos((i / 10) * 6.28) * 80,
                  y: Math.sin((i / 10) * 6.28) * 80,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 1.2, delay: 0.1 + i * 0.03 }}
              />
            ))}
            <div className="w-22 h-22 rounded-full bg-smf-teal-light border border-smf-teal flex items-center justify-center shadow-sm">
              <Check className="w-10 h-10 text-smf-teal" strokeWidth={3} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[26px] font-bold text-smf-teal-dark font-display leading-tight"
          >
            You're in, {employee?.name ? employee.name.split(' ')[0] : 'Rajesh'}.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-smf-muted text-[13px] mt-1 font-body"
          >
            First investment on the 1st of next month.
          </motion.p>
        </div>

        {/* Dynamic SIP and Projection card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-smf-teal-dark text-white rounded-[22px] p-6 mt-6 shadow-sm relative overflow-hidden text-left"
        >
          <div className="text-[12px] text-white/70 font-semibold uppercase tracking-wider font-body">
            On track for
          </div>
          <div className="text-[34px] font-extrabold font-display leading-none mt-1">
            ≈ ₹{projectedLakhs} lakh <span className="text-white/60 text-base font-normal">by 60</span>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 font-body">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-[12px]">
              First auto-debit · {nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* Milestone Tracker Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="cred-card p-5 mt-4 bg-white border border-smf-line shadow-sm"
        >
          <div className="text-smf-muted text-[10.5px] font-bold uppercase tracking-wider mb-4">
            Your wealth milestones
          </div>

          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 font-body">
                <div className="w-10 h-10 rounded-xl bg-smf-teal-light flex items-center justify-center shrink-0 border border-smf-teal/10">
                  <span className="text-smf-teal text-[11px] font-extrabold">{m.pct}</span>
                </div>
                
                <div className="flex-1">
                  <div className="h-1.5 bg-smf-line rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-smf-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: m.pct }}
                      transition={{ delay: 0.7 + i * 0.15, duration: 0.8 }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-smf-teal-dark text-[13px] font-bold font-display">{m.amt}</div>
                  <div className="text-smf-muted text-[10.5px]">{m.year} marks</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA and Replay link */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-8 space-y-4"
        >
          <button
            onClick={() => alert('Invite link shared via WhatsApp deep link!')}
            className="cred-btn shadow-md font-body text-[14.5px] py-4 bg-smf-teal text-white hover:bg-smf-teal-dark"
          >
            Invite a colleague
          </button>

          <div className="text-center">
            <button
              onClick={reset}
              className="text-smf-muted text-[12.5px] font-bold hover:text-smf-teal underline leading-none"
            >
              Replay from start
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
