'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { lookupEmployee } from '@/lib/mock-employees'

type Phase = 'empid' | 'otp' | 'verifying'

export default function LoginStep() {
  const { setEmployee, goNext } = useSIPStore()
  const [phase, setPhase] = useState<Phase>('empid')
  const [empId, setEmpId] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')

  function handleEmpIdSubmit() {
    const emp = lookupEmployee(empId)
    if (!emp) {
      setError('Not found. Try SF10042, SF20183, SF30561, SF40892, SF50234 or DEMO.')
      return
    }
    setError(''); setEmployee(emp); setPhase('otp')
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
    if (next.every(d => d !== '')) handleVerify(next)
  }

  function handleVerify(digits = otp) {
    if (digits.join('').length < 6) { setError('Enter the 6-digit OTP'); return }
    setError(''); setPhase('verifying')
    setTimeout(() => goNext(), 1800)
  }

  return (
    <div className="cred-page relative overflow-hidden bg-smf-app">
      <div className="absolute top-0 left-0 right-0 h-[220px] bg-smf-teal-light rounded-full blur-[80px] pointer-events-none opacity-50" />
      <div className="relative px-6 pt-[60px] pb-8 flex flex-col flex-1 justify-between">
        <AnimatePresence mode="wait">
          {phase === 'empid' && (
            <motion.div key="empid" className="flex-1 flex flex-col" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <span className="cred-label">Step 1 — Identity</span>
              <h1 className="cred-h1 mt-3 mb-2">Sign in with your<br />Employee ID</h1>
              <p className="text-white/40 text-sm mb-8">Single sign-on via Shriram Group SSO.</p>

              <div className="cred-card px-5 py-5 mb-3">
                <div className="cred-label mb-2.5">Employee ID</div>
                <input
                  type="text" value={empId} autoFocus
                  onChange={e => { setEmpId(e.target.value.toUpperCase()); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleEmpIdSubmit()}
                  placeholder="SF10042"
                  className="w-full bg-transparent text-white text-2xl font-bold tracking-[0.12em] placeholder-white/15 focus:outline-none font-mono"
                />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 px-1 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-red-300/90 text-[13px]">{error}</span>
                </motion.div>
              )}

              <div className="cred-row px-4 py-3 mb-7">
                <p className="text-white/40 text-[12px]">
                  <span className="text-shriram-orange font-semibold">Demo IDs:</span> SF10042 · SF20183 · SF30561 · SF40892 · SF50234 · DEMO
                </p>
              </div>

              <div className="mt-auto pt-8">
                <button onClick={handleEmpIdSubmit} className="cred-btn">
                  Continue <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'otp' && (
            <motion.div key="otp" className="flex-1 flex flex-col" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <span className="cred-label">Step 1 — Verify</span>
              <h1 className="cred-h1 mt-3 mb-2">Enter the OTP</h1>
              <p className="text-white/40 text-sm mb-8">Sent to your Aadhaar-linked mobile · +91 ••••• ••789</p>

              <div className="flex gap-2 justify-between mb-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit} autoFocus={idx === 0}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !digit && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
                    }}
                    className="w-[52px] h-[60px] bg-white/[0.045] border border-white/[0.1] rounded-2xl text-white text-2xl font-bold text-center focus:outline-none focus:border-shriram-orange transition-colors"
                  />
                ))}
              </div>
              <p className="text-white/25 text-[12px] mb-8">Demo — enter any 6 digits.</p>
              {error && <p className="text-red-300/90 text-[13px] mb-4">{error}</p>}

              <div className="mt-auto pt-8">
                <button onClick={() => handleVerify()} className="cred-btn">
                  Verify <ArrowRight className="w-[18px] h-[18px]" />
                </button>
                <button onClick={() => setPhase('empid')} className="cred-btn-ghost">Change Employee ID</button>
              </div>
            </motion.div>
          )}

          {phase === 'verifying' && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-24">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-[3px] border-white/10 border-t-shriram-orange animate-spin" />
                <ShieldCheck className="w-6 h-6 text-shriram-orange absolute inset-0 m-auto" />
              </div>
              <p className="text-white font-semibold">Verifying with UIDAI</p>
              <p className="text-white/35 text-[13px] mt-1">Confirming your identity…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
