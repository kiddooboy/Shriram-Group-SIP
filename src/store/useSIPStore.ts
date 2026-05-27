import { create } from 'zustand'
import {
  JourneyStep,
  EmployeeProfile,
  AIRecommendation,
  SIPMandate,
  ShriramFund,
  QuestionnaireState,
  QuestionCode,
  QAnswer,
} from '@/lib/types'
import {
  initQuestionnaire,
  recordAnswer,
  selectNextQuestion,
  finalizeQuestionnaire,
} from '@/lib/questionnaire'

interface SIPStore {
  // ── Journey ──────────────────────────────────────────────────────────────
  currentStep: JourneyStep
  setStep: (step: JourneyStep) => void
  goNext: () => void
  goBack: () => void

  // ── Identity (user-entered — no mock lookup needed) ───────────────────
  empId: string
  employeeName: string
  mobile: string
  registrationId: number | null
  setEmpId: (id: string) => void
  setEmployeeName: (name: string) => void
  setMobile: (mobile: string) => void
  setRegistrationId: (id: number) => void

  // ── Legacy employee profile (kept for AI engine compatibility) ────────
  employee: EmployeeProfile | null
  setEmployee: (emp: EmployeeProfile) => void

  // ── Two-Phase Selections ──────────────────────────────────────────────
  selectedFundId: string | null
  selectedGoal: string | null
  tunedSIPAmount: number
  consentChecked: boolean
  setSelectedFundId: (id: string | null) => void
  setSelectedGoal: (goal: string | null) => void
  setTunedSIPAmount: (amt: number) => void
  setConsentChecked: (checked: boolean) => void

  // ── Adaptive questionnaire (M8 belief state) ─────────────────────────
  questionnaire: QuestionnaireState
  currentQuestion: QuestionCode | null
  answerQuestion: (code: QuestionCode, value: QAnswer) => void
  advanceQuestionnaire: () => void
  restartQuestionnaire: () => void

  // ── AI Recommendation ─────────────────────────────────────────────────
  recommendation: AIRecommendation | null
  setRecommendation: (rec: AIRecommendation) => void

  // ── Adjusted values ───────────────────────────────────────────────────
  adjustedSIP: number | null
  adjustedTenure: number | null
  adjustedFund: ShriramFund | null
  setAdjustedSIP: (amt: number) => void
  setAdjustedTenure: (months: number) => void
  setAdjustedFund: (fund: ShriramFund) => void

  // ── Mandate ───────────────────────────────────────────────────────────
  mandate: SIPMandate | null
  setMandate: (mandate: SIPMandate) => void

  reset: () => void
}

// Phase 1 only main flow — Phase 2 steps exist but are future/separate flow
const STEP_ORDER: JourneyStep[] = [
  'welcome', 'login', 'funds-select', 'intent-captured', 'link-sent',
]

const GOAL_HORIZONS: Record<string, number> = {
  EMERGENCY: 2, BIG_PURCHASE: 3, HOME: 7, CHILD_FUTURE: 12, RETIREMENT: 20,
}
const GOAL_TARGETS: Record<string, number> = {
  EMERGENCY: 150000, BIG_PURCHASE: 500000, HOME: 5000000,
  CHILD_FUTURE: 3000000, RETIREMENT: 20000000,
}

// Default synthetic employee profile for AI engine (used when no HRMS data available)
function createDefaultEmployee(empId: string, name: string, mobile: string): EmployeeProfile {
  return {
    empId,
    name,
    age: 32,
    cityTier: 'TIER2',
    designation: 'Associate',
    location: 'Chennai',
    entity: 'Shriram Finance',
    email: `${empId.toLowerCase()}@shriram.com`,
    mobile,
    kycStatus: 'KYC_REGISTERED',
  }
}

export const useSIPStore = create<SIPStore>((set, get) => ({
  // ── Journey ──────────────────────────────────────────────────────────────
  currentStep: 'welcome',
  setStep: (step) => set({ currentStep: step }),
  goNext: () => {
    const idx = STEP_ORDER.indexOf(get().currentStep)
    if (idx < STEP_ORDER.length - 1) set({ currentStep: STEP_ORDER[idx + 1] })
  },
  goBack: () => {
    const idx = STEP_ORDER.indexOf(get().currentStep)
    if (idx > 0) set({ currentStep: STEP_ORDER[idx - 1] })
  },

  // ── Identity ──────────────────────────────────────────────────────────
  empId: '',
  employeeName: '',
  mobile: '',
  registrationId: null,
  setEmpId: (id) => set({ empId: id }),
  setEmployeeName: (name) => set({ employeeName: name }),
  setMobile: (mobile) => set({ mobile }),
  setRegistrationId: (id) => set({ registrationId: id }),

  // ── Legacy employee profile ───────────────────────────────────────────
  employee: null,
  setEmployee: (emp) => {
    // Seed default answers to have the questionnaire fully initialized for AI engine
    let q = initQuestionnaire()
    q = recordAnswer(q, 'FAMILY', 'COUPLE')
    q = recordAnswer(q, 'CASHFLOW', { takehome: 'TH_30_50', expenses: 'EX_20', emi: 'EMI_10' })
    q = recordAnswer(q, 'WEALTH', 'W_LOW')
    q = recordAnswer(q, 'EMERGENCY', 'E_1_3')
    q = recordAnswer(q, 'SIP_STRESS', 'S_1500')
    q = recordAnswer(q, 'CRASH', 'C_HOLD')
    q = recordAnswer(q, 'EXPERIENCE', 'X_SOME')
    q = recordAnswer(q, 'LIQUIDITY', 'L_MAYBE')
    q = recordAnswer(q, 'TAX', 'T_NEW')
    q = recordAnswer(q, 'INSURANCE', 'I_ONE')
    q = recordAnswer(q, 'RISK_SCENARIO', 'R_BAL')
    q = recordAnswer(q, 'PREFERENCES', [])
    q = finalizeQuestionnaire(q)
    set({ employee: emp, questionnaire: q })
  },

  // ── Two-Phase Selections ──────────────────────────────────────────────
  selectedFundId: null,
  selectedGoal: null,
  tunedSIPAmount: 500,
  consentChecked: false,
  setSelectedFundId: (id) => set({ selectedFundId: id }),
  setSelectedGoal: (goal) => {
    if (!goal) { set({ selectedGoal: null }); return }
    const horizon = GOAL_HORIZONS[goal] || 7
    const target = GOAL_TARGETS[goal] || 1000000
    const q = recordAnswer(get().questionnaire, 'GOALS', [{ type: goal as any, horizonYears: horizon, targetAmount: target }])
    set({ selectedGoal: goal, questionnaire: q })
  },
  setTunedSIPAmount: (amt) => set({ tunedSIPAmount: amt }),
  setConsentChecked: (checked) => set({ consentChecked: checked }),

  // ── Questionnaire ─────────────────────────────────────────────────────
  questionnaire: initQuestionnaire(),
  currentQuestion: 'FAMILY',
  answerQuestion: (code, value) => {
    const next = recordAnswer(get().questionnaire, code, value)
    set({ questionnaire: next })
  },
  advanceQuestionnaire: () => {
    const q = get().questionnaire
    const nextCode = selectNextQuestion(q)
    if (nextCode === null) {
      set({ questionnaire: finalizeQuestionnaire(q), currentQuestion: null })
    } else {
      set({ currentQuestion: nextCode })
    }
  },
  restartQuestionnaire: () =>
    set({ questionnaire: initQuestionnaire(), currentQuestion: 'FAMILY', recommendation: null }),

  // ── AI Recommendation ─────────────────────────────────────────────────
  recommendation: null,
  setRecommendation: (rec) => set({ recommendation: rec }),

  // ── Adjusted values ───────────────────────────────────────────────────
  adjustedSIP: null,
  adjustedTenure: null,
  adjustedFund: null,
  setAdjustedSIP: (amt) => set({ adjustedSIP: amt }),
  setAdjustedTenure: (months) => set({ adjustedTenure: months }),
  setAdjustedFund: (fund) => set({ adjustedFund: fund }),

  // ── Mandate ───────────────────────────────────────────────────────────
  mandate: null,
  setMandate: (mandate) => set({ mandate }),

  reset: () => set({
    currentStep: 'welcome',
    empId: '', employeeName: '', mobile: '', registrationId: null,
    employee: null,
    selectedFundId: null, selectedGoal: null, tunedSIPAmount: 500, consentChecked: false,
    questionnaire: initQuestionnaire(), currentQuestion: 'FAMILY',
    recommendation: null, adjustedSIP: null, adjustedTenure: null, adjustedFund: null,
    mandate: null,
  }),
}))

// Helper exported for LoginStep to build and seed the employee profile
export { createDefaultEmployee }
