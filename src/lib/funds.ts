import { ShriramFund } from './types'

export const SHRIRAM_FUNDS: ShriramFund[] = [
  {
    id: 'SMAF',
    name: 'Shriram Multi Asset Allocation Fund',
    shortName: 'Multi Asset',
    category: 'MULTI_ASSET',
    riskLevel: 'Moderately High',
    riskScore: 3,
    minHorizonMonths: 36,
    maxHorizonMonths: 240,
    expenseRatio: 1.85,
    fiveYearReturn: 14.2,
    threeYearReturn: 12.8,
    oneYearReturn: 18.4,
    aum: 1240,
    peerPercentile: 72,
    goalTags: ['RETIREMENT', 'CHILD_FUTURE', 'HOME', 'BIG_PURCHASE'],
    description: 'Holds equity, debt and gold together (at least 10% in each). When equities fall, the debt and gold portions cushion the drop, so the ride is far smoother than a pure-equity fund. The manager rebalances across the three asset classes as markets move.',
    assetMix: 'Equity + Debt + Gold',
    bestFor: 'Cautious or first-time investors, anyone who would be anxious in a crash, or shorter (3–6 year) horizons — the steadiest all-weather choice.',
    drawdownNote: 'Shallowest falls of the three — gold and debt typically hold up when equities drop.',
    annualVolatility: 10,
    taxNote: 'Equity taxation when equity ≥ 65%: LTCG 12.5% after 1 year',
  },
  {
    id: 'SELS',
    name: 'Shriram ELSS Tax Saver Fund',
    shortName: 'ELSS Tax Saver',
    category: 'ELSS',
    riskLevel: 'Very High',
    riskScore: 4,
    minHorizonMonths: 36,
    maxHorizonMonths: 240,
    expenseRatio: 1.90,
    fiveYearReturn: 15.5,
    threeYearReturn: 13.8,
    oneYearReturn: 20.2,
    aum: 430,
    peerPercentile: 75,
    goalTags: ['CHILD_FUTURE', 'RETIREMENT', 'HOME'],
    description: 'Save tax under Section 80C while your money grows in equity. Features a mandatory 3-year lock-in, which is the shortest among all Section 80C options.',
    assetMix: 'Pure equity (tax saving)',
    bestFor: 'Tax savers looking for equity growth under Section 80C with a minimum 3-year lock-in.',
    drawdownNote: 'High equity exposure with a 3-year lock-in, meaning you cannot withdraw during market dips.',
    annualVolatility: 15,
    taxNote: 'Section 80C eligible. LTCG at 12.5% after 1 year on withdrawal',
  },
  {
    id: 'SFC',
    name: 'Shriram Flexi Cap Fund',
    shortName: 'Flexi Cap',
    category: 'FLEXI_CAP',
    riskLevel: 'High',
    riskScore: 4,
    minHorizonMonths: 60,
    maxHorizonMonths: 360,
    expenseRatio: 1.95,
    fiveYearReturn: 16.8,
    threeYearReturn: 14.5,
    oneYearReturn: 22.1,
    aum: 890,
    peerPercentile: 81,
    goalTags: ['RETIREMENT', 'CHILD_FUTURE', 'HOME'],
    description: 'A pure-equity fund. The manager invests freely across large, mid and small-cap companies — no fixed limits — to chase the best opportunities. Highest long-term growth potential of the three, and the sharpest swings.',
    assetMix: 'Pure equity (large + mid + small cap)',
    bestFor: 'Experienced, risk-tolerant investors with a long (7+ year) horizon who can stay calm through market crashes.',
    drawdownNote: 'Deepest falls of the three — no debt or gold cushion. Needs a long horizon to recover.',
    annualVolatility: 16,
    taxNote: 'Equity taxation: LTCG 12.5% after 1 year; STCG 20%',
  },
]

export const FUND_BY_ID = Object.fromEntries(SHRIRAM_FUNDS.map(f => [f.id, f]))

// The three funds shown on the goal/fund selection screen. Aggressive Hybrid
// and other categories were removed to keep the demo simple and mainstream.
export const DEMO_AVAILABLE_FUND_IDS = ['SMAF', 'SELS', 'SFC'] as const
export const DEMO_AVAILABLE_FUNDS = DEMO_AVAILABLE_FUND_IDS.map(id => FUND_BY_ID[id])

// Legacy alias used by the older single-step recommendation page (still referenced
// by the AI engine internals — safe to keep as a superset).
export const CORE_FUND_IDS = DEMO_AVAILABLE_FUND_IDS
export const CORE_FUNDS    = DEMO_AVAILABLE_FUNDS

export function formatCurrency(amount: number): string {
  if (amount >= 10_000_000) {
    return `Rs. ${(amount / 10_000_000).toFixed(2)} Cr`
  } else if (amount >= 100_000) {
    return `Rs. ${(amount / 100_000).toFixed(2)} Lakh`
  } else {
    return `Rs. ${amount.toLocaleString('en-IN')}`
  }
}

export function formatSIPAmount(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN')}/month`
}
