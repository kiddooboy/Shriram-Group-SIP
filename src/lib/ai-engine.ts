import {
  EmployeeProfile,
  QuestionnaireState,
  QuestionCode,
  QAnswer,
  CashflowAnswer,
  GoalEntry,
  PrimaryGoal,
  AIRecommendation,
  GoalRecommendation,
  ShapFactor,
} from './types'
import { FUND_BY_ID } from './funds'
import { IMPUTED_DEFAULTS, profileConfidence } from './questionnaire'

// ════════════════════════════════════════════════════════════════════════════
//  M3 MATCHER + M6 OPTIMIZER (transparent heuristic, P1).
//  Per-goal sub-portfolios over the three core Shriram AMC funds:
//    SMAF — Multi Asset Allocation  (equity + debt + gold — most defensive)
//    SAH  — Aggressive Hybrid       (65–80% equity + debt — balanced middle)
//    SFC  — Flexi Cap               (pure equity — most aggressive)
//  Each user goal gets its own fund + SIP, sized from an inflation-adjusted
//  target via a Monte Carlo projection of the fund's return distribution.
// ════════════════════════════════════════════════════════════════════════════

const INFLATION_RATE = 0.06   // 6% annual — standard Indian planning assumption
const MC_PATHS = 1000          // Monte Carlo path count per goal
const CRASH_AT_MONTH = 36      // year-3 crash for the stress-test scenario
const CRASH_MULTIPLIER = 0.65  // 35% drawdown

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
  riskScore: number          // 1–5 — kept for fund-fit scoring
  primaryGoal: PrimaryGoal
  primaryHorizonYears: number
  allGoals: GoalEntry[]
  needsLiquiditySoon: boolean
  has80CHeadroom: boolean
  protectionGap: 'none' | 'partial' | 'full'
  avoidSmallCap: boolean
  crashId: string
  experienceId: string
  riskPrefId: string
  wealthId: string
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
  const primary = goals[0] ?? { type: 'RETIREMENT' as PrimaryGoal, horizonYears: 20, targetAmount: 2_00_00_000 }

  const crashId = ans(state, 'CRASH') as string
  const experienceId = ans(state, 'EXPERIENCE') as string
  const riskPrefId = ans(state, 'RISK_SCENARIO') as string
  const wealthId = ans(state, 'WEALTH') as string

  // ── Blended risk score (kept for the SHAP / fund-fit signal) ──
  let risk = 3
  risk += CRASH_RISK[crashId] ?? 0
  risk += SCENARIO_RISK[riskPrefId] ?? 0
  risk += FAMILY_RISK[ans(state, 'FAMILY') as string] ?? 0
  risk += WEALTH_RISK[wealthId] ?? 0
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

// ════════════════════════════════════════════════════════════════════════════
//  AFFORDABILITY — total monthly SIP the user can sustain across all goals
// ════════════════════════════════════════════════════════════════════════════

function affordableSIPCeiling(emp: EmployeeProfile, p: DerivedProfile): number {
  const savingsRate = p.emergencyAdequate ? 0.40 : 0.27
  const cityFactor = CITY_COST[emp.cityTier] ?? 1.0
  const rawSIP = (p.disposable / cityFactor) * savingsRate * p.familyCapacity

  // Blend cashflow-implied capacity with the stress-tested floor the user stated.
  let ceiling = 0.6 * rawSIP + 0.4 * p.stressFloor
  if (p.confidence < 0.60) ceiling = Math.min(ceiling, p.stressFloor * 1.4)

  const floored = Math.max(500, ceiling)
  const capped = Math.min(floored, p.takehome * 0.40, Math.max(500, p.disposable * 0.85))
  return Math.max(500, Math.round(capped / 500) * 500)
}

// ════════════════════════════════════════════════════════════════════════════
//  RISK CAPACITY (financial) and WILLINGNESS (psychological)
//  Computed PER goal — capacity uses the specific goal's horizon.
// ════════════════════════════════════════════════════════════════════════════

const WILLING_CRASH: Record<string, number> = { C_BUY: 30, C_HOLD: 15, C_PAUSE: -10, C_SELL: -32 }
const WILLING_PREF:  Record<string, number> = { R_GROWTH: 14, R_BAL: 0, R_STEADY: -16 }
const WILLING_EXP:   Record<string, number> = { X_EXP: 10, X_GOOD: 5, X_SOME: -2, X_NONE: -12 }
const CAP_WEALTH:    Record<string, number> = { W_HIGH: 12, W_MID: 6, W_LOW: 0, W_NONE: -6 }

function riskWillingness(p: DerivedProfile): number {
  let w = 50
  w += WILLING_CRASH[p.crashId] ?? 0
  w += WILLING_PREF[p.riskPrefId] ?? 0
  w += WILLING_EXP[p.experienceId] ?? 0
  return Math.round(clamp(w, 0, 100))
}

function riskCapacity(p: DerivedProfile, horizonYears: number): number {
  let c = 50
  c += clamp((p.emergencyMonths - 2) / 6 * 20, -20, 20)
  c += clamp((horizonYears - 6) / 14 * 22, -16, 22)
  c += (p.familyCapacity - 0.81) / 0.19 * 14
  const emiRatio = p.takehome > 0 ? p.emi / p.takehome : 0
  c -= clamp(emiRatio * 60, 0, 22)
  const surplusRatio = p.takehome > 0 ? p.disposable / p.takehome : 0
  c += clamp((surplusRatio - 0.25) * 45, -12, 14)
  c += CAP_WEALTH[p.wealthId] ?? 0
  if (p.age < 30) c += 8
  else if (p.age < 45) c += 2
  else if (p.age < 55) c -= 6
  else c -= 14
  return Math.round(clamp(c, 0, 100))
}

interface FundChoice {
  fundId: 'SMAF' | 'SAH' | 'SFC'
  growthScore: number
  capacity: number
  willingness: number
}

function chooseCoreFund(p: DerivedProfile, horizonYears: number): FundChoice {
  const capacity = riskCapacity(p, horizonYears)
  const willingness = riskWillingness(p)
  const governing = Math.min(capacity, willingness)
  const avg = (capacity + willingness) / 2
  let growthScore = Math.round(0.82 * governing + 0.18 * avg)
  if (p.confidence < 0.60) growthScore = Math.max(0, growthScore - 6)

  let fundId: FundChoice['fundId'] =
    growthScore >= 62 ? 'SFC' : growthScore >= 38 ? 'SAH' : 'SMAF'

  // Hard suitability guard-rails per goal horizon.
  if (fundId === 'SFC' && horizonYears < 7) fundId = 'SAH'
  if (horizonYears < 4) fundId = 'SMAF'
  if (p.crashId === 'C_SELL') fundId = 'SMAF'
  if (p.needsLiquiditySoon && fundId === 'SFC') fundId = 'SAH'

  return { fundId, growthScore, capacity, willingness }
}

// ════════════════════════════════════════════════════════════════════════════
//  FINANCIAL MATH — target inflation, required SIP, Monte Carlo
// ════════════════════════════════════════════════════════════════════════════

function targetFutureValue(targetToday: number, horizonYears: number): number {
  return targetToday * Math.pow(1 + INFLATION_RATE, horizonYears)
}

/** Reverse the SIP-FV formula: SIP needed so its future value equals targetFV. */
function requiredSIPForTarget(targetFV: number, months: number, annualReturn: number): number {
  const r = annualReturn / 100 / 12
  if (r === 0) return targetFV / months
  const factor = ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  return targetFV / factor
}

/** Box–Muller — one draw from a standard normal distribution. */
function boxMuller(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

interface MCOutput {
  p10: number
  p50: number
  p90: number
  attainmentProb: number
  crashStressProb: number
}

/**
 * Monte Carlo projection of an SIP corpus.
 * - 1,000 paths of lognormal-like monthly returns (mu = r/12, sigma = vol/√12)
 * - For each path, a parallel "crashed" path applies a 35% drawdown at month 36
 *   so we report goal-attainment under a 2008/2020-scale shock at year 3.
 */
function monteCarloProjection(
  sip: number, months: number,
  annualReturn: number, annualVolatility: number,
  targetFV: number,
): MCOutput {
  const mu = annualReturn / 100 / 12
  const sigma = (annualVolatility / 100) / Math.sqrt(12)

  const finals: number[] = new Array(MC_PATHS)
  const finalsCrash: number[] = new Array(MC_PATHS)

  for (let i = 0; i < MC_PATHS; i++) {
    let corpus = 0
    let corpusCrash = 0
    for (let m = 1; m <= months; m++) {
      const r = mu + sigma * boxMuller()
      const growth = 1 + r
      corpus = corpus * growth + sip
      corpusCrash = corpusCrash * growth + sip
      if (m === CRASH_AT_MONTH) corpusCrash *= CRASH_MULTIPLIER
    }
    finals[i] = corpus
    finalsCrash[i] = corpusCrash
  }

  finals.sort((a, b) => a - b)
  const pct = (arr: number[], q: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))]
  const attainmentProb = finals.filter(v => v >= targetFV).length / MC_PATHS
  const crashStressProb = finalsCrash.filter(v => v >= targetFV).length / MC_PATHS

  return {
    p10: pct(finals, 0.10),
    p50: pct(finals, 0.50),
    p90: pct(finals, 0.90),
    attainmentProb,
    crashStressProb,
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  REASONING — per-goal explanations and "why not the other two" notes
// ════════════════════════════════════════════════════════════════════════════

const CRASH_WORD: Record<string, string> = {
  C_BUY: 'invest even more', C_HOLD: 'stay invested', C_PAUSE: 'pause your SIP', C_SELL: 'sell out',
}

function primaryReasonPhrase(p: DerivedProfile, horizonYears: number): string {
  if (p.crashId === 'C_SELL') return 'Because you told us you would sell in a market crash, '
  if (p.needsLiquiditySoon) return 'Because you may need to withdraw money within a year, '
  if (horizonYears < 4) return `Because this goal is only ${Math.round(horizonYears)} years away, `
  if (p.experienceId === 'X_NONE') return 'As this is your first investment, '
  return 'Given your preference for a steady, low-drama journey, '
}

function fundRationale(
  fundId: string, p: DerivedProfile, horizonYears: number,
): string {
  const years = Math.round(horizonYears)
  const crashWord = CRASH_WORD[p.crashId] ?? 'stay invested'
  const yr = years === 1 ? 'year' : 'years'

  if (fundId === 'SMAF') {
    return `${primaryReasonPhrase(p, horizonYears)}Multi Asset Allocation is the most suitable fund for this goal. It spreads every rupee across equity, debt and gold — so when stock markets fall, the debt and gold holdings soften the blow and your journey stays far steadier than a pure-equity fund. It is the all-weather way to grow your money over the next ${years} ${yr}.`
  }
  if (fundId === 'SFC') {
    return `Flexi Cap is the most suitable fund for this goal. It is a pure-equity fund whose manager moves freely across large, mid and small companies to capture the best growth. Over your ${years}-${yr.replace(/s$/,'')} horizon — and because you said you would ${crashWord} in a market crash — it offers the highest long-term growth of the three. Equity has historically out-performed every other asset class over 10-plus years.`
  }
  // SAH
  return `Aggressive Hybrid is the most suitable fund for this goal. It keeps 65–80% in equity for growth and 20–35% in debt as a shock-absorber — the balanced middle path. You get more growth than a multi-asset fund and a smoother ride than pure equity, which fits your moderate risk appetite and ${years}-${yr.replace(/s$/,'')} horizon well.`
}

function reasonNotChosen(
  otherId: string, chosenId: string, p: DerivedProfile, horizonYears: number,
): string {
  if (otherId === 'SFC') {
    if (horizonYears < 7) return "Flexi Cap is pure equity and needs a 7+ year horizon to ride out its swings — this goal arrives sooner than that."
    if (p.crashId === 'C_SELL' || p.crashId === 'C_PAUSE') return "Flexi Cap's full-equity swings are sharper than your crash-scenario answer suggests you would be comfortable holding through."
    return 'Flexi Cap carries more equity risk than your current profile calls for.'
  }
  if (otherId === 'SAH') {
    if (chosenId === 'SFC') return "Aggressive Hybrid's 20–35% debt would cap the long-term growth your horizon and risk appetite can pursue."
    return 'Aggressive Hybrid runs higher equity and has no gold cushion — a little more risk than suits you right now.'
  }
  // SMAF
  if (chosenId === 'SFC') return "Multi Asset's debt and gold holdings would dilute the equity growth your profile is well-placed to capture."
  return 'Multi Asset is a touch too conservative — your horizon and risk appetite can take a higher equity tilt.'
}

// ─── SHAP-style attribution (profile-level — same as before) ──────────────────
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

// ════════════════════════════════════════════════════════════════════════════
//  MAIN ENTRY — per-goal recommendations + aggregates
// ════════════════════════════════════════════════════════════════════════════

const round500 = (v: number) => Math.max(500, Math.round(v / 500) * 500)

export function generateRecommendation(
  emp: EmployeeProfile,
  state: QuestionnaireState,
): AIRecommendation {
  const p = deriveProfile(emp, state)

  // Goal sequencing: if there's no emergency buffer and no explicit emergency
  // goal, insert one ahead of the user's stated goals so it gets funded too.
  const emergencyFirst = p.emergencyMonths < 1 && !p.allGoals.some(g => g.type === 'EMERGENCY')
  const allGoals: GoalEntry[] = emergencyFirst
    ? [{ type: 'EMERGENCY', horizonYears: 1.5, targetAmount: 1_50_000 }, ...p.allGoals]
    : p.allGoals

  const ceiling = affordableSIPCeiling(emp, p)

  // ── PASS 1 — per-goal fund choice and required SIP (uncapped) ──
  const pass1 = allGoals.map(goal => {
    const tenureMonths = clamp(Math.round(goal.horizonYears * 12), 12, 360)
    const targetFV = targetFutureValue(goal.targetAmount, goal.horizonYears)
    const choice = chooseCoreFund(p, goal.horizonYears)
    const fund = FUND_BY_ID[choice.fundId]
    const required = round500(requiredSIPForTarget(targetFV, tenureMonths, fund.threeYearReturn))
    return { goal, tenureMonths, targetFV, choice, fund, required }
  })

  const requiredSum = pass1.reduce((s, g) => s + g.required, 0)
  const anyShortfall = requiredSum > ceiling
  const scale = anyShortfall ? ceiling / requiredSum : 1

  // ── PASS 2 — scale to affordability, run Monte Carlo, build per-goal output ──
  const goals: GoalRecommendation[] = pass1.map(g => {
    const recommendedRaw = g.required * scale
    const recommendedSIP = anyShortfall ? round500(recommendedRaw) : g.required
    const shortfall = recommendedSIP < g.required
    const shortfallAmount = shortfall
      ? Math.max(0, g.targetFV * (1 - recommendedSIP / g.required))
      : 0
    const mc = monteCarloProjection(
      recommendedSIP, g.tenureMonths,
      g.fund.threeYearReturn, g.fund.annualVolatility ?? 12,
      g.targetFV,
    )
    const reasoning = fundRationale(g.choice.fundId, p, g.goal.horizonYears)
    const considered = (['SMAF', 'SAH', 'SFC'] as const)
      .filter(id => id !== g.choice.fundId)
      .map(id => ({
        fund: FUND_BY_ID[id],
        reasonNotChosen: reasonNotChosen(id, g.choice.fundId, p, g.goal.horizonYears),
      }))
    return {
      goal: g.goal,
      targetFutureValue: g.targetFV,
      fund: g.fund,
      requiredSIP: g.required,
      recommendedSIP,
      shortfall,
      shortfallAmount,
      tenureMonths: g.tenureMonths,
      projectedCorpus: mc.p50,
      corpusP10: mc.p10,
      corpusP90: mc.p90,
      goalAttainmentProbability: mc.attainmentProb,
      crashStressProbability: mc.crashStressProb,
      reasoning,
      considered,
    }
  })

  const totalMonthlySIP = goals.reduce((s, g) => s + g.recommendedSIP, 0)
  const primary = goals[0]
  const primaryChoice = pass1[0].choice

  // Capacity vs willingness — divergence note based on the primary goal's choice.
  const riskGap = primaryChoice.willingness - primaryChoice.capacity
  let riskNote: string | null = null
  if (riskGap > 18) {
    riskNote = 'You are willing to take on more risk than your finances can safely absorb right now — so your plan is sized to your financial capacity, not your appetite. As your emergency buffer and income grow, you can step it up.'
  } else if (riskGap < -18) {
    riskNote = 'Your finances could comfortably support a higher-equity plan, but we have respected the level of risk you are personally comfortable with. You can always raise the equity tilt later.'
  }

  // Confidence score = profile completeness + clarity of the band placement
  const gs = primaryChoice.growthScore
  const boundaryDist = Math.min(Math.abs(gs - 38), Math.abs(gs - 62), gs, 100 - gs)
  const clarity = Math.min(1, boundaryDist / 22)
  const confidenceScore = clamp(0.66 + 0.18 * p.confidence + 0.14 * clarity, 0.66, 0.97)

  const liquidityNote = p.needsLiquiditySoon
    ? 'You said you may need money within a year — keep that portion in a savings account or liquid fund. This SIP is for money you can leave invested for the full term.'
    : null

  return {
    // Primary-goal mirror fields (downstream Mandate / Success / Dashboard).
    fund: primary.fund,
    sipAmount: totalMonthlySIP,            // auto-debit total across all goals
    tenureMonths: primary.tenureMonths,
    projectedCorpus: primary.projectedCorpus,
    corpusP10: primary.corpusP10,
    corpusP90: primary.corpusP90,
    primaryGoal: primary.goal.type,
    goalAttainmentProbability: primary.goalAttainmentProbability,
    reasoning: primary.reasoning,

    // Per-goal sub-portfolios.
    goals,
    totalMonthlySIP,
    affordableSIPCeiling: ceiling,
    anyShortfall,

    // Profile-level.
    confidenceScore,
    growthScore: primaryChoice.growthScore,
    riskCapacity: primaryChoice.capacity,
    riskWillingness: primaryChoice.willingness,
    riskNote,
    emergencyFirst,
    unmetNeed: p.has80CHeadroom ? 'ELSS_NOT_IN_UNIVERSE' : null,
    liquidityNote,
    stressFloorSIP: p.stressFloor,
    monthlyDisposable: p.disposable,
    shapFactors: buildShap(p, primaryChoice.growthScore),
    considered: primary.considered,
  }
}
