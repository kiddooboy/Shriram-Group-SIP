'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'

const KYC: Record<string, { label: string; tone: string }> = {
  KYC_VALIDATED:  { label: 'KYC Verified',   tone: 'text-emerald-400 bg-emerald-400/10' },
  KYC_REGISTERED: { label: 'KYC Registered', tone: 'text-shriram-gold bg-shriram-gold/10' },
  KYC_ON_HOLD:    { label: 'KYC On Hold',    tone: 'text-red-400 bg-red-400/10' },
}

export default function ProfileStep() {
  const { employee, goNext } = useSIPStore()
  if (!employee) return null
  const kyc = KYC[employee.kycStatus]

  const rows = [
    ['Employee ID', employee.empId],
    ['Entity', employee.entity],
    ['Designation', employee.designation],
    ['Location', employee.location],
    ['Mobile', employee.mobile],
  ]

  return (
    <div className="cred-page relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[280px] cred-glow pointer-events-none" />
      <div className="relative px-6 pt-[96px] pb-10 flex flex-col min-h-[100dvh]">
        <span className="cred-label">Step 2 — Profile</span>
        <h1 className="cred-h1 mt-3 mb-6">Here&apos;s what we<br />already know</h1>

        {/* identity card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="cred-card p-6 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-gradient flex items-center justify-center">
              <span className="text-black font-black text-2xl">{employee.name.charAt(0)}</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">{employee.name}</div>
              <div className={`cred-chip mt-1.5 ${kyc.tone}`}>
                <CheckCircle2 className="w-3 h-3" /> {kyc.label}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/[0.07] divide-y divide-white/[0.05]">
            {rows.map(([label, value], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-white/35 text-[13px]">{label}</span>
                <span className="text-white text-[13px] font-medium text-right">{value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Aadhaar age */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="cred-row px-5 py-4 flex items-center gap-3.5 mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-[18px] h-[18px] text-emerald-400" />
          </div>
          <div>
            <div className="text-white text-[14px] font-semibold">Age {employee.age} — Aadhaar verified</div>
            <div className="text-white/40 text-[12px]">Only your date of birth is kept. Aadhaar number is never stored.</div>
          </div>
        </motion.div>

        {/* privacy */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="rounded-2xl bg-shriram-orange/[0.07] border border-shriram-orange/20 px-4 py-3.5 mb-8"
        >
          <p className="text-shriram-orange/85 text-[12px] leading-relaxed">
            <span className="font-bold">That&apos;s all your employer shares.</span> No salary, no HRMS, no payroll. The next few questions build your full picture — answers stay private and never go back to HR.
          </p>
        </motion.div>

        <div className="mt-auto pt-8">
          <button onClick={goNext} className="cred-btn">
            Build my profile <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  )
}
