'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Sparkles, TrendingUp, Target, ShieldAlert, Info } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { formatCurrency } from '@/lib/funds'

const RISK_BAR: Record<string, number> = {
  'Very Low': 1, Low: 2, Moderate: 3, 'Moderately High': 4, High: 5,
}

function RiskDots({ level }: { level: string }) {
  const n = RISK_BAR[level] ?? 3
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-1 w-4 rounded-full ${i <= n ? 'bg-shriram-orange' : 'bg-white/12'}`} />
      ))}
      <span className="text-white/45 text-[11px] ml-1.5">{level}</span>
    </div>
  )
}

function RiskBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-white/70 text-[12px] font-medium">{label}</span>
        <span className="text-white font-bold text-[13px]">
          {value}<span className="text-white/30 text-[10px]"> /100</span>
        </span>
      </div>
      <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div className="h-full bg-shriram-orange rounded-full"
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ delay: 0.3, duration: 0.7 }} />
      </div>
      <div className="text-white/30 text-[10px] mt-1">{hint}</div>
    </div>
  )
}

// Capacity (financial ability) vs willingness (appetite) — the engine invests
// at the lower of the two and shows where that lands across the three funds.
function RiskRead({ capacity, willingness, growthScore, fundId, riskNote }: {
  capacity: number; willingness: number; growthScore: number
  fundId: string; riskNote: string | null
}) {
  const stops = [
    { id: 'SMAF', label: 'Multi Asset' },
    { id: 'SAH', label: 'Aggressive Hybrid' },
    { id: 'SFC', label: 'Flexi Cap' },
  ]
  return (
    <div className="cred-card p-5">
      <div className="cred-label mb-3.5">Your risk read</div>
      <div className="space-y-3.5">
        <RiskBar label="Risk capacity" value={capacity}
          hint="What your finances can absorb — buffer, EMIs, horizon, dependents" />
        <RiskBar label="Risk willingness" value={willingness}
          hint="What you're comfortable with — your crash answer & stated style" />
      </div>

      <div className="mt-5 pt-4 border-t border-white/[0.07]">
        <div className="text-white/35 text-[11px] mb-2.5">
          We invest at the lower of the two — you need both
        </div>
        <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-500/40 via-shriram-orange/50 to-red-500/50 mb-2">
          <motion.div
            className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-shriram-orange shadow-orange-glow"
            initial={{ left: '0%' }}
            animate={{ left: `calc(${growthScore}% - 8px)` }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between">
          {stops.map(s => (
            <span key={s.id}
              className={`text-[10px] font-semibold ${s.id === fundId ? 'text-shriram-orange' : 'text-white/30'}`}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {riskNote && (
        <div className="mt-4 rounded-xl bg-shriram-orange/[0.08] border border-shriram-orange/20 px-3.5 py-3">
          <p className="text-shriram-orange/85 text-[12px] leading-relaxed">{riskNote}</p>
        </div>
      )}
    </div>
  )
}

export default function RecommendationStep() {
  const {
    recommendation, setAdjustedFund, setAdjustedSIP, setAdjustedTenure,
    restartQuestionnaire, setStep, goNext,
  } = useSIPStore()
  const [showWhy, setShowWhy] = useState(true)
  const [showOthers, setShowOthers] = useState(false)

  if (!recommendation) return null
  const r = recommendation
  const { fund, sipAmount, tenureMonths } = r
  const years = Math.round(tenureMonths / 12)

  function handleConfirm() {
    setAdjustedFund(fund)
    setAdjustedSIP(sipAmount)
    setAdjustedTenure(tenureMonths)
    goNext()
  }

  function handleRetake() {
    restartQuestionnaire()
    setStep('questions')
  }

  return (
    <div className="cred-page relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[300px] cred-glow pointer-events-none" />
      <div className="relative px-6 pt-[122px] pb-10 flex flex-col min-h-[100dvh]">
        <span className="cred-label flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-shriram-orange" />
          {Math.round(r.confidenceScore * 100)}% confidence
        </span>
        <h1 className="cred-h1 mt-3 mb-5">Your single<br />best-fit fund</h1>

        {/* emergency-first */}
        {r.emergencyFirst && (
          <div className="rounded-2xl bg-shriram-gold/[0.08] border border-shriram-gold/25 px-4 py-3.5 mb-4 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-shriram-gold flex-shrink-0 mt-0.5" />
            <p className="text-shriram-gold/90 text-[12px] leading-relaxed">
              <span className="font-bold">Emergency fund first.</span> You have under a month of expenses saved — the engine has steered you to the most defensive option while you build a safety net.
            </p>
          </div>
        )}

        {/* THE single recommended fund */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="cred-card-active rounded-3xl p-6"
        >
          <div className="cred-chip bg-shriram-orange text-black mb-3">
            <Sparkles className="w-3 h-3" /> Most suitable for you
          </div>
          <div className="text-white font-extrabold text-2xl tracking-tight leading-tight">{fund.name}</div>
          {fund.assetMix && <div className="text-white/45 text-[12px] mt-1">{fund.assetMix}</div>}
          <div className="mt-3.5"><RiskDots level={fund.riskLevel} /></div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              ['₹' + sipAmount.toLocaleString('en-IN'), 'per month'],
              [years + ' yr', 'tenure'],
              [formatCurrency(r.projectedCorpus), 'projected'],
            ].map(([v, l], i) => (
              <div key={i} className="bg-white/[0.04] rounded-2xl py-3 px-1 text-center">
                <div className={`font-extrabold text-[15px] tracking-tight ${i === 0 ? 'text-shriram-orange' : i === 2 ? 'text-emerald-400' : 'text-white'}`}>{v}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[11px] text-white/35 mt-3">
            <span>{fund.threeYearReturn}% 3yr CAGR</span><span>·</span>
            <span>{fund.expenseRatio}% expense ratio</span><span>·</span>
            <span className="text-shriram-orange/70">Top {100 - fund.peerPercentile}% of 44 AMCs</span>
          </div>
        </motion.div>

        {/* capacity vs willingness */}
        <div className="mt-4">
          <RiskRead
            capacity={r.riskCapacity}
            willingness={r.riskWillingness}
            growthScore={r.growthScore}
            fundId={fund.id}
            riskNote={r.riskNote}
          />
        </div>

        {/* goal attainment */}
        <div className="cred-card p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-shriram-orange" />
            <span className="text-white font-semibold text-[13px]">Goal-attainment probability</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-shriram-orange font-extrabold text-4xl tracking-tightest">
              {Math.round(r.goalAttainmentProbability * 100)}%
            </span>
            <div className="flex-1">
              <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div className="h-full bg-orange-gradient rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${r.goalAttainmentProbability * 100}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }} />
              </div>
              <p className="text-white/35 text-[11px] mt-1.5">Modelled chance of hitting this goal on time</p>
            </div>
          </div>
        </div>

        {/* corpus range */}
        <div className="cred-card p-5 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-semibold text-[13px]">Projected corpus range</span>
          </div>
          <div className="flex items-end justify-between">
            <div><div className="text-white/30 text-[11px]">Conservative</div>
              <div className="text-white/65 font-bold text-[13px]">{formatCurrency(r.corpusP10)}</div></div>
            <div className="text-center"><div className="text-emerald-400 text-[11px] font-semibold">Likely</div>
              <div className="text-emerald-400 font-extrabold text-xl tracking-tight">{formatCurrency(r.projectedCorpus)}</div></div>
            <div className="text-right"><div className="text-white/30 text-[11px]">Optimistic</div>
              <div className="text-white/65 font-bold text-[13px]">{formatCurrency(r.corpusP90)}</div></div>
          </div>
          <p className="text-white/25 text-[11px] mt-3 text-center">
            You invest {formatCurrency(sipAmount * tenureMonths)} · not a guaranteed return
          </p>
        </div>

        {/* why — reasoning + SHAP */}
        <div className="cred-card mt-4 overflow-hidden">
          <button onClick={() => setShowWhy(!showWhy)} className="w-full px-5 py-4 flex items-center justify-between">
            <span className="text-white font-semibold text-[13px]">Why this fund</span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showWhy ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showWhy && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-5 pb-5">
                  <p className="text-white/55 text-[13px] leading-relaxed mb-4">{r.reasoning}</p>
                  <div className="cred-label mb-2.5">What drove this · SHAP</div>
                  <div className="space-y-2.5">
                    {r.shapFactors.map((f, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-white/55">{f.label}</span>
                          <span className={f.direction === 'up' ? 'text-emerald-400' : 'text-shriram-orange'}>
                            {Math.round(f.weight * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${f.direction === 'up' ? 'bg-emerald-400' : 'bg-shriram-orange'}`}
                            style={{ width: `${f.weight * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* why not the other two */}
        <div className="cred-card mt-4 overflow-hidden">
          <button onClick={() => setShowOthers(!showOthers)} className="w-full px-5 py-4 flex items-center justify-between">
            <span className="text-white font-semibold text-[13px]">Why not the other two funds</span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showOthers ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showOthers && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-5 pb-5 space-y-3">
                  {r.considered.map(c => (
                    <div key={c.fund.id} className="cred-row px-4 py-3">
                      <div className="text-white font-semibold text-[13px]">{c.fund.shortName}</div>
                      <div className="text-white/45 text-[11px] mt-0.5 mb-1.5">{c.fund.assetMix}</div>
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
                        <p className="text-white/50 text-[12px] leading-relaxed">{c.reasonNotChosen}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* liquidity note */}
        {r.liquidityNote && (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 mt-4">
            <p className="text-white/55 text-[12px] leading-relaxed">
              <span className="text-white font-semibold">Liquidity note —</span> {r.liquidityNote}
            </p>
          </div>
        )}

        {/* ELSS honesty */}
        {r.unmetNeed === 'ELSS_NOT_IN_UNIVERSE' && (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 mt-4">
            <p className="text-white/55 text-[12px] leading-relaxed">
              <span className="text-white font-semibold">Honest note —</span> you have unused 80C headroom, but Shriram AMC has no ELSS scheme. For a tax deduction, consider an ELSS fund outside this platform — we won&apos;t mis-label a non-ELSS fund as tax-saving.
            </p>
          </div>
        )}

        <p className="text-white/22 text-[10px] leading-relaxed mt-5 px-1">
          Shriram Finance Ltd (ARN holder) distributes only Shriram AMC schemes. Shriram Finance and Shriram AMC are group entities — related-party disclosure applies. This is a suitability assessment, not investment advice. Mutual fund investments are subject to market risks.
        </p>

        <div className="mt-auto pt-8">
          <button onClick={handleConfirm} className="cred-btn">
            Confirm &amp; set up auto-debit <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <button onClick={handleRetake} className="cred-btn-ghost">Retake the questionnaire</button>
        </div>
      </div>
    </div>
  )
}
