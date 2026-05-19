'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Lock, Check } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import {
  QUESTION_BY_CODE, CASHFLOW_TAKEHOME, CASHFLOW_EXPENSES, CASHFLOW_EMI,
  GOAL_CARDS, profileConfidence,
} from '@/lib/questionnaire'
import { CashflowAnswer, GoalEntry, PrimaryGoal, QAnswer } from '@/lib/types'

export default function QuestionsStep() {
  const {
    questionnaire, currentQuestion, answerQuestion, advanceQuestionnaire, setStep, goNext,
  } = useSIPStore()

  const [single, setSingle] = useState('')
  const [multi, setMulti] = useState<string[]>([])
  const [cashflow, setCashflow] = useState<CashflowAnswer>({ takehome: '', expenses: '', emi: '' })
  const [goals, setGoals] = useState<PrimaryGoal[]>([])
  const [horizon, setHorizon] = useState(7)

  useEffect(() => {
    setSingle(''); setMulti([]); setCashflow({ takehome: '', expenses: '', emi: '' })
    setGoals([]); setHorizon(7)
  }, [currentQuestion])

  useEffect(() => {
    if (currentQuestion === null) goNext()
  }, [currentQuestion, goNext])

  if (!currentQuestion) return null
  const q = QUESTION_BY_CODE[currentQuestion]
  const answeredCount = questionnaire.rendered.length
  const confidence = profileConfidence(questionnaire)

  let canAdvance = false
  if (q.type === 'single') canAdvance = single !== ''
  else if (q.type === 'multi') canAdvance = true
  else if (q.type === 'cashflow') canAdvance = !!(cashflow.takehome && cashflow.expenses && cashflow.emi)
  else if (q.type === 'goals') canAdvance = goals.length > 0

  function buildAnswer(): QAnswer {
    if (q.type === 'single') return single
    if (q.type === 'multi') return multi
    if (q.type === 'cashflow') return cashflow
    return goals.map<GoalEntry>((g, i) => ({
      type: g,
      horizonYears: i === 0 ? horizon : (GOAL_CARDS.find(c => c.type === g)?.defaultHorizon ?? 7),
    }))
  }

  function handleNext() {
    if (!canAdvance) return
    answerQuestion(q.code, buildAnswer())
    advanceQuestionnaire()
  }

  function toggleGoal(g: PrimaryGoal) {
    setGoals(prev => {
      if (prev.includes(g)) return prev.filter(x => x !== g)
      if (prev.length >= 3) return prev
      const next = [...prev, g]
      if (next.length === 1) setHorizon(GOAL_CARDS.find(c => c.type === g)?.defaultHorizon ?? 7)
      return next
    })
  }

  return (
    <div className="cred-page">
      <div className="px-6 pt-[122px] pb-10 flex flex-col min-h-[100dvh]">
        {/* adaptive status */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => answeredCount === 0 && setStep('profile')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-opacity ${
              answeredCount === 0 ? 'bg-white/[0.06]' : 'bg-white/[0.03] opacity-30'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-white/35 text-[11px] font-semibold uppercase tracking-[0.12em]">
                Question {answeredCount + 1}
              </span>
              <span className="text-shriram-orange text-[11px] font-semibold">
                {Math.round(confidence * 100)}% profiled
              </span>
            </div>
            <div className="h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-shriram-orange rounded-full"
                animate={{ width: `${Math.min(100, confidence * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.22 }}
          >
            <div className="cred-chip bg-shriram-orange/12 text-shriram-orange mb-3">{q.section}</div>
            <h1 className="cred-h1 mb-2">{q.title}</h1>
            <p className="text-white/40 text-[13px] mb-6 flex items-start gap-1.5 leading-relaxed">
              {q.code === 'CASHFLOW' && <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />}
              <span>{q.subtitle}</span>
            </p>

            {/* SINGLE */}
            {q.type === 'single' && (
              <div className="space-y-2.5">
                {q.options!.map(opt => {
                  const on = single === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSingle(opt.id)}
                      className={`w-full text-left px-4 py-4 rounded-2xl border flex items-center gap-3.5 transition-all active:scale-[0.99] ${
                        on ? 'cred-card-active' : 'cred-row'
                      }`}
                    >
                      {opt.emoji && <span className="text-[22px] leading-none">{opt.emoji}</span>}
                      <div className="flex-1">
                        <div className="text-white font-semibold text-[14px]">{opt.label}</div>
                        {opt.sub && <div className={`text-[12px] mt-0.5 ${on ? 'text-white/55' : 'text-white/35'}`}>{opt.sub}</div>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${on ? 'bg-shriram-orange border-shriram-orange' : 'border-white/20'}`}>
                        {on && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* MULTI */}
            {q.type === 'multi' && (
              <div className="space-y-2.5">
                {q.options!.map(opt => {
                  const on = multi.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMulti(p => on ? p.filter(x => x !== opt.id) : [...p, opt.id])}
                      className={`w-full text-left px-4 py-4 rounded-2xl border flex items-center gap-3.5 transition-all active:scale-[0.99] ${
                        on ? 'cred-card-active' : 'cred-row'
                      }`}
                    >
                      {opt.emoji && <span className="text-[20px] leading-none">{opt.emoji}</span>}
                      <span className="flex-1 text-white font-medium text-[14px]">{opt.label}</span>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${on ? 'bg-shriram-orange border-shriram-orange' : 'border-white/20'}`}>
                        {on && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
                <p className="text-white/25 text-[12px] text-center pt-1">Optional — pick any, or none</p>
              </div>
            )}

            {/* CASHFLOW */}
            {q.type === 'cashflow' && (
              <div className="space-y-5">
                <CashflowGroup label="Monthly take-home pay" options={CASHFLOW_TAKEHOME}
                  value={cashflow.takehome} onChange={v => setCashflow(c => ({ ...c, takehome: v }))} />
                <CashflowGroup label="Fixed monthly expenses" options={CASHFLOW_EXPENSES}
                  value={cashflow.expenses} onChange={v => setCashflow(c => ({ ...c, expenses: v }))} />
                <CashflowGroup label="Total monthly EMIs" options={CASHFLOW_EMI}
                  value={cashflow.emi} onChange={v => setCashflow(c => ({ ...c, emi: v }))} />
              </div>
            )}

            {/* GOALS */}
            {q.type === 'goals' && (
              <div className="space-y-2.5">
                {GOAL_CARDS.map(card => {
                  const rank = goals.indexOf(card.type)
                  const on = rank !== -1
                  return (
                    <button
                      key={card.type}
                      onClick={() => toggleGoal(card.type)}
                      className={`w-full text-left px-4 py-4 rounded-2xl border flex items-center gap-3.5 transition-all active:scale-[0.99] ${
                        on ? 'cred-card-active' : 'cred-row'
                      }`}
                    >
                      <span className="text-[22px] leading-none">{card.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-[14px]">{card.label}</div>
                        <div className={`text-[12px] mt-0.5 ${on ? 'text-white/55' : 'text-white/35'}`}>{card.sub}</div>
                      </div>
                      {on && (
                        <div className="w-6 h-6 rounded-full bg-shriram-orange flex items-center justify-center text-black text-[11px] font-bold">
                          {rank === 0 ? '★' : rank + 1}
                        </div>
                      )}
                    </button>
                  )
                })}
                {goals.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="cred-card px-5 py-5 !mt-3">
                    <div className="flex justify-between mb-3">
                      <span className="text-white/50 text-[13px]">
                        When do you need <span className="text-white font-semibold">{GOAL_CARDS.find(c => c.type === goals[0])?.label}</span>?
                      </span>
                      <span className="text-shriram-orange font-bold text-[15px]">{horizon} yr</span>
                    </div>
                    <input type="range" min={1} max={30} value={horizon}
                      onChange={e => setHorizon(Number(e.target.value))}
                      className="w-full accent-shriram-orange" />
                    <div className="flex justify-between text-white/25 text-[11px] mt-1.5"><span>1 yr</span><span>30 yr</span></div>
                  </motion.div>
                )}
                <p className="text-white/25 text-[12px] text-center pt-1">Your first pick (★) is the primary goal</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8">
          <button disabled={!canAdvance} onClick={handleNext} className="cred-btn">
            Continue <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CashflowGroup({ label, options, value, onChange }: {
  label: string
  options: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="text-white/55 text-[13px] font-semibold mb-2.5">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => {
          const on = value === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`px-3 py-3 rounded-xl border text-[12px] font-medium transition-all active:scale-[0.98] ${
                on ? 'bg-shriram-orange border-shriram-orange text-black' : 'cred-row text-white/75'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
