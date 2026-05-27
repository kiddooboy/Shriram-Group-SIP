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
  // Journey
  currentStep: JourneyStep
  setStep: (step: JourneyStep) => void
  goNext: () => void
  goBack: () => void

  // Employee
  employee: EmployeeProfile | null
  setEmployee: (emp: EmployeeProfile) => void

  // Two-Phase Selections
  selectedFundId: string | null
  selectedGoal: string | null
  tunedSIPAmount: number
  consentChecked: boolean
  setSelectedFundId: (id: string | null) => void
  setSelectedGoal: (goal: string | null) => void
  setTunedSIPAmount: (amt: number) => void
  setConsentChecked: (checked: boolean) => void

  // Adaptive questionnaire (M8 belief state)
  questionnaire: QuestionnaireState
  currentQuestion: QuestionCode | null
  answerQuestion: (code: QuestionCode, value: QAnswer) => void
  advanceQuestionnaire: () => void   // → returns next question or marks done
  restartQuestionnaire: () => void

  // AI Recommendation
  recommendation: AIRecommendation | null
  setRecommendation: (rec: AIRecommendation) => void

  // Adjusted values
  adjustedSIP: number | null
  adjustedTenure: number | null
  adjustedFund: ShriramFund | null
  setAdjustedSIP: (amt: number) => void
  setAdjustedTenure: (months: number) => void
  setAdjustedFund: (fund: ShriramFund) => void

  // Mandate
  mandate: SIPMandate | null
  setMandate: (mandate: SIPMandate) => void

  reset: () => void
}

const STEP_ORDER: JourneyStep[] = [
  'welcome', 'login', 'funds-select', 'intent-captured',
  'goal-select', 'tuned-plan', 'kyc', 'activation', 'success', 'dashboard',
]

const GOAL_HORIZONS: Record<string, number> = {
  EMERGENCY: 2,
  BIG_PURCHASE: 3,
  HOME: 7,
  CHILD_FUTURE: 12,
  RETIREMENT: 20,
}

const GOAL_TARGETS: Record<string, number> = {
  EMERGENCY: 150000,
  BIG_PURCHASE: 500000,
  HOME: 5000000,
  CHILD_FUTURE: 3000000,
  RETIREMENT: 20000000,
}

export const useSIPStore = create<SIPStore>((set, get) => ({
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

  employee: null,
  setEmployee: (emp) => {
    // Seed default answers to have the questionnaire belief state fully initialized for the AI Engine
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

  selectedFundId: null,
  selectedGoal: null,
  tunedSIPAmount: 500,
  consentChecked: false,

  setSelectedFundId: (id) => set({ selectedFundId: id }),
  setSelectedGoal: (goal) => {
    if (!goal) {
      set({ selectedGoal: null })
      return
    }
    const horizon = GOAL_HORIZONS[goal] || 7
    const target = GOAL_TARGETS[goal] || 1000000
    // Record selection directly into questionnaire answers to drive the AI recommendation calculations
    const q = recordAnswer(get().questionnaire, 'GOALS', [{ type: goal as any, horizonYears: horizon, targetAmount: target }])
    set({ selectedGoal: goal, questionnaire: q })
  },
  setTunedSIPAmount: (amt) => set({ tunedSIPAmount: amt }),
  setConsentChecked: (checked) => set({ consentChecked: checked }),

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

  recommendation: null,
  setRecommendation: (rec) => set({ recommendation: rec }),

  adjustedSIP: null,
  adjustedTenure: null,
  adjustedFund: null,
  setAdjustedSIP: (amt) => set({ adjustedSIP: amt }),
  setAdjustedTenure: (months) => set({ adjustedTenure: months }),
  setAdjustedFund: (fund) => set({ adjustedFund: fund }),

  mandate: null,
  setMandate: (mandate) => set({ mandate }),

  reset: () =>
    set({
      currentStep: 'welcome',
      employee: null,
      selectedFundId: null,
      selectedGoal: null,
      tunedSIPAmount: 500,
      consentChecked: false,
      questionnaire: initQuestionnaire(),
      currentQuestion: 'FAMILY',
      recommendation: null,
      adjustedSIP: null,
      adjustedTenure: null,
      adjustedFund: null,
      mandate: null,
    }),
}))
