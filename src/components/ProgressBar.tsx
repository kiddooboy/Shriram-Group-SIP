'use client'

import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import { JourneyStep } from '@/lib/types'

const VISIBLE_STEPS: JourneyStep[] = [
  'login', 'funds-select', 'intent-captured', 'goal-select', 'tuned-plan', 'kyc', 'activation', 'success',
]

const STEP_NAMES: Record<string, string> = {
  login: 'Verify',
  'funds-select': 'Funds',
  'intent-captured': 'Captured',
  'goal-select': 'Goal',
  'tuned-plan': 'AI Tuning',
  kyc: 'KYC',
  activation: 'Activate',
  success: 'Done',
}

export default function ProgressBar() {
  const { currentStep } = useSIPStore()
  const currentIdx = VISIBLE_STEPS.indexOf(currentStep as JourneyStep)
  if (currentIdx === -1) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-cred-black/85 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-5 py-3">
        <div className="flex items-center gap-1.5">
          {VISIBLE_STEPS.map((step, idx) => (
            <div key={step} className="flex-1 h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
              <motion.div
                className="h-full bg-shriram-orange rounded-full"
                initial={false}
                animate={{ width: idx <= currentIdx ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/30 text-[11px] font-medium">
            Step {currentIdx + 1} of {VISIBLE_STEPS.length}
          </span>
          <span className="text-shriram-orange text-[11px] font-semibold uppercase tracking-wide">
            {STEP_NAMES[currentStep]}
          </span>
        </div>
      </div>
    </div>
  )
}
