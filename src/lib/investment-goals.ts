/**
 * Industry-standard goals used by leading SIP platforms. Each goal carries the
 * default horizon, indicative target corpus, risk profile, and the fund
 * categories that align with it — used by the split-screen goal/fund picker
 * and the rule-based recommendation engine.
 *
 * Targets are stated in today's rupees; the recommendation engine inflates them
 * to future value using a configurable inflation assumption.
 */
import type { LucideIcon } from 'lucide-react'
import {
  Sprout, Sunset, GraduationCap, HeartHandshake, Home, Car,
  ShieldAlert, Receipt, Palmtree, PiggyBank,
} from 'lucide-react'

export type InvestmentGoalId =
  | 'WEALTH_CREATION'
  | 'RETIREMENT'
  | 'CHILD_EDUCATION'
  | 'CHILD_MARRIAGE'
  | 'DREAM_HOME'
  | 'CAR_PURCHASE'
  | 'EMERGENCY_FUND'
  | 'TAX_SAVING'
  | 'VACATION'
  | 'PASSIVE_INCOME'

export type RiskLevel = 'Low' | 'Moderate' | 'High'

export interface InvestmentGoal {
  id:                 InvestmentGoalId
  label:              string
  icon:               LucideIcon
  description:        string
  defaultHorizonYrs:  number
  defaultTargetINR:   number       // today's rupees
  risk:               RiskLevel
  /** Fund categories this goal naturally aligns to. Earlier entries rank higher. */
  preferredCategories: string[]
  /** Used by the engine when no fund-specific return is available. */
  fallbackAnnualReturn: number     // % per year
}

export const INVESTMENT_GOALS: InvestmentGoal[] = [
  {
    id: 'WEALTH_CREATION',
    label: 'Wealth Creation',
    icon: Sprout,
    description: 'Build long-term wealth through equity-led compounding.',
    defaultHorizonYrs: 10,
    defaultTargetINR: 2_500_000,
    risk: 'High',
    preferredCategories: ['FLEXI_CAP', 'LARGE_CAP', 'AGGRESSIVE_HYBRID', 'MULTI_ASSET'],
    fallbackAnnualReturn: 13,
  },
  {
    id: 'RETIREMENT',
    label: 'Retirement Planning',
    icon: Sunset,
    description: 'Replace your salary with passive income after retirement.',
    defaultHorizonYrs: 20,
    defaultTargetINR: 20_000_000,
    risk: 'High',
    preferredCategories: ['FLEXI_CAP', 'LARGE_CAP', 'AGGRESSIVE_HYBRID', 'MULTI_ASSET'],
    fallbackAnnualReturn: 12,
  },
  {
    id: 'CHILD_EDUCATION',
    label: 'Child Education',
    icon: GraduationCap,
    description: "Fund your child's higher education — UG, PG, or abroad.",
    defaultHorizonYrs: 12,
    defaultTargetINR: 4_000_000,
    risk: 'High',
    preferredCategories: ['FLEXI_CAP', 'AGGRESSIVE_HYBRID', 'MULTI_ASSET', 'LARGE_CAP'],
    fallbackAnnualReturn: 12.5,
  },
  {
    id: 'CHILD_MARRIAGE',
    label: 'Child Marriage',
    icon: HeartHandshake,
    description: 'Build a dedicated corpus for your child\'s wedding expenses.',
    defaultHorizonYrs: 15,
    defaultTargetINR: 3_000_000,
    risk: 'Moderate',
    preferredCategories: ['MULTI_ASSET', 'AGGRESSIVE_HYBRID', 'FLEXI_CAP', 'LARGE_CAP'],
    fallbackAnnualReturn: 11.5,
  },
  {
    id: 'DREAM_HOME',
    label: 'Dream Home',
    icon: Home,
    description: 'Save for a down payment or buy your first/second home outright.',
    defaultHorizonYrs: 7,
    defaultTargetINR: 5_000_000,
    risk: 'High',
    preferredCategories: ['FLEXI_CAP', 'AGGRESSIVE_HYBRID', 'LARGE_CAP', 'MULTI_ASSET'],
    fallbackAnnualReturn: 12,
  },
  {
    id: 'CAR_PURCHASE',
    label: 'Car Purchase',
    icon: Car,
    description: 'Save for a new car without taking a loan.',
    defaultHorizonYrs: 4,
    defaultTargetINR: 1_500_000,
    risk: 'Moderate',
    preferredCategories: ['MULTI_ASSET', 'AGGRESSIVE_HYBRID', 'SHORT_DURATION', 'REGULAR_SAVINGS'],
    fallbackAnnualReturn: 10,
  },
  {
    id: 'EMERGENCY_FUND',
    label: 'Emergency Fund',
    icon: ShieldAlert,
    description: '6 months of expenses parked in liquid, instant-access funds.',
    defaultHorizonYrs: 2,
    defaultTargetINR: 300_000,
    risk: 'Low',
    preferredCategories: ['LIQUID', 'OVERNIGHT', 'REGULAR_SAVINGS', 'SHORT_DURATION'],
    fallbackAnnualReturn: 7,
  },
  {
    id: 'TAX_SAVING',
    label: 'Tax Saving (80C)',
    icon: Receipt,
    description: 'Save tax under Section 80C while your equity grows.',
    defaultHorizonYrs: 5,
    defaultTargetINR: 750_000,
    risk: 'High',
    preferredCategories: ['ELSS'],
    fallbackAnnualReturn: 14,
  },
  {
    id: 'VACATION',
    label: 'Vacation Planning',
    icon: Palmtree,
    description: 'Save for a memorable family vacation — domestic or international.',
    defaultHorizonYrs: 2,
    defaultTargetINR: 400_000,
    risk: 'Low',
    preferredCategories: ['LIQUID', 'SHORT_DURATION', 'REGULAR_SAVINGS'],
    fallbackAnnualReturn: 7.5,
  },
  {
    id: 'PASSIVE_INCOME',
    label: 'Passive Income',
    icon: PiggyBank,
    description: 'Generate a steady monthly cashflow from your investments.',
    defaultHorizonYrs: 15,
    defaultTargetINR: 7_500_000,
    risk: 'Moderate',
    preferredCategories: ['MULTI_ASSET', 'REGULAR_SAVINGS', 'AGGRESSIVE_HYBRID', 'SHORT_DURATION'],
    fallbackAnnualReturn: 10.5,
  },
]

export const GOAL_BY_ID = Object.fromEntries(INVESTMENT_GOALS.map(g => [g.id, g])) as Record<InvestmentGoalId, InvestmentGoal>

/** Rank-order Shriram funds for a given goal: preferred categories first, then by 5-year return. */
export function rankFundsForGoal(goalId: InvestmentGoalId, allFunds: { id: string; category: string; fiveYearReturn: number }[]): string[] {
  const goal = GOAL_BY_ID[goalId]
  if (!goal) return allFunds.map(f => f.id)
  const priority = (cat: string) => {
    const idx = goal.preferredCategories.indexOf(cat)
    return idx === -1 ? 999 : idx
  }
  return [...allFunds]
    .sort((a, b) => priority(a.category) - priority(b.category) || b.fiveYearReturn - a.fiveYearReturn)
    .map(f => f.id)
}
