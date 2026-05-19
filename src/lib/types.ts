// ─── Journey ─────────────────────────────────────────────────────────────────
export type JourneyStep =
  | 'welcome'
  | 'login'
  | 'profile'
  | 'questions'
  | 'ai-loading'
  | 'recommendation'
  | 'mandate'
  | 'success'
  | 'dashboard'

// ─── Employee (SSO + Aadhaar age) ─────────────────────────────────────────────
export type CityTier = 'TIER1' | 'TIER2' | 'TIER3'

export interface EmployeeProfile {
  empId: string
  name: string
  age: number            // derived from Aadhaar DOB at KYC
  cityTier: CityTier
  designation: string    // from SSO — coarse signal, NOT salary
  location: string
  entity: string
  email: string
  mobile: string
  kycStatus: 'KYC_VALIDATED' | 'KYC_REGISTERED' | 'KYC_ON_HOLD'
}

// ─── Profile-state belief dimensions (θ) ──────────────────────────────────────
export type ThetaDim =
  | 'risk_capacity'
  | 'risk_preference'
  | 'savings_capacity'
  | 'horizon_profile'
  | 'behavioral_bias'
  | 'liquidity_constraint'
  | 'protection_gap'
  | 'experience_level'

export const THETA_DIMS: ThetaDim[] = [
  'risk_capacity', 'risk_preference', 'savings_capacity', 'horizon_profile',
  'behavioral_bias', 'liquidity_constraint', 'protection_gap', 'experience_level',
]

// ─── 13-question bank ─────────────────────────────────────────────────────────
export type QuestionCode =
  | 'FAMILY'
  | 'CASHFLOW'
  | 'WEALTH'
  | 'EMERGENCY'
  | 'SIP_STRESS'
  | 'GOALS'
  | 'CRASH'
  | 'EXPERIENCE'
  | 'LIQUIDITY'
  | 'TAX'
  | 'INSURANCE'
  | 'RISK_SCENARIO'
  | 'PREFERENCES'

export type QuestionType = 'single' | 'multi' | 'cashflow' | 'goals'

export interface QOption {
  id: string
  label: string
  sub?: string
  emoji?: string
  clarity?: number // 0.7 ambiguous … 1.3 decisive — how sharply this answer pins θ
}

export interface Question {
  code: QuestionCode
  section: string
  title: string
  subtitle: string
  type: QuestionType
  mandatory: boolean
  informs: Partial<Record<ThetaDim, number>> // base info strength per θ dim
  options?: QOption[]
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export type PrimaryGoal =
  | 'EMERGENCY'
  | 'BIG_PURCHASE'
  | 'CHILD_FUTURE'
  | 'HOME'
  | 'RETIREMENT'

export interface GoalEntry {
  type: PrimaryGoal
  horizonYears: number
}

// ─── Answer values ────────────────────────────────────────────────────────────
export interface CashflowAnswer {
  takehome: string
  expenses: string
  emi: string
}
export type QAnswer = string | string[] | CashflowAnswer | GoalEntry[]

// ─── Adaptive questionnaire state (the M8 belief state) ───────────────────────
export interface QuestionnaireState {
  answers: Partial<Record<QuestionCode, QAnswer>>
  rendered: QuestionCode[]                 // questions actually shown, in order
  uncertainty: Record<ThetaDim, number>    // posterior entropy proxy, 1.0 = unknown
  imputed: QuestionCode[]                  // skipped → filled from priors
}

// ─── Funds ────────────────────────────────────────────────────────────────────
export type FundCategory =
  | 'MULTI_ASSET'
  | 'FLEXI_CAP'
  | 'AGGRESSIVE_HYBRID'
  | 'LARGE_CAP'
  | 'REGULAR_SAVINGS'
  | 'LIQUID'
  | 'OVERNIGHT'
  | 'SHORT_DURATION'

export interface ShriramFund {
  id: string
  name: string
  shortName: string
  category: FundCategory
  riskLevel: 'Very Low' | 'Low' | 'Moderate' | 'Moderately High' | 'High'
  riskScore: number
  minHorizonMonths: number
  maxHorizonMonths: number
  expenseRatio: number
  fiveYearReturn: number
  threeYearReturn: number
  oneYearReturn: number
  aum: number
  peerPercentile: number // vs the full 44-AMC category — benchmark only
  goalTags: PrimaryGoal[]
  description: string
  taxNote: string
  assetMix?: string      // e.g. "Equity + Debt + Gold"
  bestFor?: string       // one-line suitability summary
  drawdownNote?: string  // how it behaves in a market fall
}

// ─── Recommendation ───────────────────────────────────────────────────────────
export interface ShapFactor {
  label: string
  weight: number // 0–1, signed share of the decision
  direction: 'up' | 'down'
}

export interface AIRecommendation {
  fund: ShriramFund
  sipAmount: number
  tenureMonths: number
  projectedCorpus: number
  corpusP10: number
  corpusP90: number
  primaryGoal: PrimaryGoal
  goalAttainmentProbability: number
  stressFloorSIP: number
  monthlyDisposable: number
  reasoning: string
  confidenceScore: number
  growthScore: number          // 0–100 — how aggressively the engine sized the user
  riskCapacity: number         // 0–100 — financial ability to absorb loss
  riskWillingness: number      // 0–100 — psychological appetite for risk
  riskNote: string | null      // set when capacity and willingness diverge
  emergencyFirst: boolean
  unmetNeed: string | null
  liquidityNote: string | null
  shapFactors: ShapFactor[]
  considered: Array<{          // the other two core funds + why they lost
    fund: ShriramFund
    reasonNotChosen: string
  }>
}

export interface SIPMandate {
  bankName: string
  accountNumber: string
  ifsc: string
  mandateDate: string
  mandateId: string
}
