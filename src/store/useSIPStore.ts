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
  'welcome', 'login', 'profile', 'questions',
  'ai-loading', 'recommendation', 'mandate', 'success', 'dashboard',
]

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
  setEmployee: (emp) => set({ employee: emp }),

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
      questionnaire: initQuestionnaire(),
      currentQuestion: 'FAMILY',
      recommendation: null,
      adjustedSIP: null,
      adjustedTenure: null,
      adjustedFund: null,
      mandate: null,
    }),
}))
