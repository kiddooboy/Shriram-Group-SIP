'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function IntentCapturedStep() {
  const { selectedFundId, goNext, setStep } = useSIPStore()
  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Light radial glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-smf-teal-light rounded-full blur-[90px] pointer-events-none opacity-60" />

      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 justify-between">
        
        {/* Animated Checkmark and Title */}
        <div className="flex-1 flex flex-col justify-center text-center max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-smf-teal-light border-2 border-smf-teal flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-smf-teal" strokeWidth={3} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span className="text-smf-teal font-bold text-xs uppercase tracking-[0.15em] font-body block mb-2">
              Intent Captured
            </span>
            <h2 className="text-[25px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight mb-3">
              You're interested in <br />
              <span className="text-smf-teal italic font-extrabold">the {fund.shortName}</span>.
            </h2>
            <p className="text-smf-muted text-[13px] leading-relaxed font-body">
              That's Phase 1 done — in one click. Nothing has been debited yet. Finish setup whenever you like; it takes about 2 minutes.
            </p>
          </motion.div>

          {/* Provisional Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cred-card p-5 mt-6 bg-white border border-smf-line shadow-sm text-left relative overflow-hidden"
          >
            <div className="text-smf-muted text-[10.5px] font-bold uppercase tracking-wider mb-3">
              Your provisional plan
            </div>
            
            <div className="flex justify-between items-center py-1.5 border-b border-smf-line/60">
              <span className="text-smf-muted text-[12.5px] font-body">Fund</span>
              <span className="text-smf-teal-dark font-extrabold text-[13px] font-display">{fund.name}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-smf-muted text-[12.5px] font-body">Suggested SIP</span>
              <span className="text-smf-teal-dark font-extrabold text-[13.5px] font-display">₹500 / month</span>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons are now rendered globally by the parent footbar */}
        
      </div>
    </div>
  )
}
