'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, Target, BarChart3, RefreshCw, TrendingUp } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { SHRIRAM_FUNDS } from '@/lib/funds'

const GOAL_LABELS: Record<string, string> = {
  EMERGENCY: 'Emergency Corpus', 
  BIG_PURCHASE: 'Wealth Creation', 
  HOME: 'Tax Saving',
  CHILD_FUTURE: "Child Education", 
  RETIREMENT: 'Retirement Planning',
}

export default function DashboardStep() {
  const { employee, selectedFundId, selectedGoal, tunedSIPAmount, reset } = useSIPStore()
  const [tab, setTab] = useState<'overview' | 'holdings' | 'alerts'>('overview')

  const fund = SHRIRAM_FUNDS.find(f => f.id === selectedFundId) || SHRIRAM_FUNDS[0]
  const amount = tunedSIPAmount || 500
  
  // Horizon and projections
  const returnRate = fund.threeYearReturn || 11.0
  const r = (returnRate / 100) / 12
  const years = 30
  const months = years * 12
  const fv = amount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
  const projectedLakhs = Math.round(fv / 100000)

  const invested = amount
  const currentValue = amount * 1.012
  const gainPct = (((currentValue - invested) / invested) * 100).toFixed(2)
  const nextDate = new Date()
  nextDate.setMonth(nextDate.getMonth() + 1, 1)

  return (
    <div className="cred-page min-h-screen bg-smf-app font-body">
      <div className="px-6 pt-12 pb-12 overflow-y-auto">
        
        {/* Greeting Section */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-smf-muted text-[13px] font-bold">Hello, {employee?.name ? employee.name.split(' ')[0] : 'Rajesh'}</div>
            <h1 className="text-[26px] font-extrabold text-smf-teal-dark mt-0.5 font-display tracking-tight leading-none">
              Your portfolio
            </h1>
          </div>
          <button 
            onClick={reset} 
            className="w-10 h-10 rounded-xl bg-white border border-smf-line flex items-center justify-center shadow-sm hover:border-smf-teal/30 active:scale-95 transition-all"
            title="Restart demo"
          >
            <RefreshCw className="w-4 h-4 text-smf-muted" />
          </button>
        </div>

        {/* Current Value Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-smf-line rounded-[22px] p-6 mb-5 shadow-sm text-left relative overflow-hidden"
        >
          <div className="text-smf-muted text-[11px] font-bold uppercase tracking-wider">
            Current portfolio value
          </div>
          <div className="text-[38px] font-extrabold text-smf-teal-dark font-display tracking-tightest leading-none mt-1.5">
            ₹{Math.round(currentValue).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 bg-emerald-50 text-smf-teal border border-smf-teal/10 rounded-full px-2.5 py-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-smf-teal" />
              <span className="text-smf-teal text-[11px] font-extrabold">+{gainPct}%</span>
            </div>
            <span className="text-smf-muted text-[12.5px]">since SIP started</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-smf-line/60">
            {[
              ['Invested', `₹${invested.toLocaleString('en-IN')}`], 
              ['Monthly SIP', `₹${amount.toLocaleString('en-IN')}`], 
              ['Target', `₹${projectedLakhs} L`]
            ].map(([l, v], i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-1 text-center">
                <div className="text-smf-muted text-[10px] font-bold">{l}</div>
                <div className="text-smf-teal-dark font-bold text-[13px] mt-0.5 font-display">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs switcher */}
        <div className="flex bg-slate-100/80 border border-slate-200/50 rounded-2xl p-1 mb-5">
          {(['overview', 'holdings', 'alerts'] as const).map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-[12.5px] font-bold capitalize transition-all duration-150 ${
                tab === t ? 'bg-smf-teal text-white shadow-sm' : 'text-smf-muted hover:text-smf-teal'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab views */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
            
            {/* Goal Progress */}
            <div className="bg-white border border-smf-line rounded-[22px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-smf-amber" />
                <span className="text-smf-teal-dark font-bold text-[13.5px] font-display">
                  Goal · {GOAL_LABELS[selectedGoal || ''] || 'Wealth Creation'}
                </span>
              </div>
              <div className="h-2.5 bg-smf-line rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-smf-teal rounded-full"
                  initial={{ width: 0 }} 
                  animate={{ width: `${(currentValue / (projectedLakhs * 100000)) * 100}%` }}
                  transition={{ duration: 1 }} 
                />
              </div>
              <div className="text-smf-muted text-[11px] mt-1.5 text-right font-bold">
                {((currentValue / (projectedLakhs * 100000)) * 100).toFixed(4)}% complete · {years} yr horizon
              </div>
            </div>

            {/* Next Debit */}
            <div className="bg-white border border-smf-line rounded-2xl p-4.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-smf-teal-light flex items-center justify-center shrink-0 border border-smf-teal/10">
                  <Calendar className="w-5 h-5 text-smf-teal" />
                </div>
                <div>
                  <div className="text-smf-teal-dark text-[13.5px] font-bold">Next SIP debit</div>
                  <div className="text-smf-muted text-[11.5px] mt-0.5">
                    {nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} · ₹{amount.toLocaleString('en-IN')}/mo
                  </div>
                </div>
              </div>
              <span className="bg-emerald-50 text-smf-teal border border-smf-teal/10 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Holding Row */}
            <div className="bg-white border border-smf-line rounded-2xl p-4.5 flex items-start justify-between shadow-sm">
              <div>
                <div className="text-[10px] text-smf-muted font-bold uppercase tracking-wider mb-1">Chosen Fund</div>
                <div className="text-smf-teal-dark font-bold text-[14px] font-display">{fund.name}</div>
                <div className="text-smf-muted text-[11.5px] mt-0.5">{fund.riskLevel} Risk</div>
              </div>
              <div className="text-right">
                <div className="text-smf-teal font-extrabold text-[15px] font-display">+{fund.threeYearReturn}%</div>
                <div className="text-smf-muted text-[10px]">3yr CAGR</div>
              </div>
            </div>

            {/* AI step ups */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-smf-line rounded-2xl p-4 shadow-sm">
                <BarChart3 className="w-5 h-5 text-smf-amber mb-2" />
                <div className="text-smf-teal-dark text-[13px] font-bold">Step up SIP</div>
                <div className="text-smf-muted text-[11px] mt-0.5">+10% from April</div>
              </div>
              <div className="bg-white border border-smf-line rounded-2xl p-4 shadow-sm">
                <TrendingUp className="w-5 h-5 text-smf-teal mb-2" />
                <div className="text-smf-teal-dark text-[13px] font-bold">Modify SIP</div>
                <div className="text-smf-muted text-[11px] mt-0.5">Change amount / fund</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Holdings Tab */}
        {tab === 'holdings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-left">
            <div className="bg-white border border-smf-line rounded-[22px] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-smf-teal" />
                <span className="text-smf-teal-dark font-bold text-[13.5px] font-display">Allocation</span>
              </div>
              <div className="flex justify-between mb-1.5 font-bold text-[13px]">
                <span className="text-smf-teal-dark font-display">{fund.shortName}</span>
                <span className="text-smf-teal">100%</span>
              </div>
              <div className="h-1.5 bg-smf-line rounded-full overflow-hidden">
                <div className="h-full w-full bg-smf-teal rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-5 pt-5 border-t border-smf-line/60">
                {[
                  ['Units Owned', (currentValue / 18.45).toFixed(3)], 
                  ['Avg Purchase NAV', '₹18.45'],
                  ['Total P&L', `+₹${Math.round(currentValue - invested)}`], 
                  ['XIRR', `~${fund.threeYearReturn}%`]
                ].map(([l, v], i) => (
                  <div key={i}>
                    <div className="text-smf-muted text-[11px] font-bold">{l}</div>
                    <div className={`font-extrabold text-[14.5px] font-display mt-0.5 ${l === 'Total P&L' ? 'text-smf-teal' : 'text-smf-teal-dark'}`}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-smf-line rounded-[22px] overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-smf-line/60 bg-slate-50/50">
                <span className="text-smf-teal-dark font-bold text-[13px] font-display">Recent transactions</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-smf-teal/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-smf-teal" />
                  </div>
                  <div>
                    <div className="text-smf-teal-dark font-bold text-[13px]">SIP Purchase</div>
                    <div className="text-smf-muted text-[11px] mt-0.5">
                      {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {fund.shortName}
                    </div>
                  </div>
                </div>
                <div className="text-smf-teal-dark font-extrabold text-[14px] font-display">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5 text-left">
            {[
              ['📅', 'SIP reminder set', `Direct payroll salary auto-debit on the 1st · ₹${amount.toLocaleString('en-IN')}/mo`],
              ['📲', '24-hour pre-debit SMS', 'A notification the day before each debit (RBI compliance mandated)'],
              ['📈', 'AI Annual Step-up', 'Automatic increment matching suggestions computed each April'],
              ['🎯', 'Goal compounding live', `${GOAL_LABELS[selectedGoal || ''] || 'Wealth Creation'} — ${years} year horizon`],
            ].map(([e, t, s], i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-smf-line rounded-2xl p-4 flex items-start gap-3 shadow-sm"
              >
                <span className="text-xl leading-none">{e}</span>
                <div>
                  <div className="text-smf-teal-dark font-bold text-[13.5px] font-display">{t}</div>
                  <div className="text-smf-muted text-[11.5px] mt-0.5 leading-normal">{s}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  )
}
