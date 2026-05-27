'use client'

import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function ActivationStep() {
  const { employee, selectedFundId, selectedGoal, tunedSIPAmount, consentChecked, setConsentChecked } = useSIPStore()

  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  const amount = tunedSIPAmount || 500

  // Goal name formatting
  const goalLabelMap: Record<string, string> = {
    EMERGENCY: 'Emergency Corpus',
    BIG_PURCHASE: 'Wealth Creation',
    HOME: 'Tax Saving',
    CHILD_FUTURE: 'Child Education',
    RETIREMENT: 'Retirement Planning',
  }
  const displayGoal = goalLabelMap[selectedGoal || ''] || 'Wealth Creation'

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-smf-teal-light rounded-full blur-[100px] pointer-events-none opacity-60" />

      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 justify-between">
        
        <div>
          {/* Header */}
          <span className="text-smf-amber font-bold text-xs uppercase tracking-[0.15em] font-body block mb-1">
            Phase 2 · Step 4 of 4
          </span>
          <h2 className="text-[26px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight">
            Authorise &amp; activate
          </h2>
          <p className="text-smf-muted text-[13px] leading-relaxed mt-2 font-body">
            No bank mandate needed — it comes from your salary.
          </p>

          {/* Mandate Summary Card */}
          <div className="bg-white border border-smf-line rounded-[22px] p-5 mt-6 shadow-sm font-body">
            <div className="text-smf-muted text-[10.5px] font-bold uppercase tracking-wider mb-3">
              Salary deduction authorization
            </div>

            <div className="divide-y divide-smf-line/60">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-smf-muted text-[13px]">Amount</span>
                <span className="text-smf-teal-dark font-extrabold text-[14.5px] font-display">
                  ₹{amount.toLocaleString('en-IN')} / month
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2.5">
                <span className="text-smf-muted text-[13px]">Fund</span>
                <span className="text-smf-teal-dark font-bold text-[13.5px] font-display">
                  {fund.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-smf-muted text-[13px]">Goal</span>
                <span className="text-smf-teal-dark font-bold text-[13.5px] font-display">
                  {displayGoal}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-smf-muted text-[13px]">Source</span>
                <span className="text-smf-teal font-extrabold text-[13px]">
                  Monthly salary
                </span>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex gap-3 bg-white border border-smf-line rounded-2xl p-4 mt-4 shadow-sm cursor-pointer select-none font-body">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="w-5 h-5 accent-smf-teal mt-0.5 shrink-0"
            />
            <span className="text-smf-ink text-[12.5px] leading-relaxed">
              I authorise Shriram to deduct <b className="text-smf-teal-dark">₹{amount.toLocaleString('en-IN')}/month</b> from my salary and invest it on my behalf into the chosen fund.
            </span>
          </label>

          {/* Secure indicator */}
          <div className="flex items-center gap-2 mt-4 text-[11px] text-smf-muted font-body leading-none px-1">
            <ShieldCheck className="w-4 h-4 text-smf-teal" />
            <span>Securely processed under Shriram Group's Payroll Integration specs</span>
          </div>
        </div>

      </div>
    </div>
  )
}
