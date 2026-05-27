'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'

const features = [
  { icon: Zap, title: 'Paid from salary', desc: 'Direct employer payroll link — no manual bank setup needed' },
  { icon: CheckCircle2, title: 'Start small', desc: 'Invest as little as ₹500/month on autopilot' },
  { icon: TrendingUp, title: 'One click to start', desc: 'Express interest instantly; we sort the paperwork next' },
]

export default function WelcomeStep() {
  const { employee, goNext } = useSIPStore()
  const name = employee?.name ? employee.name.split(' ')[0] : 'Rajesh'

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Dynamic ambient decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-smf-teal-light rounded-full blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute top-[40vh] -left-20 w-72 h-72 bg-smf-amber-light rounded-full blur-[90px] pointer-events-none opacity-50" />

      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8">
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-smf-teal flex items-center justify-center text-white font-extrabold text-base border border-smf-line shadow-sm">
            SMF
          </div>
          <div>
            <span className="text-smf-teal font-extrabold text-[15px] tracking-tight block">Shriram Group</span>
            <span className="text-[10px] text-smf-muted font-bold tracking-[0.15em] uppercase leading-none block">Corporate SIP</span>
          </div>
        </motion.div>

        {/* Dynamic Greeting & Social Proof Hook */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="text-smf-teal font-bold text-xs uppercase tracking-[0.15em] block mb-2 font-body">Welcome, {name}</span>
            <h1 className="font-extrabold tracking-tight text-smf-teal-dark text-[clamp(32px,10vw,42px)] leading-[1.08] font-display">
              Start building wealth, straight from salary.
            </h1>
          </motion.div>

          {/* Statistical Social Proof Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="cred-card px-5 py-4 mt-6 bg-white border border-smf-line shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-smf-teal" />
            <div className="text-smf-teal-dark font-extrabold text-3xl font-display leading-none">3,247</div>
            <div className="text-smf-muted text-[13px] font-medium leading-relaxed mt-1 font-body">
              colleagues joined this month · <span className="text-smf-teal font-bold">₹2.4 Cr</span> invested together
            </div>
          </motion.div>

          {/* Curated Features Grid */}
          <div className="mt-8 space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-smf-teal-light flex items-center justify-center shrink-0 border border-smf-teal/10">
                  <f.icon className="w-5 h-5 text-smf-teal" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="text-smf-teal-dark text-[14px] font-bold font-body">{f.title}</div>
                  <div className="text-smf-muted text-[12px] mt-0.5 font-body leading-normal">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="shrink-0 mt-4"
        >
          <p className="text-smf-muted text-[11px] text-center leading-relaxed font-body">
            Auto-enrolled provisional choice at ₹500/month · modify or opt out anytime. Distributed by Shriram Finance Ltd.
            Mutual fund investments are subject to market risks.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
