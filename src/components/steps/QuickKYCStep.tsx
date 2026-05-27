'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShieldAlert, Loader2 } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'

export default function QuickKYCStep() {
  const { employee, goNext } = useSIPStore()
  const name = employee?.name || 'Rajesh Kumar'
  
  // Aadhaar OTP digits state
  const [digits, setDigits] = useState(['7', '3', '9', '1', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  function handleDigitChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[idx] = val
    setDigits(next)

    // Auto-focus next input
    if (val && idx < 5) {
      document.getElementById(`aadhaar-${idx + 1}`)?.focus()
    }

    // Auto-trigger verify when full
    if (next.every(d => d !== '')) {
      handleVerify(next)
    }
  }

  function handleVerify(codes = digits) {
    if (codes.join('').length < 6) {
      setError('Please complete the 6-digit Aadhaar OTP')
      return
    }
    setError('')
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      goNext()
    }, 1500)
  }

  return (
    <div className="cred-page flex flex-col relative overflow-hidden bg-smf-app">
      {/* Glows */}
      <div className="absolute -top-36 -right-36 w-80 h-80 bg-smf-teal-light rounded-full blur-[80px] pointer-events-none opacity-50" />

      <div className="relative flex-1 flex flex-col px-6 pt-12 pb-8 justify-between">
        
        <div>
          {/* Header */}
          <span className="text-smf-amber font-bold text-xs uppercase tracking-[0.15em] font-body block mb-1">
            Phase 2 · Step 3 of 4
          </span>
          <h2 className="text-[26px] font-bold text-smf-teal-dark font-display tracking-tight leading-tight">
            Quick KYC
          </h2>
          <p className="text-smf-muted text-[13px] leading-relaxed mt-2 font-body">
            Most of it is pre-filled. One OTP and you're verified.
          </p>

          {/* Prefilled Fields Container */}
          <div className="mt-6 space-y-3">
            
            {/* Name */}
            <div className="bg-white border border-smf-line rounded-2xl p-4 flex items-center justify-between shadow-sm font-body">
              <div>
                <div className="text-smf-muted text-[10px] uppercase font-bold tracking-wider">Name</div>
                <div className="text-smf-teal-dark font-bold text-[14.5px] mt-0.5">{name}</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-smf-teal-light flex items-center justify-center border border-smf-teal/10">
                <Check className="w-3.5 h-3.5 text-smf-teal" strokeWidth={3} />
              </div>
            </div>

            {/* PAN */}
            <div className="bg-white border border-smf-line rounded-2xl p-4 flex items-center justify-between shadow-sm font-body">
              <div>
                <div className="text-smf-muted text-[10px] uppercase font-bold tracking-wider">PAN (from records)</div>
                <div className="text-smf-teal-dark font-bold text-[14.5px] mt-0.5">ABCDE1234F</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-smf-teal-light flex items-center justify-center border border-smf-teal/10">
                <Check className="w-3.5 h-3.5 text-smf-teal" strokeWidth={3} />
              </div>
            </div>

            {/* Aadhaar OTP block */}
            <div className="bg-white border border-smf-line rounded-[22px] p-5 shadow-sm font-body">
              <div className="text-smf-muted text-[11px] uppercase font-bold tracking-wider mb-3">
                Aadhaar — enter OTP
              </div>

              {/* OTP Cells */}
              <div className="flex gap-2 justify-between">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`aadhaar-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        const next = [...digits]
                        next[idx - 1] = ''
                        setDigits(next)
                        document.getElementById(`aadhaar-${idx - 1}`)?.focus()
                      }
                    }}
                    className={`w-[45px] h-[52px] border rounded-xl text-center text-xl font-bold font-display focus:outline-none transition-all duration-150 ${
                      digit 
                        ? 'border-smf-teal text-smf-teal-dark bg-smf-teal-light/20' 
                        : 'border-smf-line bg-slate-50/50 focus:border-smf-amber'
                    }`}
                  />
                ))}
              </div>

              <div className="text-[11.5px] text-smf-muted mt-3 leading-normal flex items-center gap-1.5">
                <span>Demo hint: enter `4` and `2` to complete</span>
              </div>
            </div>

            {/* Liveness check */}
            <div className="bg-white border border-smf-line rounded-2xl p-4 flex items-center justify-between shadow-sm font-body">
              <div>
                <div className="text-smf-muted text-[10px] uppercase font-bold tracking-wider">Liveness check</div>
                <div className="text-smf-teal-dark font-bold text-[14.5px] mt-0.5">Face match passed</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-smf-teal-light flex items-center justify-center border border-smf-teal/10">
                <Check className="w-3.5 h-3.5 text-smf-teal" strokeWidth={3} />
              </div>
            </div>

          </div>
        </div>

        {/* Action Bottom */}
        <div className="mt-8 space-y-3">
          {error && (
            <div className="text-red-600 text-xs font-bold font-body text-center bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {verifying ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full bg-smf-teal text-white font-bold py-[18px] rounded-2xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying OTP...
              </motion.div>
            ) : (
              <button
                onClick={() => handleVerify()}
                className="cred-btn-accent shadow-md transition-transform"
              >
                Verify
              </button>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
