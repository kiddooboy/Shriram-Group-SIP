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

  // Ranked funds for the current goal — preferred categories first, then by 5-yr return.
  const rankedFunds = useMemo(() => {
    if (!goalId) return []
    const order = rankFundsForGoal(goalId, SHRIRAM_FUNDS)
    return order.map(id => SHRIRAM_FUNDS.find(f => f.id === id)!).slice(0, 4)
  }, [goalId])

  // Auto-select top-ranked fund when goal changes (only if no fund chosen yet for this goal).
  useEffect(() => {
    if (!goalId)            { setFundId(null); return }
    if (rankedFunds.length === 0) return
    const stillRanked = fundId && rankedFunds.some(f => f.id === fundId)
    if (!stillRanked) setFundId(rankedFunds[0].id)
  }, [goalId]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <span className="eyebrow">Step 1 · Goal & Fund</span>
          <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-shriram-dark font-display tracking-tight mt-2 mb-2">
            Pick a goal. We'll match a fund.
          </h2>
          <p className="text-shriram-muted text-[14px] sm:text-[15px] leading-relaxed max-w-2xl mx-auto">
            Start with what you're saving for — the right fund follows automatically.
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

          {/* ── RIGHT: Fund cards (goal-driven) ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">
                  Recommended funds
                </div>
                <h3 className="text-shriram-dark font-bold text-[16px] font-display mt-0.5">
                  {goalId ? `Top picks for ${GOAL_BY_ID[goalId].label}` : 'Pick a goal first'}
                </h3>
              </div>
              {goalId && (
                <div className="text-[11px] text-shriram-muted">
                  {rankedFunds.length} matched
                </div>
              )}
            </div>

            {!goalId ? (
              <EmptyFundState />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={goalId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {rankedFunds.map((f, i) => {
                    const isFirst = i === 0
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
                              <h4 className="text-shriram-dark font-bold text-[15px] font-display tracking-tight truncate">
                                {f.name}
                              </h4>
                              {isFirst && (
                                <span className="text-[9.5px] font-bold uppercase tracking-wider text-shriram-dark bg-shriram-gold px-2 py-0.5 rounded-full shrink-0">
                                  Best match
                                </span>
                              )}
                            </div>
                            <span className="text-shriram-muted text-[11px] font-semibold">
                              {f.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            selected ? 'bg-shriram-gold text-shriram-dark' : 'bg-shriram-gold/10 text-shriram-gold'
                          }`}>
                            {selected ? <Check className="w-4.5 h-4.5" strokeWidth={3} /> : <TrendingUp className="w-4.5 h-4.5" />}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 my-3">
                          <Stat label="5-yr return" value={`${f.fiveYearReturn?.toFixed(1) ?? '—'}%`} accent />
                          <Stat label="Risk"        value={f.riskLevel} />
                          <Stat label="Expense"     value={`${f.expenseRatio?.toFixed(2) ?? '—'}%`} />
                        </div>

                        <p className="text-shriram-muted text-[12.5px] leading-relaxed line-clamp-2 mb-2">
                          {f.description}
                        </p>

                        {f.bestFor && (
                          <div className="text-[11.5px] text-shriram-dark/80">
                            <span className="font-semibold text-shriram-gold">Suited for: </span>
                            <span className="line-clamp-1">{f.bestFor}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            )}

            {goalId && (
              <button
                onClick={handleContinue}
                disabled={!fundId}
                className="btn-gold w-full mt-5 py-3.5 text-[14px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                See AI-recommended SIP <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-shriram-cream border border-shriram-line rounded-lg px-2.5 py-1.5">
      <div className="text-shriram-muted text-[9.5px] font-bold uppercase tracking-wider">{label}</div>
      <div className={`text-[13px] font-bold font-display ${accent ? 'text-shriram-gold' : 'text-shriram-dark'}`}>
        {value}
      </div>
    </div>
  )
}

function EmptyFundState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-shriram-gold/10 border-2 border-dashed border-shriram-gold/30 flex items-center justify-center mb-4">
        <TrendingUp className="w-6 h-6 text-shriram-gold/60" />
      </div>
      <div className="text-shriram-dark font-bold text-[14px] mb-1">No goal selected yet</div>
      <p className="text-shriram-muted text-[12.5px] leading-relaxed max-w-xs">
        Pick a goal on the left and we'll instantly show the funds that align to your horizon and risk level.
      </p>
    </div>
  )
}
