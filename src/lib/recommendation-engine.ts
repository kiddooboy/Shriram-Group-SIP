/**
 * Rule-based recommendation engine.
 *
 * Pure functions — no DB, no side effects, no external calls. Drop-in
 * replaceable with a real model (or a live AMC API) when one is available.
 *
 *   buildRecommendation()  — given goal + fund (and optional overrides),
 *                            returns suggested SIP, tenure, expected corpus.
 *   projectSeries()        — year-by-year invested-vs-corpus series for charts.
 *
 * Math is the standard SIP future-value formula (contributions at end of month):
 *
 *     FV = P · ((1+i)^n − 1) / i · (1+i)
 *     P   = monthly SIP
 *     i   = monthly return (= annual / 12)
 *     n   = number of months
 *
 * For target-driven sizing we invert the formula to solve for P.
 */

import { GOAL_BY_ID, InvestmentGoalId } from './investment-goals'
import type { ShriramFund } from './types'

const INFLATION_PER_YEAR        = 0.06   // default 6% goal-cost inflation
const RETURN_HAIRCUT_PER_YEAR   = 0.005  // shave 50 bps off historical CAGR for forward-looking realism
const MIN_SIP                   = 500
const MAX_SIP                   = 200_000
const SIP_ROUND_STEP            = 100    // round suggested SIP to the nearest ₹100

export interface RecommendationInput {
  goalId:         InvestmentGoalId
  fund:           ShriramFund
  /** Override the goal's default horizon (years). */
  horizonYrs?:    number
  /** Override the goal's default target corpus (today's ₹). */
  targetINR?:     number
  /** If the user has already typed an SIP override, we compute corpus from that instead of solving for SIP. */
  overrideSIP?:   number
}

export interface RecommendationOutput {
  monthlySIP:        number   // ₹ / month (rounded)
  horizonYrs:        number
  expectedReturn:    number   // % per year (decimal points kept)
  targetTodayINR:    number
  targetFutureINR:   number   // inflated to FV
  expectedCorpusINR: number   // what monthlySIP will actually compound to
  totalInvestedINR:  number   // monthlySIP × months
  totalReturnsINR:   number   // corpus − invested
  riskLevel:         'Low' | 'Moderate' | 'High'
  rationale:         string   // human-readable why-this-number
  /** True when overrideSIP was applied. */
  isUserOverride:    boolean
}

export function buildRecommendation(input: RecommendationInput): RecommendationOutput {
  const goal = GOAL_BY_ID[input.goalId]
  if (!goal) throw new Error(`Unknown goal: ${input.goalId}`)

  const horizonYrs = clamp(input.horizonYrs ?? goal.defaultHorizonYrs, 1, 40)
  const targetTodayINR = Math.max(0, input.targetINR ?? goal.defaultTargetINR)
  const targetFutureINR = Math.round(targetTodayINR * Math.pow(1 + INFLATION_PER_YEAR, horizonYrs))

  // Forward-looking expected return: use fund's 5-yr CAGR if present, else 3-yr,
  // else the goal's fallback. Apply a small haircut for realism.
  const baseReturn =
    input.fund.fiveYearReturn ??
    input.fund.threeYearReturn ??
    goal.fallbackAnnualReturn
  const expectedReturn = Math.max(4, baseReturn - RETURN_HAIRCUT_PER_YEAR * 100)

  const monthlyRate = expectedReturn / 100 / 12
  const months      = horizonYrs * 12

  let monthlySIP: number
  let isUserOverride = false

  if (input.overrideSIP && input.overrideSIP > 0) {
    monthlySIP = clamp(input.overrideSIP, MIN_SIP, MAX_SIP)
    isUserOverride = true
  } else {
    // Invert the SIP-FV formula: P = FV / [((1+i)^n − 1) / i × (1+i)]
    const compound = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
    const denominator = compound * (1 + monthlyRate)
    const raw = denominator > 0 ? targetFutureINR / denominator : 0
    monthlySIP = clamp(Math.round(raw / SIP_ROUND_STEP) * SIP_ROUND_STEP, MIN_SIP, MAX_SIP)
  }

  const expectedCorpusINR = futureValueOfSIP(monthlySIP, monthlyRate, months)
  const totalInvestedINR  = monthlySIP * months
  const totalReturnsINR   = Math.max(0, expectedCorpusINR - totalInvestedINR)

  const rationale = buildRationale({
    goalLabel:      goal.label,
    fundShortName:  input.fund.shortName,
    expectedReturn,
    horizonYrs,
    targetTodayINR,
    targetFutureINR,
    monthlySIP,
    isUserOverride,
  })

  return {
    monthlySIP,
    horizonYrs,
    expectedReturn,
    targetTodayINR,
    targetFutureINR,
    expectedCorpusINR: Math.round(expectedCorpusINR),
    totalInvestedINR:  Math.round(totalInvestedINR),
    totalReturnsINR:   Math.round(totalReturnsINR),
    riskLevel:         goal.risk,
    rationale,
    isUserOverride,
  }
}

/** Year-by-year [invested, corpus] series for charting. */
export interface YearPoint { year: number; invested: number; corpus: number }
export function projectSeries(monthlySIP: number, annualReturnPct: number, horizonYrs: number): YearPoint[] {
  const i = annualReturnPct / 100 / 12
  const out: YearPoint[] = []
  for (let y = 0; y <= horizonYrs; y++) {
    const n = y * 12
    const corpus = n === 0 ? 0 : futureValueOfSIP(monthlySIP, i, n)
    out.push({
      year:     y,
      invested: Math.round(monthlySIP * n),
      corpus:   Math.round(corpus),
    })
  }
  return out
}

// ─── Internals ────────────────────────────────────────────────────────────────

function futureValueOfSIP(P: number, i: number, n: number): number {
  if (n === 0)  return 0
  if (i === 0)  return P * n
  return P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function buildRationale(args: {
  goalLabel:     string
  fundShortName: string
  expectedReturn: number
  horizonYrs:    number
  targetTodayINR: number
  targetFutureINR: number
  monthlySIP:    number
  isUserOverride: boolean
}): string {
  const todayCr = formatINR(args.targetTodayINR)
  const futureCr = formatINR(args.targetFutureINR)
  if (args.isUserOverride) {
    return (
      `At ₹${args.monthlySIP.toLocaleString('en-IN')}/month into ${args.fundShortName} ` +
      `(${args.expectedReturn.toFixed(1)}% expected p.a.) for ${args.horizonYrs} years, ` +
      `your ${args.goalLabel.toLowerCase()} corpus compounds to the value shown below.`
    )
  }
  return (
    `To reach ${todayCr} (≈ ${futureCr} after ${args.horizonYrs} years of 6% inflation), ` +
    `you should invest ₹${args.monthlySIP.toLocaleString('en-IN')}/month into ${args.fundShortName}. ` +
    `Assumes ${args.expectedReturn.toFixed(1)}% expected annualised return based on the fund's track record.`
  )
}

function formatINR(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`
  if (amount >= 1_00_000)    return `₹${(amount / 1_00_000).toFixed(1)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}
