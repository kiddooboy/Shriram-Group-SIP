'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'
import { generateRecommendation } from '@/lib/ai-engine'

export default function TunedPlanStep() {
  const { 
    employee, 
    questionnaire, 
    selectedFundId, 
    selectedGoal, 
    tunedSIPAmount,
    setTunedSIPAmount,
    setAdjustedSIP,
    setAdjustedTenure,
    setAdjustedFund,
    setRecommendation,
    goNext 
  } = useSIPStore()

  // Find the selected fund, default to SMAF
  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  
  // Sized amount state
  const [amount, setAmount] = useState(tunedSIPAmount || 500)

  // Dynamic calculations
  const returnRate = fund.threeYearReturn || 11.0
  const r = (returnRate / 100) / 12
  const years = 30 // standard 30 year horizon for retirement or long term wealth
  const months = years * 12
  const fv = amount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const projectedLakhs = Math.round(fv / 100000)

  useEffect(() => {
    // Generate the recommendation using the store state to ensure internal data is synced
    if (employee) {
      const rec = generateRecommendation(employee, questionnaire)
      setRecommendation(rec)
    }
  }, [employee, questionnaire, setRecommendation])

  function handleSliderChange(val: number) {
    setAmount(val)
    setTunedSIPAmount(val)
  }

  function handleContinue() {
    setAdjustedSIP(amount)
    setAdjustedTenure(months)
    setAdjustedFund(fund)
    goNext()
  }

  // Goal name formatted for display
  const goalLabelMap: Record<string, string> = {
    EMERGENCY: 'emergency corpus',
    BIG_PURCHASE: 'wealth creation',
    HOME: 'tax saving',
    CHILD_FUTURE: 'child education',
    RETIREMENT: 'retirement planning',
  }
  const displayGoal = goalLabelMap[selectedGoal || ''] || 'wealth creation'

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Scrollable Container */}
      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto justify-between">
        
        {/* Top Text */}
        <div>
          <span className="text-smf-amber font-bold text-xs uppercase tracking-[0.15em] font-body block mb-1">
            Phase 2 · Step 2 of 4
          </span>
          <h2 className="text-[26px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight">
            Here's your tuned plan
          </h2>

          <div className="inline-flex items-center gap-1.5 bg-smf-teal-light text-smf-teal-dark text-[11.5px] font-bold px-3 py-1.5 rounded-full mt-3 border border-smf-teal/15 font-body">
            ⚡ AI-recommended for <span className="underline decoration-dotted">{displayGoal}</span>
          </div>

          {/* Sizer Card */}
          <div className="cred-card p-6 mt-5 bg-white border border-smf-line shadow-sm relative overflow-hidden">
            <div className="text-center mb-1">
              <span className="text-[36px] font-extrabold text-smf-teal-dark font-display tracking-tightest leading-none">
                ₹{amount.toLocaleString('en-IN')}
              </span>
              <span className="text-smf-muted text-[13.5px] font-semibold font-body"> / month</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={amount}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-1.5 bg-smf-line rounded-lg appearance-none cursor-pointer accent-smf-teal mt-4 mb-2 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-smf-muted font-bold font-body">
              <span>₹500</span>
              <span>₹10,000</span>
            </div>

            {/* Details Rows */}
            <div className="mt-5 space-y-3 pt-4 border-t border-smf-line/60">
              <div className="flex justify-between items-center text-[13px] font-body">
                <span className="text-smf-muted">Fund</span>
                <span className="text-smf-teal-dark font-bold font-display">{fund.shortName}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] font-body">
                <span className="text-smf-muted">Suggested tenure</span>
                <span className="text-smf-teal-dark font-bold font-display">Till retirement (≈ {years} yrs)</span>
              </div>
              <div className="flex justify-between items-center text-[13px] font-body">
                <span className="text-smf-muted">Funded by</span>
                <span className="text-smf-teal font-extrabold font-display">Salary deduction</span>
              </div>
            </div>
          </div>

          {/* Projection Result Card */}
          <div className="bg-smf-teal-dark text-white rounded-[22px] p-5 mt-4 text-left shadow-sm relative overflow-hidden">
            {/* background circle decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-smf-teal rounded-full opacity-10" />

            <div className="text-[12.5px] text-white/70 font-semibold uppercase tracking-wider font-body">
              Projected corpus at age 60
            </div>
            <div className="text-[28px] font-extrabold font-display leading-none mt-1.5">
              ≈ ₹{projectedLakhs} lakh
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={handleContinue}
            className="cred-btn-accent shadow-md transition-transform"
          >
            Looks good — continue
          </button>
        </div>

      </div>
    </div>
  )
}
