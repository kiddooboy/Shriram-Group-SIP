'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Calendar, ArrowRight } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { formatCurrency, formatSIPAmount } from '@/lib/funds'

export default function SuccessStep() {
  const { employee, recommendation, adjustedSIP, adjustedFund, adjustedTenure, mandate, goNext } = useSIPStore()
  const [burst, setBurst] = useState(true)

  const sipAmt = adjustedSIP ?? recommendation?.sipAmount ?? 500
  const fund = adjustedFund ?? recommendation?.fund
  const tenure = adjustedTenure ?? recommendation?.tenureMonths ?? 60
  const corpus = recommendation?.projectedCorpus ?? 0
  const years = Math.round(tenure / 12)
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + 1, 1)

  useEffect(() => { const t = setTimeout(() => setBurst(false), 3500); return () => clearTimeout(t) }, [])

  const milestones = [
    ['25%', `${Math.round(years * 0.25)} yr`, formatCurrency(corpus * 0.18)],
    ['50%', `${Math.round(years * 0.5)} yr`, formatCurrency(corpus * 0.45)],
    ['100%', `${years} yr`, formatCurrency(corpus)],
  ]

  return (
    <div className="cred-page relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[420px] cred-glow pointer-events-none" />
      <div className="relative px-6 pt-[122px] pb-10 flex flex-col min-h-[100dvh]">

        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative mb-5"
          >
            {burst && [...Array(10)].map((_, i) => (
              <motion.div key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i % 2 ? '#FFB800' : '#F47920', top: '50%', left: '50%' }}
                animate={{
                  x: Math.cos((i / 10) * 6.28) * 70, y: Math.sin((i / 10) * 6.28) * 70,
                  opacity: [1, 0], scale: [1, 0],
                }}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.04 }}
              />
            ))}
            <div className="w-24 h-24 rounded-full bg-emerald-500/12 border-2 border-emerald-500 flex items-center justify-center">
              <Check className="w-11 h-11 text-emerald-400" strokeWidth={3} />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-[30px] font-extrabold tracking-tightest">
            SIP activated
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-white/45 text-[14px] mt-1.5">
            Your wealth journey starts now, {employee?.name?.split(' ')[0]}.
          </motion.p>
        </div>

        {/* SIP card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-3xl bg-orange-gradient p-6 mb-4">
          <div className="text-black/55 text-[12px] font-medium">
            {recommendation && recommendation.goals.length > 1
              ? `${recommendation.goals.length} goals · ${fund?.shortName} + ${recommendation.goals.length - 1} more`
              : fund?.name}
          </div>
          <div className="text-black font-extrabold text-4xl tracking-tightest mt-1">{formatSIPAmount(sipAmt)}</div>
          <div className="text-black/60 text-[13px] mt-0.5 font-medium">for {years} years</div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/15">
            <Calendar className="w-4 h-4 text-black/55" />
            <span className="text-black/70 text-[12px] font-medium">
              First debit · {nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {mandate?.mandateId && (
            <div className="text-black/40 text-[11px] mt-1 font-mono">Mandate {mandate.mandateId}</div>
          )}
        </motion.div>

        {/* milestones */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="cred-card p-5 mb-4">
          <div className="cred-label mb-3.5">Your wealth milestones</div>
          <div className="space-y-3.5">
            {milestones.map(([pct, lbl, amt], i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-shriram-orange/12 flex items-center justify-center flex-shrink-0">
                  <span className="text-shriram-orange text-[11px] font-bold">{pct}</span>
                </div>
                <div className="flex-1">
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-shriram-orange rounded-full"
                      initial={{ width: 0 }} animate={{ width: pct }}
                      transition={{ delay: 0.7 + i * 0.15, duration: 0.8 }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-[12px] font-bold">{amt}</div>
                  <div className="text-white/30 text-[10px]">{lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="cred-row px-4 py-3.5 mb-7">
          <p className="text-white/45 text-[12px] leading-relaxed">
            You&apos;ll get a <span className="text-white font-semibold">24-hour SMS</span> before each debit. Your SIP auto-escalates by 10% each April unless you change it.
          </p>
        </motion.div>

        <div className="mt-auto pt-8">
          <button onClick={goNext} className="cred-btn">
            View my portfolio <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
