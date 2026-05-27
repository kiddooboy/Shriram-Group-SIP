'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Users, IndianRupee } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'

const features = [
  { icon: IndianRupee, title: 'Paid from your salary', desc: 'Direct employer payroll link — no manual bank setup, ever.' },
  { icon: Zap,         title: 'One click to start',    desc: 'Express your interest now; we handle the paperwork next.' },
  { icon: TrendingUp,  title: 'Start with just ₹500',  desc: 'Invest as little as ₹500/month and build wealth on autopilot.' },
  { icon: CheckCircle2,title: 'SEBI registered',       desc: 'All funds managed by Shriram AMC under SEBI regulations.' },
]

const stats = [
  { value: '3,247', label: 'Colleagues enrolled this month' },
  { value: '₹2.4 Cr', label: 'Invested together by employees' },
  { value: '11% p.a.', label: 'Indicative long-term return' },
]

export default function WelcomeStep() {
  const { goNext } = useSIPStore()

  return (
    <section className="relative min-h-[calc(100vh-71px)] bg-shriram-dark overflow-hidden flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern bg-[size:24px_24px] opacity-100 pointer-events-none" />
      {/* Gold radial glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-shriram-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-shriram-gold/3 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Content */}
          <div>
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="eyebrow text-shriram-gold/80 flex items-center gap-2">
                <span className="w-6 h-px bg-shriram-gold/60" />
                Shriram GSIP · Employee Benefit Plan
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-white font-extrabold text-[clamp(36px,5vw,56px)] leading-[1.08] tracking-tight font-display mt-5 mb-5"
            >
              Start building wealth,<br />
              <span className="text-shriram-gold">straight from salary.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white/60 text-[16px] leading-relaxed max-w-md mb-10 font-sans"
            >
              Join thousands of Shriram Group employees investing in curated mutual funds — fully automated,
              no bank forms, no paperwork. Just one click to start.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <button
                onClick={goNext}
                id="welcome-get-started"
                className="btn-gold-lg text-[15px] group shadow-gold"
              >
                Get started
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-outline-white text-[15px] px-8 py-4 rounded-xl">
                Learn more
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-8"
            >
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-shriram-gold text-[26px] font-extrabold font-display leading-none">{s.value}</span>
                  <span className="text-white/45 text-[12px] mt-1 font-sans">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-shriram-gold/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-shriram-gold/15 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-shriram-gold" />
                </div>
                <h3 className="text-white font-bold text-[14px] font-sans mb-1.5">{f.title}</h3>
                <p className="text-white/45 text-[12.5px] leading-relaxed font-sans">{f.desc}</p>
              </motion.div>
            ))}

            {/* Enrolment badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="sm:col-span-2 bg-shriram-gold/10 border border-shriram-gold/25 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-shriram-gold/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-shriram-gold" />
              </div>
              <div>
                <div className="text-shriram-gold font-extrabold text-[22px] font-display leading-none">3,247</div>
                <div className="text-white/60 text-[12.5px] mt-1 font-sans">
                  colleagues joined this month · <span className="text-shriram-gold font-bold">₹2.4 Cr</span> invested together
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
