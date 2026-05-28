'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react'
import { useSIPStore, createDefaultEmployee } from '@/store/useSIPStore'

type Phase = 'form' | 'otp' | 'verifying'

export default function LoginStep() {
  const { setEmpId, setEmployeeName, setMobile, setEmployee, setRegistrationId, goNext } = useSIPStore()

  const [phase, setPhase]        = useState<Phase>('form')
  const [empId, setEmpIdLocal]   = useState('')
  const [name, setName]          = useState('')
  const [mobile, setMobileLocal] = useState('')
  const [otp, setOtp]            = useState(['', '', '', '', '', ''])
  const [error, setError]        = useState('')
  const [sending, setSending]    = useState(false)
  const [resendCooldown, setResend] = useState(0)
  const [devOtp, setDevOtp]      = useState<string | null>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function handleSendOTP() {
    if (!empId.trim())             { setError('Please enter your Employee ID'); return }
    if (!name.trim())              { setError('Please enter your full name'); return }
    if (!/^\d{10}$/.test(mobile)) { setError('Please enter a valid 10-digit mobile number'); return }
    setError('')
    setSending(true)
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send OTP. Please try again.'); return }
      setDevOtp(data.devOtp ?? null)
      setPhase('otp')
      startResendCooldown()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  function startResendCooldown() {
    setResend(30)
    cooldownRef.current = setInterval(() => {
      setResend(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (resendCooldown > 0 || sending) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setSending(true)
    try {
      const res  = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Resend failed. Please try again.'); return }
      setDevOtp(data.devOtp ?? null)
      startResendCooldown()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) document.getElementById('otp-inp-' + (idx + 1))?.focus()
    if (next.every(d => d !== '')) handleVerify(next)
  }

  async function handleVerify(digits = otp) {
    const code = digits.join('')
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return }
    setError('')
    setPhase('verifying')
    try {
      const res  = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPhase('otp')
        setError(data.error ?? 'Verification failed. Please try again.')
        return
      }
      try {
        const reg = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: empId.trim().toUpperCase(), name: name.trim(), mobile: mobile.trim() }),
        })
        const regData = await reg.json()
        if (regData.success && regData.registration?.id) setRegistrationId(regData.registration.id)
      } catch (_) {}
      setEmpId(empId.trim().toUpperCase())
      setEmployeeName(name.trim())
      setMobile(mobile.trim())
      setEmployee(createDefaultEmployee(empId.trim().toUpperCase(), name.trim(), mobile.trim()))
      setTimeout(() => goNext(), 1200)
    } catch {
      setPhase('otp')
      setError('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-shriram-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          {['Details', 'Verify OTP', 'Done'].map((s, i) => {
            const active = (phase === 'form' && i === 0) || (phase === 'otp' && i === 1) || (phase === 'verifying' && i === 2)
            const done   = (phase === 'otp' && i === 0) || (phase === 'verifying' && i <= 1)
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={'flex items-center gap-1.5 text-[12px] font-semibold transition-colors ' + (active ? 'text-shriram-dark' : done ? 'text-shriram-gold' : 'text-shriram-muted/40')}>
                  <div className={'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ' + (active ? 'bg-shriram-dark text-white' : done ? 'bg-shriram-gold text-white' : 'bg-shriram-line text-shriram-muted/40')}>
                    {done ? 'v' : i + 1}
                  </div>
                  {s}
                </div>
                {i < 2 && <div className={'w-8 h-px transition-colors ' + (done ? 'bg-shriram-gold' : 'bg-shriram-line')} />}
              </div>
            )
          })}
        </div>

        <motion.div key={phase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
          className="bg-white rounded-2xl border border-shriram-line shadow-card-lg px-8 py-9">
          <AnimatePresence mode="wait">

            {phase === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="eyebrow-dark">Step 1 of 3 - Identity</span>
                <h2 className="text-[26px] font-bold text-shriram-dark font-display tracking-tight mt-2 mb-1">Employee sign-in</h2>
                <p className="text-shriram-muted text-[13.5px] mb-8">Enter your details - we will send a 6-digit OTP to your mobile number.</p>
                <div className="space-y-5">
                  <div>
                    <label className="field-label">Employee ID</label>
                    <input type="text" value={empId} autoFocus autoComplete="off"
                      onChange={e => { setEmpIdLocal(e.target.value.toUpperCase()); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('name-input')?.focus()}
                      placeholder="e.g. SF10042" className="field-input font-mono tracking-widest" />
                  </div>
                  <div>
                    <label className="field-label">Full Name</label>
                    <input id="name-input" type="text" value={name} autoComplete="name"
                      onChange={e => { setName(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('mobile-input')?.focus()}
                      placeholder="As per Aadhaar" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-shriram-dark border-r border-shriram-line pr-3">+91</div>
                      <input id="mobile-input" type="tel" inputMode="numeric" value={mobile} maxLength={10} autoComplete="tel"
                        onChange={e => { setMobileLocal(e.target.value.replace(/\D/g, '')); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        placeholder="10-digit number" className="field-input pl-[68px]" />
                    </div>
                  </div>
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 mt-4 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </motion.div>
                )}
                <button onClick={handleSendOTP} disabled={sending}
                  className="btn-gold w-full mt-8 py-4 text-[15px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {sending ? (<><span className="w-4 h-4 border-2 border-shriram-dark/30 border-t-shriram-dark rounded-full animate-spin" /> Sending OTP...</>) : (<>Send OTP <ArrowRight className="w-4 h-4" /></>)}
                </button>
                <p className="text-shriram-muted text-[11.5px] text-center mt-4 leading-relaxed">A 6-digit OTP will be sent to your registered mobile number.</p>
              </motion.div>
            )}

            {phase === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="eyebrow-dark">Step 2 of 3 - Verify</span>
                <h2 className="text-[26px] font-bold text-shriram-dark font-display tracking-tight mt-2 mb-1">Enter OTP</h2>
                <p className="text-shriram-muted text-[13.5px] mb-8">6-digit OTP sent to <span className="font-bold text-shriram-dark">+91 {mobile.slice(0, 5)}...</span></p>

                {devOtp && (
                  <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-[12.5px] text-amber-900 leading-relaxed">
                        <span className="font-bold">Demo mode — SMS gateway is not active yet.</span> Use this OTP to continue:
                        <div className="mt-2 text-[22px] font-bold tracking-[0.5em] text-amber-900 font-mono">{devOtp}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-between mb-3">
                  {otp.map((digit, idx) => (
                    <input key={idx} id={'otp-inp-' + idx} type="text" inputMode="numeric" maxLength={1} value={digit} autoFocus={idx === 0}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const next = [...otp]; next[idx - 1] = ''; setOtp(next)
                          document.getElementById('otp-inp-' + (idx - 1))?.focus()
                        }
                      }}
                      className={'w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-shriram-dark focus:outline-none transition-all duration-150 ' + (digit ? 'border-shriram-gold bg-shriram-gold-light' : 'border-shriram-line bg-white focus:border-shriram-gold')} />
                  ))}
                </div>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
                <button onClick={() => handleVerify()} className="btn-gold w-full mt-7 py-4 text-[15px] rounded-xl flex items-center justify-center gap-2">
                  Verify and continue <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => { setPhase('form'); setOtp(['','','','','','']); setError('') }} className="btn-ghost text-[13px] py-1">Change number</button>
                  <button onClick={handleResend} disabled={resendCooldown > 0 || sending}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-shriram-gold disabled:text-shriram-muted/40 disabled:cursor-not-allowed transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendCooldown > 0 ? ('Resend in ' + resendCooldown + 's') : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-[3px] border-shriram-line border-t-shriram-gold animate-spin" />
                  <ShieldCheck className="w-7 h-7 text-shriram-gold absolute inset-0 m-auto" />
                </div>
                <p className="text-shriram-dark font-bold text-[16px]">Verifying OTP...</p>
                <p className="text-shriram-muted text-[13px] mt-1.5">Please wait a moment</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
