import {
  Question,
  QuestionCode,
  QuestionnaireState,
  QAnswer,
  QOption,
  CashflowAnswer,
  GoalEntry,
  ThetaDim,
  THETA_DIMS,
} from './types'

// ════════════════════════════════════════════════════════════════════════════
//  THE 13-QUESTION BANK
//  M8 (adaptive questionnaire) renders the 9–11 highest-information questions.
// ════════════════════════════════════════════════════════════════════════════

export const QUESTION_BANK: Question[] = [
  {
    code: 'FAMILY',
    section: 'Your family',
    title: 'Who depends on you financially?',
    subtitle: 'This sets how much risk your situation can absorb.',
    type: 'single',
    mandatory: false,
    informs: { risk_capacity: 0.45, savings_capacity: 0.30 },
    options: [
      { id: 'SOLO',        emoji: '🧑',       label: 'Just me',                 sub: 'No dependents',                        clarity: 1.3 },
      { id: 'COUPLE',      emoji: '👫',       label: 'My spouse',               sub: 'Dual or single income, no kids',       clarity: 1.0 },
      { id: 'KIDS',        emoji: '👨‍👩‍👧',     label: 'Spouse & children',       sub: 'Young family',                         clarity: 1.0 },
      { id: 'PARENTS',     emoji: '👴',       label: 'Spouse, kids & parents',  sub: 'Multi-generational household',         clarity: 1.1 },
      { id: 'SOLE',        emoji: '🏠',       label: "I'm the sole earner",     sub: 'Entire family depends on my income',   clarity: 1.3 },
    ],
  },
  {
    code: 'CASHFLOW',
    section: 'Your cashflow',
    title: 'Your monthly money flow',
    subtitle: 'Take-home, fixed expenses and EMIs. Never shared with your employer.',
    type: 'cashflow',
    mandatory: true,
    informs: { savings_capacity: 0.70, risk_capacity: 0.25 },
  },
  {
    code: 'WEALTH',
    section: 'Your savings',
    title: 'What have you already built up?',
    subtitle: 'Total of savings, FDs, mutual funds, gold and shares.',
    type: 'single',
    mandatory: false,
    informs: { risk_capacity: 0.35, experience_level: 0.25 },
    options: [
      { id: 'W_NONE',  emoji: '🌱', label: 'Just starting out',     sub: 'Under ₹50,000',         clarity: 1.2 },
      { id: 'W_LOW',   emoji: '🪴', label: '₹50,000 – ₹3 Lakh',     sub: 'A small cushion',       clarity: 1.0 },
      { id: 'W_MID',   emoji: '🌳', label: '₹3 Lakh – ₹15 Lakh',    sub: 'A solid base',          clarity: 1.0 },
      { id: 'W_HIGH',  emoji: '🏦', label: 'Above ₹15 Lakh',        sub: 'Substantial wealth',    clarity: 1.2 },
    ],
  },
  {
    code: 'EMERGENCY',
    section: 'Safety net',
    title: 'If income stopped today...',
    subtitle: 'How many months could your liquid savings cover expenses?',
    type: 'single',
    mandatory: false,
    informs: { liquidity_constraint: 0.45, risk_capacity: 0.30 },
    options: [
      { id: 'E_0',   emoji: '🔴', label: 'Less than 1 month',  sub: 'No real safety net yet',   clarity: 1.3 },
      { id: 'E_1_3', emoji: '🟠', label: '1 – 3 months',       sub: 'A starter cushion',         clarity: 1.0 },
      { id: 'E_3_6', emoji: '🟡', label: '3 – 6 months',       sub: 'A healthy buffer',          clarity: 1.0 },
      { id: 'E_6P',  emoji: '🟢', label: 'More than 6 months', sub: 'Well protected',            clarity: 1.2 },
    ],
  },
  {
    code: 'SIP_STRESS',
    section: 'Stress test',
    title: 'A stress test',
    subtitle: 'If your income dropped 20% for 6 months, what SIP could you still keep going?',
    type: 'single',
    mandatory: false,
    informs: { savings_capacity: 0.40, behavioral_bias: 0.25 },
    options: [
      { id: 'S_500',   label: 'Around ₹500',         sub: 'Keep it minimal but never stop',  clarity: 1.1 },
      { id: 'S_1500',  label: '₹1,000 – ₹2,000',     sub: 'A modest steady amount',          clarity: 1.0 },
      { id: 'S_4000',  label: '₹2,000 – ₹5,000',     sub: 'A comfortable commitment',        clarity: 1.0 },
      { id: 'S_8000',  label: '₹5,000 – ₹10,000',    sub: 'A strong commitment',             clarity: 1.1 },
      { id: 'S_15000', label: 'Above ₹10,000',       sub: 'A high, resilient commitment',    clarity: 1.2 },
    ],
  },
  {
    code: 'GOALS',
    section: 'Your goals',
    title: 'What are you investing for?',
    subtitle: 'Pick up to 3. Your first pick becomes the primary goal.',
    type: 'goals',
    mandatory: true,
    informs: { horizon_profile: 0.75 },
  },
  {
    code: 'CRASH',
    section: 'Risk check',
    title: 'Markets just fell sharply',
    subtitle: 'Your ₹1,00,000 investment is worth ₹70,000 in a month. You...',
    type: 'single',
    mandatory: true,
    informs: { risk_preference: 0.55, behavioral_bias: 0.40 },
    options: [
      { id: 'C_SELL',   emoji: '😰', label: 'Sell everything now',         sub: 'I can\'t watch it fall further',     clarity: 1.3 },
      { id: 'C_PAUSE',  emoji: '😟', label: 'Pause my SIP and wait',       sub: 'Stop adding until things settle',    clarity: 1.0 },
      { id: 'C_HOLD',   emoji: '😐', label: 'Do nothing, stay invested',   sub: 'Ride it out',                        clarity: 1.0 },
      { id: 'C_BUY',    emoji: '😎', label: 'Invest more — it\'s on sale',  sub: 'Buy more units while cheap',         clarity: 1.3 },
    ],
  },
  {
    code: 'EXPERIENCE',
    section: 'Your experience',
    title: 'Your investing experience',
    subtitle: 'How familiar are you with mutual funds and equity?',
    type: 'single',
    mandatory: false,
    informs: { experience_level: 0.55, risk_preference: 0.20 },
    options: [
      { id: 'X_NONE',  emoji: '🆕', label: 'Complete beginner',  sub: 'This is my first investment',            clarity: 1.3 },
      { id: 'X_SOME',  emoji: '📘', label: 'Some experience',    sub: 'FDs, maybe a little mutual funds',       clarity: 1.0 },
      { id: 'X_GOOD',  emoji: '📈', label: 'Fairly experienced', sub: 'I invest in MFs regularly',              clarity: 1.0 },
      { id: 'X_EXP',   emoji: '🎯', label: 'Very experienced',   sub: 'I actively manage equity & funds',       clarity: 1.2 },
    ],
  },
  {
    code: 'LIQUIDITY',
    section: 'Liquidity',
    title: 'Any big spend coming up?',
    subtitle: 'Will you need to pull money out within the next 12 months?',
    type: 'single',
    mandatory: false,
    informs: { liquidity_constraint: 0.55 },
    options: [
      { id: 'L_NO',    emoji: '✅', label: 'No, I can leave it invested', sub: 'Nothing planned for a year+',     clarity: 1.2 },
      { id: 'L_MAYBE', emoji: '🤔', label: 'Maybe, not sure',             sub: 'Possible but unplanned',          clarity: 0.8 },
      { id: 'L_YES',   emoji: '⚠️', label: 'Yes, I\'ll need some soon',   sub: 'A known expense within a year',   clarity: 1.2 },
    ],
  },
  {
    code: 'TAX',
    section: 'Tax',
    title: 'Your tax situation',
    subtitle: 'Helps us flag tax-saving options honestly.',
    type: 'single',
    mandatory: false,
    informs: { savings_capacity: 0.15 },
    options: [
      { id: 'T_NIL',     label: 'I pay little or no income tax',     sub: 'Below the taxable slab',            clarity: 1.0 },
      { id: 'T_OLD_80C', label: 'Old regime, 80C not yet full',      sub: 'Room for tax-saving investment',    clarity: 1.0 },
      { id: 'T_OLD_FULL',label: 'Old regime, 80C already full',      sub: 'EPF/insurance already cover it',    clarity: 1.0 },
      { id: 'T_NEW',     label: 'New regime',                        sub: 'No 80C deductions',                 clarity: 1.0 },
    ],
  },
  {
    code: 'INSURANCE',
    section: 'Protection',
    title: 'Your protection baseline',
    subtitle: 'Do you have term life and health cover? (We don\'t sell insurance — just checking.)',
    type: 'single',
    mandatory: false,
    informs: { protection_gap: 0.60 },
    options: [
      { id: 'I_BOTH', emoji: '🛡️', label: 'Both term & health cover', sub: 'Well protected',               clarity: 1.2 },
      { id: 'I_ONE',  emoji: '🩹', label: 'Only one of the two',      sub: 'Partial protection',            clarity: 1.0 },
      { id: 'I_NONE', emoji: '❗', label: 'Neither / not sure',       sub: 'A protection gap to close',     clarity: 1.2 },
    ],
  },
  {
    code: 'RISK_SCENARIO',
    section: 'Risk style',
    title: 'Steady vs. ambitious',
    subtitle: 'Two plans for the same goal — which feels right?',
    type: 'single',
    mandatory: false,
    informs: { risk_preference: 0.45, risk_capacity: 0.20 },
    options: [
      { id: 'R_STEADY', emoji: '🐢', label: 'Steady & predictable', sub: 'Smaller swings, more certain outcome', clarity: 1.2 },
      { id: 'R_BAL',    emoji: '⚖️', label: 'A balanced middle',     sub: 'Some ups and downs for better growth', clarity: 0.9 },
      { id: 'R_GROWTH', emoji: '🚀', label: 'Ambitious growth',      sub: 'Bigger swings for the highest corpus', clarity: 1.2 },
    ],
  },
  {
    code: 'PREFERENCES',
    section: 'Preferences',
    title: 'Any preferences?',
    subtitle: 'Optional — pick anything that matters to you.',
    type: 'multi',
    mandatory: false,
    informs: { risk_preference: 0.10 },
    options: [
      { id: 'P_ESG',      emoji: '🌍', label: 'Prefer responsible / ESG funds' },
      { id: 'P_GOLD',     emoji: '🥇', label: 'Like having some gold exposure' },
      { id: 'P_NO_SMALL', emoji: '🚫', label: 'Avoid small-cap / very volatile funds' },
      { id: 'P_LUMP',     emoji: '💰', label: 'May add lump sums, not just SIP' },
    ],
  },
]

export const QUESTION_BY_CODE: Record<QuestionCode, Question> =
  Object.fromEntries(QUESTION_BANK.map(q => [q.code, q])) as Record<QuestionCode, Question>

// ─── CASHFLOW sub-question bands (rendered inside the cashflow screen) ────────
export const CASHFLOW_TAKEHOME: QOption[] = [
  { id: 'TH_15',     label: 'Under ₹15,000' },
  { id: 'TH_15_30',  label: '₹15,000 – ₹30,000' },
  { id: 'TH_30_50',  label: '₹30,000 – ₹50,000' },
  { id: 'TH_50_80',  label: '₹50,000 – ₹80,000' },
  { id: 'TH_80_125', label: '₹80,000 – ₹1.25 Lakh' },
  { id: 'TH_125P',   label: 'Above ₹1.25 Lakh' },
]
export const CASHFLOW_EXPENSES: QOption[] = [
  { id: 'EX_10',  label: 'Under ₹10,000' },
  { id: 'EX_20',  label: '₹10,000 – ₹20,000' },
  { id: 'EX_35',  label: '₹20,000 – ₹35,000' },
  { id: 'EX_35P', label: 'Above ₹35,000' },
]
export const CASHFLOW_EMI: QOption[] = [
  { id: 'EMI_0',   label: 'No EMIs' },
  { id: 'EMI_10',  label: 'Under ₹10,000' },
  { id: 'EMI_25',  label: '₹10,000 – ₹25,000' },
  { id: 'EMI_25P', label: 'Above ₹25,000' },
]

// ─── Goal cards for the GOALS question ────────────────────────────────────────
export const GOAL_CARDS: { type: import('./types').PrimaryGoal; emoji: string; label: string; sub: string; defaultHorizon: number }[] = [
  { type: 'EMERGENCY',    emoji: '🛡️', label: 'Emergency Fund',     sub: 'A safety net',            defaultHorizon: 2 },
  { type: 'BIG_PURCHASE', emoji: '🚗', label: 'Big Purchase',        sub: 'Vehicle, wedding, trip',  defaultHorizon: 3 },
  { type: 'HOME',         emoji: '🏠', label: 'Home / Down Payment', sub: 'Buy or upgrade a home',   defaultHorizon: 7 },
  { type: 'CHILD_FUTURE', emoji: '🎓', label: "Child's Future",      sub: 'Education or marriage',   defaultHorizon: 12 },
  { type: 'RETIREMENT',   emoji: '🌅', label: 'Retirement',          sub: 'Long-term wealth',        defaultHorizon: 20 },
]

// ════════════════════════════════════════════════════════════════════════════
//  M8 — ADAPTIVE QUESTIONNAIRE ENGINE  (Bayesian-lite belief + EIG selection)
// ════════════════════════════════════════════════════════════════════════════

const STOP_UNCERTAINTY = 2.6  // sum-of-entropy threshold (8 dims start at 8.0);
                              // decisive users cross it at ~9, mixed at ~10–11
const MIN_QUESTIONS = 9
const MAX_QUESTIONS = 13
const MANDATORY: QuestionCode[] = ['CASHFLOW', 'GOALS', 'CRASH']

export function initQuestionnaire(): QuestionnaireState {
  const uncertainty = {} as Record<ThetaDim, number>
  THETA_DIMS.forEach(d => { uncertainty[d] = 1.0 })
  return { answers: {}, rendered: [], uncertainty, imputed: [] }
}

/** Expected Information Gain of asking a question given the current belief state. */
function expectedInfoGain(q: Question, uncertainty: Record<ThetaDim, number>): number {
  let gain = 0
  for (const dim of Object.keys(q.informs) as ThetaDim[]) {
    const strength = q.informs[dim] ?? 0
    gain += uncertainty[dim] * strength
  }
  return gain
}

/** Pick the next question to render, or null when the profile is sharp enough. */
export function selectNextQuestion(state: QuestionnaireState): QuestionCode | null {
  // Gentle opener: always start with FAMILY.
  if (state.rendered.length === 0) return 'FAMILY'

  const asked = new Set(state.rendered)
  const candidates = QUESTION_BANK.filter(q => !asked.has(q.code))
  if (candidates.length === 0) return null

  // Mandatory questions are never skipped — render them first by EIG.
  const mandatoryLeft = candidates.filter(q => MANDATORY.includes(q.code))
  if (mandatoryLeft.length > 0) {
    return mandatoryLeft
      .sort((a, b) => expectedInfoGain(b, state.uncertainty) - expectedInfoGain(a, state.uncertainty))[0]
      .code
  }

  // Stop early once the belief is sharp, the floor is met, and mandatories are done.
  const totalUncertainty = sumUncertainty(state)
  if (state.rendered.length >= MIN_QUESTIONS && totalUncertainty < STOP_UNCERTAINTY) {
    return null
  }
  if (state.rendered.length >= MAX_QUESTIONS) return null

  // Otherwise render the most informative remaining question.
  return candidates
    .sort((a, b) => expectedInfoGain(b, state.uncertainty) - expectedInfoGain(a, state.uncertainty))[0]
    .code
}

function sumUncertainty(state: QuestionnaireState): number {
  return THETA_DIMS.reduce((s, d) => s + state.uncertainty[d], 0)
}

/** How decisively a given answer sharpens the profile (0.7 vague … 1.3 decisive). */
function answerClarity(q: Question, value: QAnswer): number {
  if (q.type === 'single' && typeof value === 'string') {
    return q.options?.find(o => o.id === value)?.clarity ?? 1.0
  }
  if (q.type === 'cashflow') return 1.15 // a precise cashflow read is always informative
  if (q.type === 'goals') return Array.isArray(value) && value.length > 0 ? 1.2 : 0.8
  if (q.type === 'multi') return Array.isArray(value) && value.length > 0 ? 1.0 : 0.7
  return 1.0
}

/** Record an answer: store it and shrink posterior uncertainty on informed dims. */
export function recordAnswer(
  state: QuestionnaireState,
  code: QuestionCode,
  value: QAnswer,
): QuestionnaireState {
  const q = QUESTION_BY_CODE[code]
  const clarity = answerClarity(q, value)

  const uncertainty = { ...state.uncertainty }
  for (const dim of Object.keys(q.informs) as ThetaDim[]) {
    const strength = (q.informs[dim] ?? 0) * clarity
    uncertainty[dim] = Math.max(0.04, uncertainty[dim] * (1 - Math.min(0.95, strength)))
  }

  return {
    answers: { ...state.answers, [code]: value },
    rendered: state.rendered.includes(code) ? state.rendered : [...state.rendered, code],
    uncertainty,
    imputed: state.imputed,
  }
}

/** Mark every unasked question imputed-from-priors once the questionnaire stops. */
export function finalizeQuestionnaire(state: QuestionnaireState): QuestionnaireState {
  const asked = new Set(state.rendered)
  return {
    ...state,
    imputed: QUESTION_BANK.filter(q => !asked.has(q.code)).map(q => q.code),
  }
}

/** Profile-confidence score (0–1) — drives conservative-default fallback. */
export function profileConfidence(state: QuestionnaireState): number {
  const total = sumUncertainty(state)            // 8.0 unknown → ~1.5 well-known
  const fromBelief = 1 - Math.min(1, total / 8)
  const fromCoverage = state.rendered.length / 11
  return Math.min(0.99, 0.45 * fromBelief + 0.55 * Math.min(1, fromCoverage))
}

// ─── Default answers used when a question is imputed (skipped) ────────────────
export const IMPUTED_DEFAULTS: Record<QuestionCode, QAnswer> = {
  FAMILY:        'COUPLE',
  CASHFLOW:      { takehome: 'TH_30_50', expenses: 'EX_20', emi: 'EMI_10' } as CashflowAnswer,
  WEALTH:        'W_LOW',
  EMERGENCY:     'E_1_3',
  SIP_STRESS:    'S_1500',
  GOALS:         [{ type: 'RETIREMENT', horizonYears: 20 }] as GoalEntry[],
  CRASH:         'C_HOLD',
  EXPERIENCE:    'X_SOME',
  LIQUIDITY:     'L_MAYBE',
  TAX:           'T_NEW',
  INSURANCE:     'I_ONE',
  RISK_SCENARIO: 'R_BAL',
  PREFERENCES:   [] as string[],
}
