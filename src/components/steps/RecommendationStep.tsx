'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChevronDown, Sparkles, TrendingUp, Target,
  ShieldAlert, AlertTriangle, Info,
} from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { formatCurrency } from '@/lib/funds'
import { GoalRecommendation } from '@/lib/types'
import { GOAL_CARDS } from '@/lib/questionnaire'

const RISK_BAR: Record<string, number> = {
  'Very Low': 1, Low: 2, Moderate: 3, 'Moderately High': 4, High: 5,
}

function RiskDots({ level }: { level: string }) {
  const n = RISK_BAR[level] ?? 3
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`h-1 w-3.5 rounded-full ${i <= n ? 'bg-shriram-orange' : 'bg-white/12'}`} />
      ))}
      <span className="text-white/45 text-[10px] ml-1">{level}</span>
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
        <div className="text-white/35 text-[11px] mb-2.5">We invest at the lower of the two — you need both</div>
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

function GoalCard({ rec, index }: { rec: GoalRecommendation; index: number }) {
  const [open, setOpen] = useState(false)
  const card = GOAL_CARDS.find(c => c.type === rec.goal.type)
  const years = Math.round(rec.tenureMonths / 12)
  const targetYear = new Date().getFullYear() + Math.round(rec.goal.horizonYears)
  const attainmentPct = Math.round(rec.goalAttainmentProbability * 100)
  const crashPct = Math.round(rec.crashStressProbability * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className={index === 0 ? 'cred-card-active rounded-3xl p-5' : 'cred-card p-5'}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-[20px] leading-none">{card?.emoji}</span>
        <span className="text-white font-bold text-[15px] flex-1">{card?.label}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${index === 0 ? 'text-shriram-orange' : 'text-white/40'}`}>
          {index === 0 ? '★ Primary' : `#${index + 1}`}
        </span>
      </div>

      <div className="text-white/45 text-[11px] mb-3">
        Target: <span className="text-white">{formatCurrency(rec.goal.targetAmount)}</span> today
        <span className="text-white/30"> → </span>
        <span className="text-white">{formatCurrency(rec.targetFutureValue)}</span> by {targetYear}
        <span className="text-white/30"> (6% inflation)</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-white text-[13px] font-semibold">{rec.fund.shortName}</span>
        <span className="text-white/30 text-[11px]">·</span>
        <RiskDots level={rec.fund.riskLevel} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white/[0.04] rounded-xl py-2.5 px-1 text-center">
          <div className="text-shriram-orange font-extrabold text-[14px]">₹{rec.recommendedSIP.toLocaleString('en-IN')}</div>
          <div className="text-white/30 text-[10px] mt-0.5">/month</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl py-2.5 px-1 text-center">
          <div className="text-white font-extrabold text-[14px]">{years} yr</div>
          <div className="text-white/30 text-[10px] mt-0.5">tenure</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl py-2.5 px-1 text-center">
          <div className="text-emerald-400 font-extrabold text-[12px]">{formatCurrency(rec.projectedCorpus)}</div>
          <div className="text-white/30 text-[10px] mt-0.5">P50 (MC)</div>
        </div>
      </div>

      {/* shortfall warning */}
      {rec.shortfall && (
        <div className="rounded-xl bg-shriram-gold/[0.08] border border-shriram-gold/25 px-3 py-2.5 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-shriram-gold flex-shrink-0 mt-0.5" />
          <p className="text-shriram-gold/90 text-[11px] leading-relaxed">
            <span className="font-bold">Below target.</span> Hitting this target needs ₹{rec.requiredSIP.toLocaleString('en-IN')}/month —
            but your other goals share the same budget. Expected shortfall ≈ {formatCurrency(rec.shortfallAmount)}.
          </p>
        </div>
      )}

      {/* probabilities */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.04] rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Target className="w-3 h-3 text-shriram-orange" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Attainment</span>
          </div>
          <div className="text-shriram-orange font-extrabold text-[18px] tracking-tight">{attainmentPct}%</div>
          <div className="text-white/30 text-[10px]">of 1,000 simulations</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1 mb-0.5">
            <ShieldAlert className="w-3 h-3 text-white/50" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">If yr-3 crash</span>
          </div>
          <div className="text-white/85 font-extrabold text-[18px] tracking-tight">{crashPct}%</div>
          <div className="text-white/30 text-[10px]">−35% shock @ year 3</div>
        </div>
      </div>

      {/* P10–P90 range */}
      <div className="mt-3 flex items-end justify-between text-[11px]">
        <div><div className="text-white/30">Conservative (P10)</div>
          <div className="text-white/65 font-bold">{formatCurrency(rec.corpusP10)}</div></div>
        <div className="text-right"><div className="text-white/30">Optimistic (P90)</div>
          <div className="text-white/65 font-bold">{formatCurrency(rec.corpusP90)}</div></div>
      </div>

      {/* expand for reasoning + considered */}
      <button onClick={() => setOpen(!open)}
        className="w-full mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-white/55 text-[12px]">
        <span>Why this fund &amp; not the others</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <p className="text-white/55 text-[12px] leading-relaxed pt-3">{rec.reasoning}</p>
            <div className="mt-3 space-y-2">
              {rec.considered.map(c => (
                <div key={c.fund.id} className="bg-white/[0.03] rounded-lg px-3 py-2">
                  <div className="text-white text-[11px] font-semibold">{c.fund.shortName} — why not</div>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <Info className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
                    <p className="text-white/45 text-[11px] leading-relaxed">{c.reasonNotChosen}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RecommendationStep() {
  const {
    recommendation, setAdjustedFund, setAdjustedSIP, setAdjustedTenure,
    restartQuestionnaire, setStep, goNext,
  } = useSIPStore()

  if (!recommendation) return null
  const r = recommendation

  function handleConfirm() {
    setAdjustedFund(r.fund)
    setAdjustedSIP(r.totalMonthlySIP)
    setAdjustedTenure(r.tenureMonths)
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
          {Math.round(r.confidenceScore * 100)}% confidence · {r.goals.length} goal{r.goals.length !== 1 ? 's' : ''}
        </span>
        <h1 className="cred-h1 mt-3 mb-5">Your personalised plan</h1>

        {/* Emergency-first banner */}
        {r.emergencyFirst && (
          <div className="rounded-2xl bg-shriram-gold/[0.08] border border-shriram-gold/25 px-4 py-3.5 mb-4 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-shriram-gold flex-shrink-0 mt-0.5" />
            <p className="text-shriram-gold/90 text-[12px] leading-relaxed">
              <span className="font-bold">Emergency fund first.</span> You have under a month of expenses saved — the engine added an emergency-corpus goal to your plan so it builds in parallel with your other goals.
            </p>
          </div>
        )}

        {/* Total SIP summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="cred-card-active rounded-3xl p-6 mb-4"
        >
          <div className="cred-label mb-1.5">Total monthly SIP</div>
          <div className="text-white font-extrabold text-[40px] tracking-tightest leading-none">
            ₹{r.totalMonthlySIP.toLocaleString('en-IN')}
            <span className="text-white/35 text-[16px] font-medium"> / month</span>
          </div>
          <div className="text-white/45 text-[12px] mt-1.5">
            Across {r.goals.length} sub-portfolio{r.goals.length !== 1 ? 's' : ''} · sustainable ceiling ₹{r.affordableSIPCeiling.toLocaleString('en-IN')}/month
          </div>
          {r.anyShortfall && (
            <div className="mt-3 rounded-xl bg-shriram-gold/[0.08] border border-shriram-gold/25 px-3.5 py-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-shriram-gold flex-shrink-0 mt-0.5" />
              <p className="text-shriram-gold/90 text-[12px] leading-relaxed">
                <span className="font-bold">Your goals together exceed what you can sustain.</span> We&apos;ve scaled each goal&apos;s SIP proportionally to fit your budget — see per-goal shortfalls below.
              </p>
            </div>
          )}
        </motion.div>

        {/* Risk read */}
        <div className="mb-4">
          <RiskRead
            capacity={r.riskCapacity} willingness={r.riskWillingness}
            growthScore={r.growthScore} fundId={r.fund.id} riskNote={r.riskNote}
          />
        </div>

        {/* Per-goal cards */}
        <div className="space-y-3">
          <div className="cred-label">Per-goal sub-portfolios</div>
          {r.goals.map((g, i) => <GoalCard key={g.goal.type + '_' + i} rec={g} index={i} />)}
        </div>

        {/* Liquidity / ELSS honest notes */}
        {r.liquidityNote && (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 mt-4">
            <p className="text-white/55 text-[12px] leading-relaxed">
              <span className="text-white font-semibold">Liquidity note —</span> {r.liquidityNote}
            </p>
          </div>
        )}
        {r.unmetNeed === 'ELSS_NOT_IN_UNIVERSE' && (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 mt-4">
            <p className="text-white/55 text-[12px] leading-relaxed">
              <span className="text-white font-semibold">Honest note —</span> you have unused 80C headroom, but Shriram AMC has no ELSS scheme. For a tax deduction, consider an ELSS fund outside this platform — we won&apos;t mis-label a non-ELSS fund as tax-saving.
            </p>
          </div>
        )}

        <p className="text-white/22 text-[10px] leading-relaxed mt-5 px-1">
          Shriram Finance Ltd (ARN holder) distributes only Shriram AMC schemes. Shriram Finance and Shriram AMC are group entities — related-party disclosure applies. This is a suitability assessment, not investment advice. Projections use Monte Carlo simulation of historical fund return distributions, with a 6% inflation adjustment on targets; not a guaranteed return. Mutual fund investments are subject to market risks.
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
