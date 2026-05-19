'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, Target, BarChart3, RefreshCw, TrendingUp } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { formatCurrency, formatSIPAmount } from '@/lib/funds'

const GOAL_LABELS: Record<string, string> = {
  EMERGENCY: 'Emergency Fund', BIG_PURCHASE: 'Big Purchase', HOME: 'Home',
  CHILD_FUTURE: "Child's Future", RETIREMENT: 'Retirement',
}

export default function DashboardStep() {
  const { employee, recommendation, adjustedSIP, adjustedFund, adjustedTenure, reset } = useSIPStore()
  const [tab, setTab] = useState<'overview' | 'holdings' | 'alerts'>('overview')

  const sipAmt = adjustedSIP ?? recommendation?.sipAmount ?? 500
  const fund = adjustedFund ?? recommendation?.fund
  const tenure = adjustedTenure ?? recommendation?.tenureMonths ?? 60
  const totalCorpus = recommendation?.projectedCorpus ?? 0
  const years = Math.round(tenure / 12)
  const goal = recommendation?.primaryGoal ?? 'RETIREMENT'

  const invested = sipAmt
  const currentValue = sipAmt * 1.012
  const gainPct = (((currentValue - invested) / invested) * 100).toFixed(2)
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + 1, 1)

  return (
    <div className="cred-page">
      <div className="px-6 pt-[88px] pb-12">
        {/* greeting */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-white/40 text-[13px]">Hello, {employee?.name?.split(' ')[0]}</div>
            <h1 className="cred-h1 mt-0.5">Your portfolio</h1>
          </div>
          <button onClick={reset} className="w-10 h-10 rounded-xl cred-row flex items-center justify-center" title="Restart demo">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* value hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="cred-card p-6 mb-4">
          <div className="cred-label">Current value</div>
          <div className="text-white font-extrabold text-[40px] tracking-tightest leading-none mt-1.5">
            {formatCurrency(Math.round(currentValue))}
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1 bg-emerald-500/15 rounded-full px-2 py-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[11px] font-bold">+{gainPct}%</span>
            </div>
            <span className="text-white/35 text-[12px]">since SIP started</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[['Invested', formatCurrency(invested)], ['SIP', '₹' + sipAmt.toLocaleString('en-IN')], ['Target', formatCurrency(totalCorpus)]].map(([l, v], i) => (
              <div key={i} className="bg-white/[0.03] rounded-xl py-2.5 px-1 text-center">
                <div className="text-white/30 text-[10px]">{l}</div>
                <div className="text-white font-bold text-[13px] mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* tabs */}
        <div className="flex bg-white/[0.04] rounded-2xl p-1 mb-5">
          {(['overview', 'holdings', 'alerts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                tab === t ? 'bg-shriram-orange text-black' : 'text-white/35'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="cred-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-shriram-orange" />
                <span className="text-white font-semibold text-[13px]">Goal · {GOAL_LABELS[goal]}</span>
              </div>
              <div className="h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div className="h-full bg-orange-gradient rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${(currentValue / totalCorpus) * 100}%` }}
                  transition={{ duration: 1 }} />
              </div>
              <div className="text-white/30 text-[11px] mt-1.5 text-right">
                {((currentValue / totalCorpus) * 100).toFixed(2)}% complete · {years} yr horizon
              </div>
            </div>

            <div className="cred-row px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-shriram-orange/12 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-[18px] h-[18px] text-shriram-orange" />
              </div>
              <div className="flex-1">
                <div className="text-white text-[13px] font-semibold">Next SIP debit</div>
                <div className="text-white/35 text-[11px]">{nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} · {formatSIPAmount(sipAmt)}</div>
              </div>
              <span className="cred-chip bg-emerald-500/12 text-emerald-400">Active</span>
            </div>

            <div className="cred-row px-4 py-3.5 flex items-start justify-between">
              <div>
                <div className="cred-label mb-1">Fund</div>
                <div className="text-white font-semibold text-[13px]">{fund?.name}</div>
                <div className="text-white/35 text-[11px] mt-0.5">{fund?.riskLevel}</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold text-[14px]">+{fund?.threeYearReturn}%</div>
                <div className="text-white/30 text-[10px]">3yr CAGR</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="cred-row px-4 py-3.5">
                <BarChart3 className="w-5 h-5 text-shriram-orange mb-2" />
                <div className="text-white text-[13px] font-semibold">Step up SIP</div>
                <div className="text-white/30 text-[11px]">+10% from April</div>
              </div>
              <div className="cred-row px-4 py-3.5">
                <TrendingUp className="w-5 h-5 text-shriram-orange mb-2" />
                <div className="text-white text-[13px] font-semibold">Modify SIP</div>
                <div className="text-white/30 text-[11px]">Change amount / fund</div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'holdings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="cred-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-shriram-orange" />
                <span className="text-white font-semibold text-[13px]">Allocation</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white text-[13px]">{fund?.shortName}</span>
                <span className="text-white font-bold text-[13px]">100%</span>
              </div>
              <div className="h-1.5 bg-white/[0.08] rounded-full"><div className="h-full w-full bg-shriram-orange rounded-full" /></div>
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/[0.07]">
                {[['Units', (currentValue / 18.45).toFixed(3)], ['Avg NAV', '₹18.45'],
                  ['P&L', '+₹' + Math.round(currentValue - invested)], ['XIRR', `~${fund?.threeYearReturn}%`]].map(([l, v], i) => (
                  <div key={i}>
                    <div className="text-white/30 text-[11px]">{l}</div>
                    <div className={`font-bold text-[14px] ${l === 'P&L' ? 'text-emerald-400' : 'text-white'}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cred-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.07]">
                <span className="text-white font-semibold text-[13px]">Recent transactions</span>
              </div>
              <div className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/12 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-[13px] font-medium">SIP Purchase</div>
                  <div className="text-white/30 text-[11px]">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {fund?.shortName}</div>
                </div>
                <div className="text-white font-bold text-[13px]">₹{sipAmt.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {[
              ['📅', 'SIP reminder set', `Auto-debit on the 1st · ${formatSIPAmount(sipAmt)}`],
              ['📲', '24-hour pre-debit SMS', 'An SMS the day before each debit (RBI mandate)'],
              ['📈', 'Annual step-up', 'Each April, the AI suggests a step-up from your increment'],
              ['🎯', 'Goal tracking active', `${GOAL_LABELS[goal]} — ${years} year horizon`],
            ].map(([e, t, s], i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="cred-row px-4 py-3.5 flex items-start gap-3">
                <span className="text-xl leading-none">{e}</span>
                <div>
                  <div className="text-white text-[13px] font-semibold">{t}</div>
                  <div className="text-white/35 text-[11px] mt-0.5">{s}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
