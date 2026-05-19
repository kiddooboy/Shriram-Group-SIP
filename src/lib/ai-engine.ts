import {
  EmployeeProfile,
  QuestionnaireState,
  QuestionCode,
  QAnswer,
  CashflowAnswer,
  GoalEntry,
  PrimaryGoal,
  AIRecommendation,
  ShapFactor,
} from './types'
import { FUND_BY_ID } from './funds'
import { IMPUTED_DEFAULTS, profileConfidence } from './questionnaire'

// ════════════════════════════════════════════════════════════════════════════
//  M3 MATCHER + M6 OPTIMIZER (transparent heuristic, P1).
//  Picks the SINGLE most suitable fund out of the three core Shriram AMC funds:
//    SMAF — Multi Asset Allocation  (equity + debt + gold — most defensive)
//    SAH  — Aggressive Hybrid       (65–80% equity + debt — balanced middle)
//    SFC  — Flexi Cap               (pure equity — most aggressive)
// ════════════════════════════════════════════════════════════════════════════

// ─── Option-id → numeric lookup tables ────────────────────────────────────────
const TAKEHOME: Record<string, number> = {
  TH_15: 12_000, TH_15_30: 22_000, TH_30_50: 40_000,
  TH_50_80: 64_000, TH_80_125: 1_00_000, TH_125P: 1_60_000,
}
const EXPENSES: Record<string, number> = {
  EX_10: 8_000, EX_20: 15_000, EX_35: 27_000, EX_35P: 48_000,
}
const EMI: Record<string, number> = {
  EMI_0: 0, EMI_10: 6_000, EMI_25: 17_000, EMI_25P: 35_000,
}
const STRESS_SIP: Record<string, number> = {
  S_500: 500, S_1500: 1_500, S_4000: 3_500, S_8000: 7_500, S_15000: 14_000,
}
const EMERGENCY_MONTHS: Record<string, number> = {
  E_0: 0.5, E_1_3: 2, E_3_6: 4.5, E_6P: 8,
}
const FAMILY_CAPACITY: Record<string, number> = {
  SOLO: 1.0, COUPLE: 0.90, KIDS: 0.78, PARENTS: 0.70, SOLE: 0.62,
}
const FAMILY_RISK: Record<string, number> = {
  SOLO: 0.4, COUPLE: 0.1, KIDS: -0.2, PARENTS: -0.3, SOLE: -0.5,
}
const CRASH_RISK: Record<string, number> = {
  C_SELL: -1.6, C_PAUSE: -0.6, C_HOLD: 0.3, C_BUY: 1.3,
}
const SCENARIO_RISK: Record<string, number> = {
  R_STEADY: -0.9, R_BAL: 0, R_GROWTH: 0.9,
}
const WEALTH_RISK: Record<string, number> = {
  W_NONE: -0.3, W_LOW: 0, W_MID: 0.3, W_HIGH: 0.5,
}
const EXPERIENCE_RISK: Record<string, number> = {
  X_NONE: -0.4, X_SOME: 0, X_GOOD: 0.3, X_EXP: 0.5,
}
const EMERGENCY_RISK: Record<string, number> = {
  E_0: -0.5, E_1_3: -0.1, E_3_6: 0.2, E_6P: 0.4,
}
const CITY_COST: Record<string, number> = {
  TIER1: 1.10, TIER2: 1.0, TIER3: 0.92,
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// ─── Derived profile ──────────────────────────────────────────────────────────
export interface DerivedProfile {
  takehome: number
  expenses: number
  emi: number
  disposable: number
  familyCapacity: number
  stressFloor: number
  emergencyMonths: number
  emergencyAdequate: boolean
  riskScore: number          // 1–5
  primaryGoal: PrimaryGoal
  primaryHorizonYears: number
  allGoals: GoalEntry[]
  needsLiquiditySoon: boolean
  has80CHeadroom: boolean
  protectionGap: 'none' | 'partial' | 'full'
  avoidSmallCap: boolean
  crashId: string            // CRASH answer — loss-aversion signal
  experienceId: string       // EXPERIENCE answer
  riskPrefId: string         // RISK_SCENARIO answer
  wealthId: string           // WEALTH answer — existing-corpus band
  age: number
  confidence: number
}

function ans(state: QuestionnaireState, code: QuestionCode): QAnswer {
  return state.answers[code] ?? IMPUTED_DEFAULTS[code]
}

export function deriveProfile(emp: EmployeeProfile, state: QuestionnaireState): DerivedProfile {
  const cf = ans(state, 'CASHFLOW') as CashflowAnswer
  const takehome = TAKEHOME[cf.takehome] ?? 40_000
  const expenses = EXPENSES[cf.expenses] ?? 15_000
  const emi = EMI[cf.emi] ?? 6_000
  const disposable = Math.max(0, takehome - expenses - emi)

  const stressFloor = STRESS_SIP[ans(state, 'SIP_STRESS') as string] ?? 1_500
  const emergencyId = ans(state, 'EMERGENCY') as string
  const emergencyMonths = EMERGENCY_MONTHS[emergencyId] ?? 2
  const emergencyAdequate = emergencyMonths >= 3

  const goals = ans(state, 'GOALS') as GoalEntry[]
  const primary = goals[0] ?? { type: 'RETIREMENT' as PrimaryGoal, horizonYears: 20 }

  const crashId = ans(state, 'CRASH') as string
  const experienceId = ans(state, 'EXPERIENCE') as string
  const riskPrefId = ans(state, 'RISK_SCENARIO') as string
  const wealthId = ans(state, 'WEALTH') as string

  // ── Risk score: blended signal used for amount sizing & risk-fit ──
  let risk = 3
  risk += CRASH_RISK[crashId] ?? 0
  risk += SCENARIO_RISK[riskPrefId] ?? 0
  risk += FAMILY_RISK[ans(state, 'FAMILY') as string] ?? 0
  risk += WEALTH_RISK[ans(state, 'WEALTH') as string] ?? 0
  risk += EXPERIENCE_RISK[experienceId] ?? 0
  risk += EMERGENCY_RISK[emergencyId] ?? 0
  if (emp.age < 30) risk += 0.4
  else if (emp.age >= 45 && emp.age < 55) risk -= 0.3
  else if (emp.age >= 55) risk -= 0.7
  risk += Math.min(0.6, Math.max(0, (primary.horizonYears - 3) / 22))
  const liquidityId = ans(state, 'LIQUIDITY') as string
  const needsLiquiditySoon = liquidityId === 'L_YES'
  if (needsLiquiditySoon) risk -= 0.6
  const riskScore = clamp(risk, 1, 5)

  const taxId = ans(state, 'TAX') as string
  const insuranceId = ans(state, 'INSURANCE') as string
  const prefs = (ans(state, 'PREFERENCES') as string[]) ?? []

  return {
    takehome, expenses, emi, disposable,
    familyCapacity: FAMILY_CAPACITY[ans(state, 'FAMILY') as string] ?? 0.85,
    stressFloor, emergencyMonths, emergencyAdequate,
    riskScore,
    primaryGoal: primary.type,
    primaryHorizonYears: primary.horizonYears,
    allGoals: goals,
    needsLiquiditySoon,
    has80CHeadroom: taxId === 'T_OLD_80C',
    protectionGap: insuranceId === 'I_NONE' ? 'full' : insuranceId === 'I_ONE' ? 'partial' : 'none',
    avoidSmallCap: prefs.includes('P_NO_SMALL'),
    crashId, experienceId, riskPrefId, wealthId,
    age: emp.age,
    confidence: profileConfidence(state),
  }
}

// ─── SIP amount (M6 sizing) ───────────────────────────────────────────────────
const GOAL_URGENCY: Record<PrimaryGoal, number> = {
  EMERGENCY: 0.70, BIG_PURCHASE: 0.85, HOME: 0.92, CHILD_FUTURE: 1.0, RETIREMENT: 1.0,
}

function computeSIPAmount(emp: EmployeeProfile, p: DerivedProfile): number {
  const savingsRate = p.emergencyAdequate ? 0.40 : 0.27
  const cityFactor = CITY_COST[emp.cityTier] ?? 1.0
  const rawSIP = (p.disposable / cityFactor) * savingsRate * p.familyCapacity * GOAL_URGENCY[p.primaryGoal]

  let target = 0.6 * rawSIP + 0.4 * p.stressFloor
  if (p.confidence < 0.60) target = Math.min(target, p.stressFloor)

  const floored = Math.max(500, target)
  const capped = Math.min(floored, p.takehome * 0.40, Math.max(500, p.disposable * 0.85))
  return Math.max(500, Math.round(capped / 500) * 500)
}

function computeTenure(p: DerivedProfile): number {
  return clamp(Math.round(p.primaryHorizonYears * 12), 12, 360)
}

function sipFutureValue(sip: number, months: number, annualReturn: number): number {
  const r = annualReturn / 100 / 12
  if (r === 0) return sip * months
  return sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
}

// ════════════════════════════════════════════════════════════════════════════
//  FUND DECISION MODEL — choose ONE of {Multi Asset, Aggressive Hybrid, Flexi Cap}
// ════════════════════════════════════════════════════════════════════════════

// ── Willingness (psychology) inputs ──
const WILLING_CRASH: Record<string, number> = { C_BUY: 30, C_HOLD: 15, C_PAUSE: -10, C_SELL: -32 }
const WILLING_PREF:  Record<string, number> = { R_GROWTH: 14, R_BAL: 0, R_STEADY: -16 }
const WILLING_EXP:   Record<string, number> = { X_EXP: 10, X_GOOD: 5, X_SOME: -2, X_NONE: -12 }
// ── Capacity (financial ability) input ──
const CAP_WEALTH:    Record<string, number> = { W_HIGH: 12, W_MID: 6, W_LOW: 0, W_NONE: -6 }

/**
 * Risk WILLINGNESS — the user's psychological appetite for risk: what they
 * *want* to do. Driven by the crash-scenario answer, stated style and comfort.
 */
function riskWillingness(p: DerivedProfile): number {
  let w = 50
  w += WILLING_CRASH[p.crashId] ?? 0      // crash-scenario answer — dominant signal
  w += WILLING_PREF[p.riskPrefId] ?? 0    // stated steady-vs-ambitious style
  w += WILLING_EXP[p.experienceId] ?? 0   // comfort built from experience
  return Math.round(clamp(w, 0, 100))
}

/**
 * Risk CAPACITY — the user's financial ability to absorb a loss: what they
 * *can* take, regardless of how brave they feel.
 */
function riskCapacity(p: DerivedProfile): number {
  let c = 50
  // emergency buffer — a cushion is what lets you stay invested through a fall
  c += clamp((p.emergencyMonths - 2) / 6 * 20, -20, 20)
  // time horizon — longer means more room to recover from a drawdown
  c += clamp((p.primaryHorizonYears - 6) / 14 * 22, -16, 22)
  // dependents — familyCapacity runs 0.62 (sole earner) … 1.0 (no dependents)
  c += (p.familyCapacity - 0.81) / 0.19 * 14
  // EMI burden — committed outflows shrink the ability to absorb loss
  const emiRatio = p.takehome > 0 ? p.emi / p.takehome : 0
  c -= clamp(emiRatio * 60, 0, 22)
  // disposable surplus — free cash flow is itself loss-absorbing capacity
  const surplusRatio = p.takehome > 0 ? p.disposable / p.takehome : 0
  c += clamp((surplusRatio - 0.25) * 45, -12, 14)
  // existing wealth — a larger base absorbs drawdowns more comfortably
  c += CAP_WEALTH[p.wealthId] ?? 0
  // age — more earning years ahead means more capacity to recover
  if (p.age < 30) c += 8
  else if (p.age < 45) c += 2
  else if (p.age < 55) c -= 6
  else c -= 14
  return Math.round(clamp(c, 0, 100))
}

interface FundChoice {
  fundId: 'SMAF' | 'SAH' | 'SFC'
  growthScore: number   // 0–100 — the governed risk level used to pick the fund
  capacity: number      // 0–100 — financial ability
  willingness: number   // 0–100 — psychological appetite
}

/**
 * Computes risk capacity and willingness INDEPENDENTLY, governs the fund choice
 * by the LOWER of the two (you need both), then applies hard guard-rails.
 */
function chooseCoreFund(p: DerivedProfile, emergencyFirst: boolean): FundChoice {
  const capacity = riskCapacity(p)
  const willingness = riskWillingness(p)

  // The binding constraint is the lower of the two — a brave appetite cannot
  // override thin finances, and strong finances cannot override low comfort.
  const governing = Math.min(capacity, willingness)
  const avg = (capacity + willingness) / 2
  let growthScore = Math.round(0.82 * governing + 0.18 * avg)
  if (p.confidence < 0.60) growthScore = Math.max(0, growthScore - 6) // unsure → conservative

  // Base mapping along the Multi-Asset → Hybrid → Flexi-Cap gradient.
  let fundId: FundChoice['fundId'] =
    growthScore >= 62 ? 'SFC' : growthScore >= 38 ? 'SAH' : 'SMAF'

  // ── Hard suitability guard-rails (override the score) ──
  // Pure equity (Flexi Cap) needs a long horizon to ride out volatility.
  if (fundId === 'SFC' && p.primaryHorizonYears < 7) fundId = 'SAH'
  // A short horizon can't absorb equity drawdowns at all.
  if (p.primaryHorizonYears < 4) fundId = 'SMAF'
  // Someone who would sell in a crash should not be in a pure-equity fund.
  if (p.crashId === 'C_SELL') fundId = 'SMAF'
  // A near-term withdrawal need pulls one notch down toward stability.
  if (p.needsLiquiditySoon && fundId === 'SFC') fundId = 'SAH'
  // Building the emergency buffer first → the most defensive of the three.
  if (emergencyFirst) fundId = 'SMAF'

  return { fundId, growthScore, capacity, willingness }
}

// ─── Reasoning ────────────────────────────────────────────────────────────────
const CRASH_WORD: Record<string, string> = {
  C_BUY: 'invest even more', C_HOLD: 'stay invested', C_PAUSE: 'pause your SIP', C_SELL: 'sell out',
}

function primaryReason(p: DerivedProfile, emergencyFirst: boolean): string {
  if (emergencyFirst) return 'While you build your emergency buffer, '
  if (p.crashId === 'C_SELL') return 'Because you told us you would sell in a market crash, '
  if (p.needsLiquiditySoon) return 'Because you may need to withdraw money within a year, '
  if (p.primaryHorizonYears < 4) return `Because your goal is only ${Math.round(p.primaryHorizonYears)} years away, `
  if (p.experienceId === 'X_NONE') return 'As this is your first investment, '
  return 'Given your preference for a steady, low-drama journey, '
}

function fundRationale(
  fundId: string, p: DerivedProfile, emergencyFirst: boolean, tenureMonths: number,
): string {
  const years = Math.round(tenureMonths / 12)
  const crashWord = CRASH_WORD[p.crashId] ?? 'stay invested'

  if (fundId === 'SMAF') {
    return `${primaryReason(p, emergencyFirst)}Multi Asset Allocation is the most suitable fund for you. It spreads every rupee across equity, debt and gold — so when stock markets fall, the debt and gold holdings soften the blow and your journey stays far steadier than a pure-equity fund. It is the all-weather way to grow your money over the next ${years} year${years !== 1 ? 's' : ''}.`
  }
  if (fundId === 'SFC') {
    return `Flexi Cap is the most suitable fund for you. It is a pure-equity fund whose manager moves freely across large, mid and small companies to capture the best growth. Over your ${years}-year horizon — and because you said you would ${crashWord} in a market crash — it offers the highest long-term growth of the three. Equity has historically out-performed every other asset class over 10-plus years.`
  }
  // SAH
  return `Aggressive Hybrid is the most suitable fund for you. It keeps 65–80% in equity for growth and 20–35% in debt as a shock-absorber — the balanced middle path. You get more growth than a multi-asset fund and a smoother ride than pure equity, which fits your moderate risk appetite and ${years}-year horizon well.`
}

function reasonNotChosen(otherId: string, chosenId: string, p: DerivedProfile): string {
  if (otherId === 'SFC') {
    if (p.primaryHorizonYears < 7)
      return 'Flexi Cap is pure equity and needs a 7+ year horizon to ride out its swings — your goal arrives sooner than that.'
    if (p.crashId === 'C_SELL' || p.crashId === 'C_PAUSE')
      return 'Flexi Cap’s full-equity swings are sharper than your crash-scenario answer suggests you would be comfortable holding through.'
    return 'Flexi Cap carries more equity risk than your current profile calls for.'
  }
  if (otherId === 'SAH') {
    if (chosenId === 'SFC')
      return 'Aggressive Hybrid’s 20–35% debt would cap the long-term growth your horizon and risk appetite can pursue.'
    return 'Aggressive Hybrid runs higher equity and has no gold cushion — a little more risk than suits you right now.'
  }
  // SMAF
  if (chosenId === 'SFC')
    return 'Multi Asset’s debt and gold holdings would dilute the equity growth your profile is well-placed to capture.'
  return 'Multi Asset is a touch too conservative — your horizon and risk appetite can take a higher equity tilt.'
}

// ─── SHAP-style attribution ───────────────────────────────────────────────────
function buildShap(p: DerivedProfile, growthScore: number): ShapFactor[] {
  const crashWord = CRASH_WORD[p.crashId] ?? 'stay invested'
  return [
    {
      label: `Goal horizon — ${Math.round(p.primaryHorizonYears)} years`,
      weight: 0.27,
      direction: p.primaryHorizonYears >= 8 ? 'up' : 'down',
    },
    {
      label: `Risk appetite — ${growthScore} of 100`,
      weight: 0.24,
      direction: growthScore >= 50 ? 'up' : 'down',
    },
    {
      label: `Crash response — would ${crashWord}`,
      weight: 0.21,
      direction: (p.crashId === 'C_BUY' || p.crashId === 'C_HOLD') ? 'up' : 'down',
    },
    {
      label: p.experienceId === 'X_NONE' ? 'First-time investor' : 'Investing experience',
      weight: 0.16,
      direction: (p.experienceId === 'X_GOOD' || p.experienceId === 'X_EXP') ? 'up' : 'down',
    },
    {
      label: p.emergencyAdequate ? 'Emergency fund in place' : 'Thin emergency buffer',
      weight: 0.12,
      direction: p.emergencyAdequate ? 'up' : 'down',
    },
  ]
}

// ─── Main entry ───────────────────────────────────────────────────────────────
export function generateRecommendation(
  emp: EmployeeProfile,
  state: QuestionnaireState,
): AIRecommendation {
  const p = deriveProfile(emp, state)

  // Goal sequencing — an emergency buffer comes before any growth goal.
  const emergencyFirst = p.emergencyMonths < 1 && p.primaryGoal !== 'EMERGENCY'
  const effectiveGoal: PrimaryGoal = emergencyFirst ? 'EMERGENCY' : p.primaryGoal

  const tenureMonths = emergencyFirst ? 18 : computeTenure(p)
  const sipAmount = computeSIPAmount(emp, emergencyFirst ? { ...p, primaryGoal: 'EMERGENCY' } : p)

  // Choose the single most suitable fund of the three.
  const { fundId, growthScore, capacity, willingness } = chooseCoreFund(p, emergencyFirst)
  const fund = FUND_BY_ID[fundId]

  // Honest divergence note when capacity and willingness pull apart.
  const riskGap = willingness - capacity
  let riskNote: string | null = null
  if (riskGap > 18) {
    riskNote = 'You are willing to take on more risk than your finances can safely absorb right now — so your plan is sized to your financial capacity, not your appetite. As your emergency buffer and income grow, you can step it up.'
  } else if (riskGap < -18) {
    riskNote = 'Your finances could comfortably support a higher-equity plan, but we have respected the level of risk you are personally comfortable with. You can always raise the equity tilt later.'
  }

  const projectedCorpus = sipFutureValue(sipAmount, tenureMonths, fund.threeYearReturn)
  const corpusP10 = sipFutureValue(sipAmount, tenureMonths, Math.max(2, fund.threeYearReturn - 6))
  const corpusP90 = sipFutureValue(sipAmount, tenureMonths, fund.threeYearReturn + 6)

  // Goal-attainment probability.
  const riskFit = 1 - Math.abs(fund.riskScore - p.riskScore) / 5
  const goalAttainmentProbability = clamp(
    0.57 + 0.20 * p.confidence + 0.10 * riskFit, 0.55, 0.93)

  // Confidence = profile completeness + how clear-cut the fund choice was.
  const boundaryDist = Math.min(
    Math.abs(growthScore - 38), Math.abs(growthScore - 62), growthScore, 100 - growthScore)
  const clarity = Math.min(1, boundaryDist / 22)
  const confidenceScore = clamp(0.66 + 0.18 * p.confidence + 0.14 * clarity, 0.66, 0.97)

  // The two funds that were not chosen, with the reason each lost.
  const considered = (['SMAF', 'SAH', 'SFC'] as const)
    .filter(id => id !== fundId)
    .map(id => ({ fund: FUND_BY_ID[id], reasonNotChosen: reasonNotChosen(id, fundId, p) }))

  const liquidityNote = p.needsLiquiditySoon
    ? 'You said you may need money within a year — keep that portion in a savings account or liquid fund. This SIP is for money you can leave invested for the full term.'
    : null

  return {
    fund,
    sipAmount,
    tenureMonths,
    projectedCorpus,
    corpusP10,
    corpusP90,
    primaryGoal: effectiveGoal,
    goalAttainmentProbability,
    stressFloorSIP: p.stressFloor,
    monthlyDisposable: p.disposable,
    reasoning: fundRationale(fundId, p, emergencyFirst, tenureMonths),
    confidenceScore,
    growthScore,
    riskCapacity: capacity,
    riskWillingness: willingness,
    riskNote,
    emergencyFirst,
    unmetNeed: p.has80CHeadroom ? 'ELSS_NOT_IN_UNIVERSE' : null,
    liquidityNote,
    shapFactors: buildShap(p, growthScore),
    considered,
  }
}
