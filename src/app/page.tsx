'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

import WelcomeStep        from '@/components/steps/WelcomeStep'
import LoginStep          from '@/components/steps/LoginStep'
import GoalSelectStep     from '@/components/steps/GoalSelectStep'
import TunedPlanStep      from '@/components/steps/TunedPlanStep'
import IntentCapturedStep from '@/components/steps/IntentCapturedStep'
import LinkSentStep       from '@/components/steps/LinkSentStep'

// Progress breadcrumb mapping
const BREADCRUMB = [
  { key: 'welcome',         label: 'Welcome',      phase: null },
  { key: 'login',           label: 'Sign in',      phase: '1' },
  { key: 'goal-select',     label: 'Goal & fund',  phase: '1' },
  { key: 'tuned-plan',      label: 'AI plan',      phase: '1' },
  { key: 'intent-captured', label: 'Confirm',      phase: '1' },
  { key: 'link-sent',       label: 'KYC link',     phase: '1' },
]

export default function Home() {
  const { currentStep } = useSIPStore()

  const isWelcome = currentStep === 'welcome'
  const stepIndex = BREADCRUMB.findIndex(b => b.key === currentStep)
  const progressPct = Math.round(((stepIndex + 1) / BREADCRUMB.length) * 100)

  function renderStep() {
    switch (currentStep) {
      case 'welcome':         return <WelcomeStep />
      case 'login':           return <LoginStep />
      case 'goal-select':     return <GoalSelectStep />
      case 'tuned-plan':      return <TunedPlanStep />
      case 'intent-captured': return <IntentCapturedStep />
      case 'link-sent':       return <LinkSentStep />
      default:                return <WelcomeStep />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-shriram-cream">
      <SiteHeader />

      {/* ── Journey progress bar (hidden on welcome) ───────────────────── */}
      {!isWelcome && (
        <div className="bg-white border-b border-shriram-line sticky top-[71px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
            {/* Breadcrumb pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {BREADCRUMB.filter(b => b.phase !== null).map((b, i) => {
                const idx = BREADCRUMB.findIndex(x => x.key === currentStep)
                const myIdx = BREADCRUMB.findIndex(x => x.key === b.key)
                const done   = myIdx < idx
                const active = b.key === currentStep
                return (
                  <div key={b.key} className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full transition-colors ${
                      active ? 'bg-shriram-gold text-shriram-dark' :
                      done   ? 'bg-shriram-gold/15 text-shriram-gold border border-shriram-gold/30' :
                               'bg-shriram-line/60 text-shriram-muted/60'
                    }`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        active ? 'bg-shriram-dark/20' : done ? 'bg-shriram-gold/30' : 'bg-transparent'
                      }`}>
                        {done ? '✓' : i + 1}
                      </span>
                      {b.label}
                    </div>
                    {i < BREADCRUMB.filter(x => x.phase !== null).length - 1 && (
                      <div className={`w-5 h-px ${done ? 'bg-shriram-gold' : 'bg-shriram-line'} shrink-0`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Phase indicator */}
            <div className="shrink-0 hidden sm:flex items-center gap-2 text-[12px] text-shriram-muted font-semibold">
              <div className="h-1.5 w-32 bg-shriram-line rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-shriram-gold rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
              <span className="text-shriram-gold font-bold">{progressPct}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  )
}
