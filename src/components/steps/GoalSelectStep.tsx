'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, TrendingUp, Check } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'
import {
  INVESTMENT_GOALS, GOAL_BY_ID, InvestmentGoalId, rankFundsForGoal,
} from '@/lib/investment-goals'

export default function GoalSelectStep() {
  const {
    investmentGoalId, selectedFundId,
    setInvestmentGoalId, setSelectedFundId, setAdjustedFund, setTunedDurationYrs,
    goNext,
  } = useSIPStore()

  const [goalId, setGoalId] = useState<InvestmentGoalId | null>(
    (investmentGoalId as InvestmentGoalId | null) ?? null,
  )
  const [fundId, setFundId] = useState<string | null>(selectedFundId)

  function handleSelectGoal(id: InvestmentGoalId) {
    setGoalId(id)
    setInvestmentGoalId(id)
    const goal = GOAL_BY_ID[id]
    if (goal) setTunedDurationYrs(goal.defaultHorizonYrs)
  }

  function handleSelectFund(id: string) {
    setFundId(id)
  }

  function handleContinue() {
    if (!goalId || !fundId) return
    const fund = SHRIRAM_FUNDS.find(f => f.id === fundId)
    if (!fund) return
    setSelectedFundId(fundId)
    setAdjustedFund(fund)
    goNext()
  }

  return (
    <section className="bg-shriram-cream min-h-[calc(100vh-120px)] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
          <span className="eyebrow">Step 1 · Goal & Fund Selection</span>
          <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-shriram-dark font-display tracking-tight mt-2 mb-2">
            Choose your goal. Select your preferred fund.
          </h2>
          <p className="text-shriram-muted text-[14px] sm:text-[15px] leading-relaxed max-w-2xl mx-auto">
            Select what you are saving for on the left, and choose the fund that fits your preferences below. The final choice remains fully in your hands.
          </p>
        </motion.div>

        {/* Split layout — stacks on mobile, two-column on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6">
          {/* ── LEFT: Goals grid ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">
                Choose your goal
              </div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-gold">
                {INVESTMENT_GOALS.length} options
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {INVESTMENT_GOALS.map(g => {
                const Icon = g.icon
                const selected = goalId === g.id
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectGoal(g.id)}
                    className={`relative text-left rounded-xl border-2 p-3 transition-all duration-150 ${
                      selected
                        ? 'border-shriram-gold bg-shriram-gold/8 shadow-gold'
                        : 'border-shriram-line bg-white hover:border-shriram-gold/40 hover:-translate-y-0.5'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-shriram-gold flex items-center justify-center">
                        <Check className="w-3 h-3 text-shriram-dark" strokeWidth={3} />
                      </span>
                    )}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                      selected ? 'bg-shriram-gold/20 text-shriram-gold' : 'bg-shriram-line/50 text-shriram-muted'
                    }`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="text-shriram-dark font-bold text-[13px] font-display leading-tight mb-1 pr-5">
                      {g.label}
                    </div>
                    <div className="text-shriram-muted text-[11px] leading-snug line-clamp-2 mb-2">
                      {g.description}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-shriram-gold bg-shriram-gold/10 px-1.5 py-0.5 rounded">
                        {g.defaultHorizonYrs}y
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        g.risk === 'High'     ? 'bg-red-50 text-red-700' :
                        g.risk === 'Moderate' ? 'bg-amber-50 text-amber-700' :
                                                'bg-emerald-50 text-emerald-700'
                      }`}>
                        {g.risk}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT: Mainstream Funds List (Always visible, manually chosen) ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">
                  Available mutual funds
                </div>
                <h3 className="text-shriram-dark font-bold text-[16px] font-display mt-0.5">
                  Select your preferred fund
                </h3>
              </div>
              <div className="text-[11px] text-shriram-muted">
                {SHRIRAM_FUNDS.length} mainstream options
              </div>
            </div>

            <div className="space-y-3">
              {SHRIRAM_FUNDS.map((f) => {
                const selected = fundId === f.id

                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFund(f.id)}
                    className={`relative w-full text-left rounded-xl border-2 p-4 sm:p-5 transition-all duration-150 ${
                      selected
                        ? 'border-shriram-gold bg-shriram-gold/8 shadow-gold'
                        : 'border-shriram-line bg-white hover:border-shriram-gold/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="text-shriram-dark font-bold text-[15.5px] font-display tracking-tight truncate">
                            {f.name}
                          </h4>
                        </div>
                        <span className="text-shriram-gold text-[11px] font-bold uppercase tracking-wider">
                          {f.category.replace(/_/g, ' ')} Fund
                        </span>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        selected ? 'bg-shriram-gold text-shriram-dark' : 'bg-shriram-gold/10 text-shriram-gold'
                      }`}>
                        {selected ? <Check className="w-4.5 h-4.5" strokeWidth={3} /> : <TrendingUp className="w-4.5 h-4.5" />}
                      </div>
                    </div>

                    {/* Historical return benchmarks & stats */}
                    <div className="grid grid-cols-4 gap-1.5 my-3">
                      <Stat label="5y Return" value={`${f.fiveYearReturn?.toFixed(1) ?? '—'}% p.a.`} accent />
                      <Stat label="3y Return" value={`${f.threeYearReturn?.toFixed(1) ?? '—'}% p.a.`} />
                      <Stat label="1y Return" value={`${f.oneYearReturn?.toFixed(1) ?? '—'}% p.a.`} />
                      <Stat label="Risk Level" value={f.riskLevel} />
                    </div>

                    <p className="text-shriram-muted text-[12.5px] leading-relaxed line-clamp-2 mb-3">
                      {f.description}
                    </p>

                    {f.bestFor && (
                      <div className="text-[11.5px] text-shriram-charcoal bg-shriram-cream/70 rounded-lg px-2.5 py-1.5 border border-shriram-line/30">
                        <span className="font-extrabold text-shriram-gold text-[10px] uppercase tracking-wider block mb-0.5">Suitability:</span>
                        <span className="leading-snug block">{f.bestFor}</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleContinue}
              disabled={!goalId || !fundId}
              className="btn-gold w-full mt-6 py-4 text-[14.5px] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-md transition-all"
            >
              Proceed <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-shriram-cream border border-shriram-line/50 rounded-lg px-2 py-1 text-center">
      <div className="text-shriram-muted text-[8.5px] font-extrabold uppercase tracking-wider">{label}</div>
      <div className={`text-[11px] font-extrabold font-display whitespace-nowrap ${accent ? 'text-shriram-gold' : 'text-shriram-dark'}`}>
        {value}
      </div>
    </div>
  )
}

