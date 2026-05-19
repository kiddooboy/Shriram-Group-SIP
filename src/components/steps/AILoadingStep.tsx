'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { generateRecommendation } from '@/lib/ai-engine'

const LOADING_STEPS = [
  { label: 'Building your profile embedding', duration: 600 },
  { label: 'Modelling savings capacity & risk', duration: 700 },
  { label: 'Reading the current market regime', duration: 600 },
  { label: 'Two-tower match across Shriram AMC funds', duration: 800 },
  { label: 'Optimising SIP amount & tenure', duration: 600 },
  { label: 'Projecting corpus — P10 / P50 / P90', duration: 600 },
  { label: 'Writing your plain-language rationale', duration: 500 },
]

export default function AILoadingStep() {
  const { employee, questionnaire, setRecommendation, goNext } = useSIPStore()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    let total = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    LOADING_STEPS.forEach((step, idx) => {
      timers.push(setTimeout(() => setActiveStep(idx), total))
      total += step.duration
    })
    timers.push(setTimeout(() => {
      try {
        if (employee) setRecommendation(generateRecommendation(employee, questionnaire))
      } catch (e) {
        console.error('Recommendation engine error:', e)
      }
      goNext()
    }, total + 400))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = ((activeStep + 1) / LOADING_STEPS.length) * 100

  return (
    <div className="cred-page relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[460px] cred-glow pointer-events-none" />
      <div className="relative px-6 pt-[140px] pb-10 flex flex-col items-center">

        {/* orb */}
        <div className="relative w-28 h-28 mb-9">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-shriram-orange/30 blur-2xl"
          />
          <motion.div
            animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-shriram-orange border-r-shriram-orange/30"
          />
          <motion.div
            animate={{ rotate: -360 }} transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border-2 border-transparent border-b-shriram-gold border-l-shriram-gold/30"
          />
          <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-shriram-orange/15 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-7 h-7">
              <path d="M20 4 L28 16 L40 16 L30 24 L34 36 L20 28 L6 36 L10 24 L0 16 L12 16 Z" fill="#F47920" />
            </svg>
          </div>
        </div>

        <span className="cred-label mb-2">AI Engine</span>
        <h1 className="text-[26px] font-extrabold tracking-tightest text-center mb-1.5">
          Building your plan
        </h1>
        <p className="text-white/40 text-[13px] text-center mb-9">
          8 models · personalised to your profile
        </p>

        {/* progress */}
        <div className="w-full max-w-sm h-[3px] bg-white/[0.08] rounded-full overflow-hidden mb-7">
          <motion.div className="h-full bg-orange-gradient rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* steps */}
        <div className="w-full max-w-sm space-y-2.5">
          {LOADING_STEPS.map((step, idx) => {
            if (idx > activeStep) return null
            const done = idx < activeStep
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: done ? 0.4 : 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-shriram-orange'}`}>
                  {done
                    ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    : <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
                <span className={`text-[13px] ${done ? 'text-white/40' : 'text-white font-medium'}`}>{step.label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
