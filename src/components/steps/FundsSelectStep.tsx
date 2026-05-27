'use client'

import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Shield } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

export default function FundsSelectStep() {
  const { setSelectedFundId, setAdjustedFund, setStep, employeeName } = useSIPStore()

  const smaf = SHRIRAM_FUNDS.find(f => f.id === 'SMAF')!
  const sels = SHRIRAM_FUNDS.find(f => f.id === 'SELS')!
  const sfc  = SHRIRAM_FUNDS.find(f => f.id === 'SFC')!

  const curatedFunds = [
    {
      fund: smaf,
      badge: 'Best fit · AI ranked',
      why: 'Grows your money across equity, debt and gold — steadier ride for a first-timer.',
      chips: [{ label: 'Moderate risk', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
      potential: '≈ ₹14 lakh',
      color: 'border-shriram-gold shadow-gold',
      btnCls: 'btn-gold',
      featured: true,
    },
    {
      fund: sels,
      badge: null,
      why: 'Save tax under Section 80C while your money grows in equity. 3-year lock-in.',
      chips: [{ label: 'Moderately high', cls: 'bg-amber-50 text-amber-700 border-amber-200' }],
      potential: '≈ ₹16 lakh',
      color: 'border-shriram-line hover:border-shriram-gold/40',
      btnCls: 'btn-outline',
      featured: false,
    },
    {
      fund: sfc,
      badge: null,
      why: 'Pure equity across large, mid and small companies — for long-term wealth.',
      chips: [{ label: 'High risk', cls: 'bg-red-50 text-red-700 border-red-200' }],
      potential: '≈ ₹18 lakh',
      color: 'border-shriram-line hover:border-shriram-gold/40',
      btnCls: 'btn-outline',
      featured: false,
    },
  ]

  function handleSelect(fundId: string, fundObj: any) {
    setSelectedFundId(fundId)
    setAdjustedFund(fundObj)
    setStep('intent-captured')
  }

  return (
    <section className="min-h-[calc(100vh-120px)] bg-shriram-cream py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="eyebrow">Phase 1 · Fund Selection</span>
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold text-shriram-dark font-display tracking-tight mt-3 mb-3">
            Choose a fund. One click.
          </h2>
          <p className="text-shriram-muted text-[15px] leading-relaxed max-w-xl mx-auto">
            {employeeName ? `Hi ${employeeName.split(' ')[0]}, w` : 'W'}e've curated 3 funds suited to Shriram Group employees.
            No jargon — tap "Start SIP" and you're in.
          </p>
        </motion.div>

        {/* Fund cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {curatedFunds.map((item, idx) => (
            <motion.div
              key={item.fund.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-2xl border-2 ${item.color} shadow-card p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg`}
            >
              {/* Top badge */}
              {item.badge && (
                <span className="absolute -top-3.5 left-5 bg-shriram-gold text-shriram-dark text-[10px] font-extrabold uppercase tracking-[0.1em] px-3 py-1 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}

              {/* Fund name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[18px] font-bold text-shriram-dark font-display tracking-tight leading-tight">
                    {item.fund.name}
                  </h3>
                  <span className="text-shriram-muted text-[11px] font-semibold">{item.fund.category.replace('_', ' ')}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-shriram-gold/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-shriram-gold" />
                </div>
              </div>

              {/* Why */}
              <p className="text-shriram-muted text-[13px] leading-relaxed mb-4 flex-1">
                {item.why}
              </p>

              {/* Risk chip */}
              <div className="flex flex-wrap gap-2 mb-4">
                {item.chips.map(c => (
                  <span key={c.label} className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${c.cls}`}>{c.label}</span>
                ))}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-shriram-gold-light text-shriram-gold border-shriram-gold/20">
                  Salary-funded
                </span>
              </div>

              {/* Projection */}
              <div className="bg-shriram-cream rounded-xl p-3 mb-5 text-[12.5px] text-shriram-muted border border-shriram-line">
                ₹500/mo could become{' '}
                <span className="text-shriram-dark font-extrabold font-display text-[15px]">{item.potential}</span>
                {' '}by age 60
              </div>

              {/* CTA */}
              <button
                id={`fund-select-${item.fund.id}`}
                onClick={() => handleSelect(item.fund.id, item.fund)}
                className={`${item.btnCls} w-full py-3.5 rounded-xl text-[14px]`}
              >
                Start SIP in one click <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-shriram-muted text-[12px]"
        >
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-smf-teal" /> SEBI registered AMC</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-smf-teal" /> 30-yr projection @ 11% indicative</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-smf-teal" /> No bank mandate needed</span>
        </motion.div>
      </div>
    </section>
  )
}
