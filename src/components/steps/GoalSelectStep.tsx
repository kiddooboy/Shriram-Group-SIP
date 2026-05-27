'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSIPStore } from '@/store/useSIPStore'
import { PrimaryGoal } from '@/lib/types'

interface GoalOption {
  id: PrimaryGoal
  label: string
  emoji: string
  desc: string
  spanFull?: boolean
}

const goalsList: GoalOption[] = [
  { id: 'BIG_PURCHASE', label: 'Wealth creation', emoji: '🌱', desc: 'Long-term compounding wealth' },
  { id: 'HOME', label: 'Tax saving', emoji: '💰', desc: 'Save under Sec 80C' },
  { id: 'EMERGENCY', label: 'Emergency corpus', emoji: '🛡️', desc: 'Liquid safety net buffer' },
  { id: 'CHILD_FUTURE', label: 'Child education', emoji: '🎓', desc: 'Sized for future studies' },
  { id: 'RETIREMENT', label: 'Retirement', emoji: '🏠', desc: 'Sustained post-work income', spanFull: true },
]

export default function GoalSelectStep() {
  const { selectedGoal, setSelectedGoal, goNext } = useSIPStore()
  const [selected, setSelected] = useState<PrimaryGoal | null>(selectedGoal as any)

  function handleSelect(goalId: PrimaryGoal) {
    setSelected(goalId)
    setSelectedGoal(goalId)
  }

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Scrollable Container */}
      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 overflow-y-auto justify-between">
        
        {/* Top Text */}
        <div>
          <span className="text-smf-amber font-bold text-xs uppercase tracking-[0.15em] font-body block mb-1">
            Phase 2 · Step 1 of 4
          </span>
          <h2 className="text-[26px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight">
            What's this money for?
          </h2>
          <p className="text-smf-muted text-[13px] leading-relaxed mt-2 font-body">
            Pick a goal so we can tune your SIP. You can change it anytime.
          </p>

          {/* Goal Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {goalsList.map((g) => {
              const isSelected = selected === g.id
              return (
                <div
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  className={`border rounded-[18px] p-4 cursor-pointer text-center transition-all duration-150 ${
                    g.spanFull ? 'col-span-2' : ''
                  } ${
                    isSelected
                      ? 'border-smf-amber bg-smf-amber-light shadow-sm'
                      : 'border-smf-line bg-white shadow-sm hover:border-smf-amber/40'
                  }`}
                >
                  <div className="text-[24px] leading-none mb-1.5">{g.emoji}</div>
                  <div className="text-smf-teal-dark font-bold text-[14px] font-display">
                    {g.label}
                  </div>
                  <div className="text-smf-muted text-[11px] font-body mt-0.5 leading-tight">
                    {g.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={goNext}
            disabled={!selected}
            className="cred-btn-accent shadow-md transition-transform"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  )
}
