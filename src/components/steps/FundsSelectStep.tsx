'use client'

import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function FundsSelectStep() {
  const { setSelectedFundId, setAdjustedFund, setStep } = useSIPStore()

  // Match the core 3 funds from the typescript universe
  const smaf = SHRIRAM_FUNDS.find(f => f.id === 'SMAF')!
  const sels = SHRIRAM_FUNDS.find(f => f.id === 'SELS')!
  const sfc = SHRIRAM_FUNDS.find(f => f.id === 'SFC')!

  const curatedFunds = [
    {
      fund: smaf,
      badge: 'Best fit for you',
      why: 'Grows your money across equity, debt and gold — steadier ride for a first-timer.',
      chips: ['Moderate risk', 'All-weather growth'],
      riskColorClass: 'bg-emerald-50 text-smf-teal border-smf-teal/10',
      potential: '≈ ₹14 lakh',
    },
    {
      fund: sels,
      why: 'Save tax under Section 80C while your money grows in equity. 3-year lock-in.',
      chips: ['Moderately high', 'Tax saving'],
      riskColorClass: 'bg-amber-50 text-smf-amber border-smf-amber/10',
      potential: '≈ ₹16 lakh',
    },
    {
      fund: sfc,
      why: 'Pure equity across large, mid and small companies — for long-term wealth.',
      chips: ['High risk', 'Max growth'],
      riskColorClass: 'bg-red-50 text-red-700 border-red-100',
      potential: '≈ ₹18 lakh',
    },
  ]

  function handleSelect(fundId: string, fundObj: any) {
    setSelectedFundId(fundId)
    setAdjustedFund(fundObj)
    setStep('intent-captured')
  }

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Scrollable container */}
      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <span className="text-smf-teal font-bold text-xs uppercase tracking-[0.15em] font-body block mb-1">
            Picked for you · AI-ranked
          </span>
          <h2 className="text-[26px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight">
            Choose a fund. One click.
          </h2>
          <p className="text-smf-muted text-[13px] leading-relaxed mt-2 font-body">
            No jargon, no long forms. Tap "Start" and you're in — we sort the paperwork next.
          </p>
        </motion.div>

        {/* Curated Cards */}
        <div className="space-y-5">
          {curatedFunds.map((item, idx) => {
            const isTop = idx === 0
            return (
              <motion.div
                key={item.fund.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                onClick={() => handleSelect(item.fund.id, item.fund)}
                className={`bg-white border rounded-[22px] p-5 cursor-pointer relative transition-all duration-200 hover:-translate-y-[2px] ${
                  isTop 
                    ? 'border-smf-teal shadow-[0_8px_24px_rgba(7,61,47,0.06)]' 
                    : 'border-smf-line shadow-sm hover:border-smf-teal/40'
                }`}
              >
                {/* Ranking Tag */}
                {item.badge && (
                  <span className="absolute -top-3.5 left-5 bg-smf-teal text-white text-[9.5px] font-extrabold uppercase tracking-[0.1em] px-3.5 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* Fund Name */}
                <h3 className="text-[17px] font-bold text-smf-teal-dark font-display tracking-tight mb-1">
                  {item.fund.name}
                </h3>

                {/* AISuitability explanation */}
                <p className="text-smf-muted text-[13px] leading-relaxed mb-3 font-body">
                  {item.why}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 mb-3.5">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${item.riskColorClass}`}>
                    {item.chips[0]}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200/50">
                    {item.chips[1]}
                  </span>
                </div>

                {/* Projection block */}
                <div className="text-[12.5px] text-smf-muted mb-4 font-body">
                  ₹500/mo could become <b className="text-smf-teal-dark font-display text-base font-extrabold">{item.potential}</b> by age 60
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(item.fund.id, item.fund)
                  }}
                  className="w-full bg-smf-teal text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors hover:bg-smf-teal-dark text-[13.5px]"
                >
                  Start SIP in one click
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Footnote */}
        <p className="text-smf-muted text-[11px] leading-relaxed text-center mt-6 font-body">
          Projections assume a 30-year holding period with an indicative 11% annualized return, adjusted to Indian inflation targets. Under SEBI regulations, past performance does not guarantee future results.
        </p>
      </div>
    </div>
  )
}
