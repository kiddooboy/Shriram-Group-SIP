'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Sparkles, ShieldCheck } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'

const features = [
  { icon: Zap,         title: 'Ready in under 15 minutes', desc: 'KYC to first SIP — start to finish' },
  { icon: Sparkles,    title: 'An AI engine, not a form',  desc: '8 models personalise amount, fund & tenure' },
  { icon: ShieldCheck, title: 'Your Group&apos;s own funds',    desc: 'Curated Shriram AMC schemes you can trust' },
]

export default function WelcomeStep() {
  const { goNext } = useSIPStore()

  return (
    <div className="cred-page flex flex-col relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-[42vh] max-h-[420px] cred-glow pointer-events-none" />

      <div className="relative flex-1 flex flex-col px-6 pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* brand — pinned to top */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shriram--600.png" alt="Shriram SIP" className="w-full h-full object-cover" />
          </div>
          <span className="text-white/50 text-sm font-semibold tracking-tight">Shriram Group</span>
        </motion.div>

        {/* hero + features — centered in the flexible middle region */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h1 className="font-extrabold tracking-tightest text-white text-[clamp(34px,11vw,46px)] leading-[1.05]">
              Wealth,<br />
              built on<br />
              <span className="text-shriram-orange">autopilot.</span>
            </h1>
            <p className="text-white/45 leading-relaxed mt-4 text-[clamp(13px,3.8vw,15px)] max-w-[320px]">
              An AI-personalised SIP plan, exclusively for Shriram Group employees — using Shriram AMC&apos;s own funds.
            </p>
          </motion.div>

          <div className="mt-[clamp(1.25rem,5vh,2.5rem)] space-y-2.5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="cred-row px-4 py-3.5 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-shriram-orange/12 flex items-center justify-center shrink-0">
                  <f.icon className="w-[18px] h-[18px] text-shriram-orange" />
                </div>
                <div className="min-w-0">
                  <div className="text-white text-[14px] font-semibold" dangerouslySetInnerHTML={{ __html: f.title }} />
                  <div className="text-white/40 text-[12px] mt-0.5" dangerouslySetInnerHTML={{ __html: f.desc }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA — pinned to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="shrink-0"
        >
          <button onClick={goNext} className="cred-btn">
            Start my SIP journey <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <p className="text-white/25 text-[11px] text-center mt-4 leading-relaxed">
            Auto-enrolled at ₹500/month · opt out anytime. Distributed by Shriram Finance Ltd (ARN holder).
            Mutual fund investments are subject to market risks.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
