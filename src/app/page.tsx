'use client'

import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import Header from '@/components/Header'
import ProgressBar from '@/components/ProgressBar'

import WelcomeStep from '@/components/steps/WelcomeStep'
import LoginStep from '@/components/steps/LoginStep'
import ProfileStep from '@/components/steps/ProfileStep'
import QuestionsStep from '@/components/steps/QuestionsStep'
import AILoadingStep from '@/components/steps/AILoadingStep'
import RecommendationStep from '@/components/steps/RecommendationStep'
import MandateStep from '@/components/steps/MandateStep'
import SuccessStep from '@/components/steps/SuccessStep'
import DashboardStep from '@/components/steps/DashboardStep'

const STEPS_WITH_HEADER = ['login', 'profile', 'questions', 'ai-loading', 'recommendation', 'mandate', 'success', 'dashboard']
const STEPS_WITH_PROGRESS = ['login', 'questions', 'ai-loading', 'recommendation', 'mandate', 'success']

export default function Home() {
  const { currentStep } = useSIPStore()

  const showHeader = STEPS_WITH_HEADER.includes(currentStep)
  const showProgress = STEPS_WITH_PROGRESS.includes(currentStep)

  function renderStep() {
    switch (currentStep) {
      case 'welcome':        return <WelcomeStep />
      case 'login':          return <LoginStep />
      case 'profile':        return <ProfileStep />
      case 'questions':      return <QuestionsStep />
      case 'ai-loading':     return <AILoadingStep />
      case 'recommendation': return <RecommendationStep />
      case 'mandate':        return <MandateStep />
      case 'success':        return <SuccessStep />
      case 'dashboard':      return <DashboardStep />
      default:               return <WelcomeStep />
    }
  }

  return (
    <div className="relative bg-cred-black min-h-screen">
      {showHeader && <Header />}
      {showProgress && <ProgressBar />}

      {/* Plain keyed fade-in. No AnimatePresence / exit overlay — the page
          stays a single, normally-flowing, fully-scrollable document. */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {renderStep()}
      </motion.div>
    </div>
  )
}
