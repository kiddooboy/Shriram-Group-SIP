'use client'

import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'

import WelcomeStep from '@/components/steps/WelcomeStep'
import LoginStep from '@/components/steps/LoginStep'
import FundsSelectStep from '@/components/steps/FundsSelectStep'
import IntentCapturedStep from '@/components/steps/IntentCapturedStep'
import GoalSelectStep from '@/components/steps/GoalSelectStep'
import TunedPlanStep from '@/components/steps/TunedPlanStep'
import QuickKYCStep from '@/components/steps/QuickKYCStep'
import ActivationStep from '@/components/steps/ActivationStep'
import SuccessStep from '@/components/steps/SuccessStep'
import DashboardStep from '@/components/steps/DashboardStep'

const STEP_LIST = [
  'welcome',
  'funds-select',
  'intent-captured',
  'goal-select',
  'tuned-plan',
  'kyc',
  'activation',
  'success',
]

export default function Home() {
  const { currentStep } = useSIPStore()

  const isDashboard = currentStep === 'dashboard'
  const isLogin = currentStep === 'login'

  // Determine current step index and progress metrics
  const stepIndex = STEP_LIST.indexOf(currentStep)
  const stepNumber = stepIndex !== -1 ? stepIndex + 1 : 1
  const isPhase2 = stepNumber >= 4
  const progressPct = (stepNumber / 8) * 100
  const stepTxt = stepNumber <= 3 ? 'Phase 1' : stepNumber === 8 ? 'Done' : 'Phase 2'

  function renderStep() {
    switch (currentStep) {
      case 'welcome':         return <WelcomeStep />
      case 'login':           return <LoginStep />
      case 'funds-select':    return <FundsSelectStep />
      case 'intent-captured': return <IntentCapturedStep />
      case 'goal-select':     return <GoalSelectStep />
      case 'tuned-plan':      return <TunedPlanStep />
      case 'kyc':             return <QuickKYCStep />
      case 'activation':      return <ActivationStep />
      case 'success':         return <SuccessStep />
      case 'dashboard':       return <DashboardStep />
      default:                return <WelcomeStep />
    }
  }

  // Pure rendering for the dashboard — full view
  if (isDashboard) {
    return (
      <div className="bg-smf-app min-h-screen text-smf-ink relative">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-smf-bg-cream px-4 py-8 font-body">
      
      {/* Brand & Introduction Header */}
      <div className="text-center mb-5 max-w-[420px] font-body">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-smf-teal font-display block">
          Shriram GSIP
        </span>
        <h1 className="text-[25px] font-extrabold tracking-tight text-smf-teal-dark mt-1 mb-1.5 font-display">
          The Two-Phase One-Click Journey
        </h1>
        <p className="text-smf-muted text-[13px] leading-normal font-medium">
          Tap through it as an employee would. Phase 1 captures intent in one click; Phase 2 completes the rest as guided micro-steps.
        </p>
      </div>

      {/* Phase Navigation Tabs */}
      {!isLogin && (
        <div className="flex gap-2.5 mb-4">
          <div
            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-colors ${
              !isPhase2
                ? 'bg-smf-teal text-white border-smf-teal'
                : 'bg-white text-smf-muted border-smf-line'
            }`}
          >
            Phase 1 · Intent
          </div>
          <div
            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-colors ${
              isPhase2 && stepNumber !== 8
                ? 'bg-smf-amber text-white border-smf-amber'
                : 'bg-white text-smf-muted border-smf-line'
            }`}
          >
            Phase 2 · Completion
          </div>
        </div>
      )}

      {/* Phone Simulator Wrapper */}
      <div className="w-full max-w-[390px] bg-white rounded-[34px] p-2 border border-black/5 shadow-[0_24px_60px_-20px_rgba(7,61,47,0.25),0_4px_14px_rgba(0,0,0,0.05)] relative">
        <div className="bg-smf-app rounded-[26px] h-[720px] overflow-hidden flex flex-col relative">
          
          {/* Statusbar & Internal Progress Indicator */}
          {!isLogin && (
            <div className="shrink-0 bg-smf-app pt-4 pb-2 z-30 font-body">
              <div className="flex justify-between items-center px-5 text-[11px] font-bold text-smf-muted">
                <span className="flex items-center gap-1.5 text-smf-teal-dark">
                  <span className="w-1.5 h-1.5 rounded-full bg-smf-teal-mid" />
                  Shriram GSIP
                </span>
                <span>{stepTxt}</span>
              </div>
              
              {/* Horizontal Progress Bar */}
              <div className="h-[3.5px] bg-smf-line mx-5 mt-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{
                    width: `${progressPct}%`,
                    backgroundColor: isPhase2 ? '#B5731B' : '#0B5C47',
                  }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Active step screen viewport */}
          <div className="flex-1 min-h-0 flex flex-col">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              {renderStep()}
            </motion.div>
          </div>
          
        </div>
      </div>

      {/* Legal & Compliance footer disclaimer */}
      <div className="max-w-[420px] text-center text-[11px] text-smf-muted mt-5 leading-normal font-medium font-body px-1">
        Prototype for internal review. Names, figures, and the salary-deduction step are illustrative and subject to Legal &amp; Compliance sign-off. Projections assume an indicative 11% annualized return over 30 years and are not guaranteed.
      </div>
      
    </div>
  )
}
