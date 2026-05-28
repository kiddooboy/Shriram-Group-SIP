'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Sparkles, TrendingUp, Calendar, Target, Wallet, RotateCcw,
} from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'
import { GOAL_BY_ID, InvestmentGoalId } from '@/lib/investment-goals'
import { buildRecommendation, projectSeries } from '@/lib/recommendation-engine'

export default function TunedPlanStep() {
  const {
    investmentGoalId, selectedFundId,
    tunedSIPAmount, tunedDurationYrs,
    setTunedSIPAmount, setTunedDurationYrs,
    setAdjustedSIP, setAdjustedTenure,
    goNext, goBack,
  } = useSIPStore()

  const goal = investmentGoalId ? GOAL_BY_ID[investmentGoalId as InvestmentGoalId] : null
  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || null

  // ── Baseline recommendation (no SIP override) — drives the "Suggested SIP" pill.
  const baselineRec = useMemo(() => {
    if (!goal || !fund) return null
    return buildRecommendation({
      goalId:     goal.id,
      fund,
      horizonYrs: tunedDurationYrs,
    })
  }, [goal, fund, tunedDurationYrs])

  // ── Initialize the editable SIP to the baseline once the recommendation is ready.
  const [userSIP, setUserSIP] = useState<number | null>(null)
  useEffect(() => {
    if (baselineRec && userSIP === null) {
      const init = tunedSIPAmount && tunedSIPAmount !== 500 ? tunedSIPAmount : baselineRec.monthlySIP
      setUserSIP(init)
      setTunedSIPAmount(init)
    }
  }, [baselineRec])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live recommendation that honours the user's edits.
  const liveRec = useMemo(() => {
    if (!goal || !fund || userSIP === null) return null
    return buildRecommendation({
      goalId:      goal.id,
      fund,
      horizonYrs:  tunedDurationYrs,
      overrideSIP: userSIP,
    })
  }, [goal, fund, tunedDurationYrs, userSIP])

  const series = useMemo(() => {
    if (!liveRec || userSIP === null) return []
    return projectSeries(userSIP, liveRec.expectedReturn, tunedDurationYrs)
  }, [liveRec, userSIP, tunedDurationYrs])

  if (!goal || !fund || !baselineRec || !liveRec || userSIP === null) {
    return (
      <section className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-[3px] border-shriram-line border-t-shriram-gold animate-spin mx-auto mb-4" />
          <p className="text-shriram-muted text-[14px]">Crunching the numbers…</p>
        </div>
      </section>
    )
  }

  const onTheRecommendation = userSIP === baselineRec.monthlySIP && tunedDurationYrs === goal.defaultHorizonYrs
  const goalProgressPct = Math.min(100, Math.round((liveRec.expectedCorpusINR / liveRec.targetFutureINR) * 100))

  function handleSIPChange(val: number) {
    if (Number.isNaN(val)) return
    const clamped = Math.max(500, Math.min(200_000, Math.round(val)))
    setUserSIP(clamped)
    setTunedSIPAmount(clamped)
  }

  function handleDurationChange(yrs: number) {
    const clamped = Math.max(1, Math.min(40, Math.round(yrs)))
    setTunedDurationYrs(clamped)
    setAdjustedTenure(clamped * 12)
  }

  function handleResetToAI() {
    if (!baselineRec || !goal) return
    setUserSIP(baselineRec.monthlySIP)
    setTunedSIPAmount(baselineRec.monthlySIP)
    setTunedDurationYrs(goal.defaultHorizonYrs)
  }

  function handleAccept() {
    if (userSIP === null) return
    setAdjustedSIP(userSIP)
    setAdjustedTenure(tunedDurationYrs * 12)
    goNext()
  }

  return (
    <section className="bg-shriram-cream min-h-[calc(100vh-120px)] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <button onClick={goBack} className="text-shriram-muted hover:text-shriram-dark text-[12.5px] font-semibold flex items-center gap-1.5 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Change goal or fund
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Step 2 · AI-tuned plan
          </span>
          <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold text-shriram-dark font-display tracking-tight mt-2 mb-2">
            Your personalised SIP plan
          </h2>
          <p className="text-shriram-muted text-[14px] sm:text-[15px] leading-relaxed max-w-2xl mx-auto">
            Calculated for <span className="font-bold text-shriram-dark">{goal.label}</span> in <span className="font-bold text-shriram-dark">{fund.shortName}</span>. Edit anything — everything recalculates live.
          </p>
        </motion.div>

        {/* AI Recommendation card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-shriram-dark to-shriram-charcoal rounded-2xl shadow-card-lg overflow-hidden relative mb-6"
        >
          <div className="absolute inset-0 bg-hero-pattern bg-[size:20px_20px] opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-shriram-gold/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative px-6 sm:px-8 py-7 sm:py-8 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-shriram-gold text-shriram-dark text-[10px] font-extrabold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">
                  AI recommendation
                </span>
                {!onTheRecommendation && (
                  <button onClick={handleResetToAI} className="text-shriram-gold text-[11.5px] font-semibold flex items-center gap-1 hover:underline">
                    <RotateCcw className="w-3 h-3" /> Reset to suggested
                  </button>
                )}
              </div>
              <h3 className="text-white text-[20px] sm:text-[22px] font-bold font-display tracking-tight leading-snug mb-2">
                {onTheRecommendation
                  ? `Invest ₹${baselineRec.monthlySIP.toLocaleString('en-IN')}/month`
                  : `You're investing ₹${userSIP.toLocaleString('en-IN')}/month`}
              </h3>
              <p className="text-white/65 text-[13.5px] leading-relaxed">
                {liveRec.rationale}
              </p>
            </div>

            {/* Big number block */}
            <div className="bg-white/8 backdrop-blur rounded-xl border border-white/10 p-5 text-center">
              <div className="text-white/55 text-[10.5px] font-bold uppercase tracking-wider mb-1">
                Expected corpus in {tunedDurationYrs} years
              </div>
              <div className="text-shriram-gold text-[28px] sm:text-[32px] font-extrabold font-display tracking-tight leading-none mb-2">
                {formatINR(liveRec.expectedCorpusINR)}
              </div>
              <div className="text-white/60 text-[11px]">
                You invest {formatINR(liveRec.totalInvestedINR)}, returns add {formatINR(liveRec.totalReturnsINR)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Editable controls + visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6">
          {/* ── Left: editable controls ─────────────────────────────────── */}
          <div className="space-y-4">
            {/* SIP amount */}
            <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5">
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted mb-2">
                Monthly SIP amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-shriram-dark font-bold text-[18px]">₹</span>
                <input
                  type="number"
                  value={userSIP}
                  min={500}
                  max={200000}
                  step={100}
                  onChange={e => handleSIPChange(Number(e.target.value))}
                  placeholder="Enter your own amount"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-shriram-line bg-white text-shriram-dark font-bold font-display text-[22px] focus:outline-none focus:border-shriram-gold focus:ring-2 focus:ring-shriram-gold/20"
                />
              </div>
              {/* Quick chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {[500, 1000, 2500, 5000, baselineRec.monthlySIP].map((v, i) => {
                  const isAI = i === 4
                  return (
                    <button
                      key={`${v}-${i}`}
                      type="button"
                      onClick={() => handleSIPChange(v)}
                      className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                        userSIP === v
                          ? 'border-shriram-gold bg-shriram-gold/10 text-shriram-gold'
                          : 'border-shriram-line text-shriram-muted hover:border-shriram-gold/40 hover:text-shriram-dark'
                      } ${isAI ? 'ml-auto' : ''}`}
                    >
                      {isAI && '★ '}₹{v.toLocaleString('en-IN')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5">
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">
                  Investment duration
                </label>
                <span className="text-shriram-dark font-bold font-display text-[18px]">{tunedDurationYrs} <span className="text-[12px] font-semibold text-shriram-muted">years</span></span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tunedDurationYrs}
                onChange={e => handleDurationChange(Number(e.target.value))}
                className="w-full accent-shriram-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10.5px] text-shriram-muted/70 font-semibold mt-1">
                <span>1y</span>
                <span>15y</span>
                <span>30y</span>
              </div>
            </div>

            {/* Goal progress card */}
            <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">Goal progress</div>
                  <div className="text-shriram-dark font-bold text-[14px] mt-0.5">{goal.label}</div>
                </div>
                <Target className="w-5 h-5 text-shriram-gold" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-shriram-dark font-extrabold font-display text-[22px]">{goalProgressPct}%</span>
                <span className="text-shriram-muted text-[12px]">of {formatINR(liveRec.targetFutureINR)}</span>
              </div>
              <div className="h-2 bg-shriram-line rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${goalProgressPct >= 100 ? 'bg-emerald-500' : 'bg-shriram-gold'}`}
                  animate={{ width: `${Math.min(100, goalProgressPct)}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <p className="text-shriram-muted text-[11.5px] mt-2 leading-relaxed">
                {goalProgressPct >= 100
                  ? `Great — you're projected to exceed your ${formatINR(liveRec.targetTodayINR)} (today's ₹) goal.`
                  : `Increase your SIP or extend duration to fully reach ${formatINR(liveRec.targetTodayINR)} (today's ₹).`}
              </p>
            </div>
          </div>

          {/* ── Right: projection chart + summary ────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-shriram-line shadow-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted">
                    Wealth projection
                  </div>
                  <h4 className="text-shriram-dark font-bold text-[16px] font-display mt-0.5">
                    Estimated growth at {liveRec.expectedReturn.toFixed(1)}% p.a.
                  </h4>
                </div>
                <TrendingUp className="w-5 h-5 text-shriram-gold" />
              </div>

              <ProjectionChart series={series} />

              {/* Legend */}
              <div className="flex items-center gap-5 mt-3 text-[11.5px]">
                <span className="flex items-center gap-1.5 text-shriram-dark"><span className="inline-block w-2.5 h-2.5 rounded-full bg-shriram-gold" /> Projected corpus</span>
                <span className="flex items-center gap-1.5 text-shriram-muted"><span className="inline-block w-2.5 h-2.5 rounded-full bg-shriram-charcoal/60" /> Amount invested</span>
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SummaryTile
                icon={<Wallet className="w-4 h-4" />}
                label="Monthly SIP"
                value={`₹${userSIP.toLocaleString('en-IN')}`}
                accent
              />
              <SummaryTile
                icon={<Calendar className="w-4 h-4" />}
                label="Duration"
                value={`${tunedDurationYrs} yrs`}
              />
              <SummaryTile
                icon={<TrendingUp className="w-4 h-4" />}
                label="Expected returns"
                value={`${liveRec.expectedReturn.toFixed(1)}% p.a.`}
              />
              <SummaryTile
                label="Total invested"
                value={formatINR(liveRec.totalInvestedINR)}
              />
              <SummaryTile
                label="Returns earned"
                value={formatINR(liveRec.totalReturnsINR)}
                accent
              />
              <SummaryTile
                label="Final corpus"
                value={formatINR(liveRec.expectedCorpusINR)}
                accent
              />
            </div>

            {/* Disclaimer */}
            <p className="text-shriram-muted/70 text-[11px] leading-relaxed">
              Projections are indicative and based on the fund's historical CAGR with a forward-looking haircut. Mutual fund investments are subject to market risk — read all scheme-related documents carefully.
            </p>

            {/* CTA */}
            <button
              onClick={handleAccept}
              className="btn-gold w-full py-4 text-[15px] rounded-xl flex items-center justify-center gap-2"
            >
              {onTheRecommendation ? 'Accept & continue' : 'Continue with my SIP'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryTile({ icon, label, value, accent }: {
  icon?: React.ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-shriram-line p-3.5 shadow-card">
      <div className="flex items-center gap-1.5 text-shriram-muted text-[10.5px] font-bold uppercase tracking-wider mb-1">
        {icon}{label}
      </div>
      <div className={`font-bold font-display text-[15px] ${accent ? 'text-shriram-gold' : 'text-shriram-dark'}`}>
        {value}
      </div>
    </div>
  )
}

interface ChartPoint { year: number; invested: number; corpus: number }
function ProjectionChart({ series }: { series: ChartPoint[] }) {
  if (series.length < 2) return null
  const w = 600
  const h = 200
  const padL = 40, padR = 10, padT = 12, padB = 22

  const xMax = series[series.length - 1].year
  const yMax = Math.max(...series.map(p => p.corpus)) || 1

  const x = (year: number) => padL + (year / xMax) * (w - padL - padR)
  const y = (val: number)   => h - padB - (val / yMax) * (h - padT - padB)

  const corpusPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year)} ${y(p.corpus)}`).join(' ')
  const investedPath = series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.year)} ${y(p.invested)}`).join(' ')

  // Area under corpus curve for soft fill
  const corpusArea = corpusPath + ` L ${x(xMax)} ${h - padB} L ${x(0)} ${h - padB} Z`

  // Y-axis ticks (4 marks)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: t * yMax, py: y(t * yMax) }))
  // X-axis labels (sample 5)
  const xLabels = pickXLabels(xMax)

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* horizontal grid */}
        {ticks.map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={t.py} y2={t.py} stroke="#E8E5DE" strokeDasharray="3 3" />
        ))}
        {/* invested line */}
        <path d={investedPath} fill="none" stroke="#5C5C5C" strokeWidth={1.6} strokeDasharray="4 3" />
        {/* corpus area fill */}
        <path d={corpusArea} fill="rgba(207,164,73,0.18)" />
        {/* corpus line */}
        <path d={corpusPath} fill="none" stroke="#CFA449" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* y-axis labels */}
        {ticks.map((t, i) => (
          <text key={i} x={padL - 6} y={t.py + 3} textAnchor="end" fontSize="9" fill="#8a847b" fontFamily="system-ui">
            {compactINR(t.v)}
          </text>
        ))}
        {/* x-axis labels */}
        {xLabels.map(yr => (
          <text key={yr} x={x(yr)} y={h - 6} textAnchor="middle" fontSize="9" fill="#8a847b" fontFamily="system-ui">
            {yr}y
          </text>
        ))}
        {/* end dot on corpus */}
        <circle cx={x(xMax)} cy={y(series[series.length - 1].corpus)} r={4.5} fill="#CFA449" stroke="#fff" strokeWidth={1.8} />
      </svg>
    </div>
  )
}

function pickXLabels(maxYear: number): number[] {
  if (maxYear <= 5)  return Array.from({ length: maxYear + 1 }, (_, i) => i)
  if (maxYear <= 12) return [0, Math.round(maxYear * 0.25), Math.round(maxYear * 0.5), Math.round(maxYear * 0.75), maxYear]
  return [0, 5, 10, 15, 20, 25, 30].filter(y => y <= maxYear).concat(maxYear).filter((y, i, a) => a.indexOf(y) === i)
}

function formatINR(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`
  if (amount >= 1_00_000)    return `₹${(amount / 1_00_000).toFixed(1)} L`
  if (amount >= 1_000)       return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
function compactINR(amount: number): string {
  if (amount >= 1_00_00_000) return `${(amount / 1_00_00_000).toFixed(1)}Cr`
  if (amount >= 1_00_000)    return `${(amount / 1_00_000).toFixed(0)}L`
  if (amount >= 1_000)       return `${Math.round(amount / 1_000)}K`
  return `${Math.round(amount)}`
}
