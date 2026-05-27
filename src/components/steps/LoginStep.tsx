'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useSIPStore, createDefaultEmployee } from '@/store/useSIPStore'

type Phase = 'form' | 'otp' | 'verifying'

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier }
}

export default function LoginStep() {
  const { setEmpId, setEmployeeName, setMobile, setEmployee, setRegistrationId, goNext } = useSIPStore()

  const [phase, setPhase]           = useState<Phase>('form')
  const [empId, setEmpIdLocal]      = useState('')
  const [name, setName]             = useState('')
  const [mobile, setMobileLocal]    = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [error, setError]           = useState('')
  const [sending, setSending]       = useState(false)
  const [resendCooldown, setResend] = useState(0)

  const confirmRef   = useRef<ConfirmationResult | null>(null)
  const cooldownRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const captchaReady = useRef(false)

  // ── Pre-render invisible reCAPTCHA once the component mounts ────────────
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const fbAuth = getFirebaseAuth()
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear() } catch (_) {}
        }
        const verifier = new RecaptchaVerifier(fbAuth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => { captchaReady.current = false },
        })
        verifier.render().then(() => {
          window.recaptchaVerifier = verifier
          captchaReady.current = true
          console.log('[OTP] reCAPTCHA pre-rendered OK')
        }).catch(e => console.error('[OTP] reCAPTCHA render error:', e))
      } catch (e) {
        console.error('[OTP] reCAPTCHA setup error:', e)
      }
    }, 300)

    return () => {
      clearTimeout(t)
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      try { window.recaptchaVerifier?.clear(); window.recaptchaVerifier = undefined } catch (_) {}
    }
  }, [])

  // ── Re-init reCAPTCHA (after failure / resend) ───────────────────────────
  async function resetRecaptcha(): Promise<RecaptchaVerifier> {
    try { window.recaptchaVerifier?.clear(); window.recaptchaVerifier = undefined } catch (_) {}
    captchaReady.current = false

    const fbAuth = getFirebaseAuth()
    const verifier = new RecaptchaVerifier(fbAuth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { captchaReady.current = false },
    })
    await verifier.render()
    window.recaptchaVerifier = verifier
    captchaReady.current = true
    return verifier
  }

  // ── Send OTP ─────────────────────────────────────────────────────────────
  async function handleSendOTP() {
    if (!empId.trim())             { setError('Please enter your Employee ID'); return }
    if (!name.trim())              { setError('Please enter your full name'); return }
    if (!/^\d{10}$/.test(mobile)) { setError('Please enter a valid 10-digit mobile number'); return }
    setError('')
    setSending(true)

    try {
      const fbAuth = getFirebaseAuth()
      const verifier = captchaReady.current && window.recaptchaVerifier
        ? window.recaptchaVerifier
        : await resetRecaptcha()

      console.log('[OTP] Calling signInWithPhoneNumber for +91' + mobile)
      const result = await signInWithPhoneNumber(fbAuth, `+91${mobile}`, verifier)
      confirmRef.current = result
      setPhase('otp')
      startResendCooldown()
      console.log('[OTP] SMS sent successfully')
    } catch (err: any) {
      console.error('[OTP] Send error — code:', err?.code, '| message:', err?.message)
      try { await resetRecaptcha() } catch (_) {}
      const code = err?.code ?? 'unknown'
      setError(
        code === 'auth/invalid-phone-number'   ? 'Invalid phone number — please check and try again.' :
        code === 'auth/too-many-requests'       ? 'Too many attempts. Please wait a few minutes and try again.' :
        code === 'auth/quota-exceeded'          ? 'Daily SMS quota reached. Please try again tomorrow.' :
        code === 'auth/billing-not-enabled'     ? 'SMS service not ready — please try again in a minute.' :
        code === 'auth/unauthorized-domain'     ? 'This domain is not authorised. Please contact support.' :
        code === 'auth/captcha-check-failed'    ? 'Security check failed. Please refresh the page and try again.' :
        'Failed to send OTP. Please refresh the page and try again.'
      )
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
      const fbAuth  = getFirebaseAuth()
      const verifier = await resetRecaptcha()
      const result  = await signInWithPhoneNumber(fbAuth, `+91${mobile}`, verifier)
      confirmRef.current = result
      startResendCooldown()
    } catch (err: any) {
      console.error('[OTP] Resend error:', err?.code, err?.message)
      setError(`Resend failed (${err?.code ?? 'unknown'}). Please try again.`)
    } finally {
      setSending(false)
    }
  }

  // ── OTP input ─────────────────────────────────────────────────────────────
  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-inp-${idx + 1}`)?.focus()
    if (next.every(d => d !== '')) handleVerify(next)
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async function handleVerify(digits = otp) {
    const code = digits.join('')
    if (code.length < 6)        { setError('Please enter the complete 6-digit OTP'); return }
    if (!confirmRef.current)    { setError('Session expired — please resend OTP'); return }
    setError('')
    setPhase('verifying')

    try {
      await confirmRef.current.confirm(code)

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: empId.trim().toUpperCase(), name: name.trim(), mobile: mobile.trim() }),
        })
        const data = await res.json()
        if (data.success && data.registration?.id) setRegistrationId(data.registration.id)
      } catch (_) {}

      setEmpId(empId.trim().toUpperCase())
      setEmployeeName(name.trim())
      setMobile(mobile.trim())
      setEmployee(createDefaultEmployee(empId.trim().toUpperCase(), name.trim(), mobile.trim()))
      setTimeout(() => goNext(), 1200)

    } catch (err: any) {
      console.error('[OTP] Verify error:', err?.code, err?.message)
      setPhase('otp')
      setError(
        err?.code === 'auth/invalid-verification-code' ? 'Incorrect OTP — please check and try again.' :
        err?.code === 'auth/code-expired'              ? 'OTP has expired. Please request a new one.' :
        'Verification failed. Please try again.'
      )
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-120px)] bg-shriram-cream flex items-center justify-center px-4 py-12">
      {/* Invisible reCAPTCHA anchor — must stay in DOM at all times */}
      <div id="recaptcha-container" style={{ position: 'absolute', bottom: 0, left: 0 }} />

      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {['Details', 'Verify OTP', 'Done'].map((s, i) => {
            const active = (phase === 'form' && i === 0) || (phase === 'otp' && i === 1) || (phase === 'verifying' && i === 2)
            const done   = (phase === 'otp' && i === 0) || (phase === 'verifying' && i <= 1)
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-[12px] font-semibold transition-colors ${active ? 'text-shriram-dark' : done ? 'text-shriram-gold' : 'text-shriram-muted/40'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${active ? 'bg-shriram-dark text-white' : done ? 'bg-shriram-gold text-white' : 'bg-shriram-line text-shriram-muted/40'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {s}
                </div>
                {i < 2 && <div className={`w-8 h-px ${done ? 'bg-shriram-gold' : 'bg-shriram-line'} transition-colors`} />}
              </div>
            )
          })}
        </div>

        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-white rounded-2xl border border-shriram-line shadow-card-lg px-8 py-9"
        >
          <AnimatePresence mode="wait">

            {/* ── Details form ──────────────────────────────────────────── */}
            {phase === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="eyebrow-dark">Step 1 of 3 · Identity</span>
                <h2 className="text-[26px] font-bold text-shriram-dark font-display tracking-tight mt-2 mb-1">
                  Employee sign-in
                </h2>
                <p className="text-shriram-muted text-[13.5px] mb-8">
                  Enter your details — we'll send a real OTP to your mobile number.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="field-label">Employee ID</label>
                    <input
                      type="text" value={empId} autoFocus autoComplete="off"
                      onChange={e => { setEmpIdLocal(e.target.value.toUpperCase()); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('name-input')?.focus()}
                      placeholder="e.g. SF10042"
                      className="field-input font-mono tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="field-label">Full Name</label>
                    <input
                      id="name-input" type="text" value={name} autoComplete="name"
                      onChange={e => { setName(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && document.getElementById('mobile-input')?.focus()}
                      placeholder="As per Aadhaar"
                      className="field-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-shriram-dark border-r border-shriram-line pr-3">
                        +91
                      </div>
                      <input
                        id="mobile-input" type="tel" inputMode="numeric" value={mobile}
                        maxLength={10} autoComplete="tel"
                        onChange={e => { setMobileLocal(e.target.value.replace(/\D/g, '')); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        placeholder="10-digit number"
                        className="field-input pl-[68px]"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 mt-4 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </motion.div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={sending}
                  className="btn-gold w-full mt-8 py-4 text-[15px] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending
                    ? <><span className="w-4 h-4 border-2 border-shriram-dark/30 border-t-shriram-dark rounded-full animate-spin" /> Sending OTP…</>
                    : <>Send OTP <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
                <p className="text-shriram-muted text-[11.5px] text-center mt-4 leading-relaxed">
                  A 6-digit OTP will be sent to your mobile via SMS.
                </p>
              </motion.div>
            )}

            {/* ── OTP entry ─────────────────────────────────────────────── */}
            {phase === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="eyebrow-dark">Step 2 of 3 · Verify</span>
                <h2 className="text-[26px] font-bold text-shriram-dark font-display tracking-tight mt-2 mb-1">
                  Enter OTP
                </h2>
                <p className="text-shriram-muted text-[13.5px] mb-8">
                  6-digit OTP sent to{' '}
                  <span className="font-bold text-shriram-dark">+91 {mobile.slice(0, 5)}·····</span>
                </p>

                <div className="flex gap-3 justify-between mb-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx} id={`otp-inp-${idx}`}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      autoFocus={idx === 0}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          const next = [...otp]; next[idx - 1] = ''; setOtp(next)
                          document.getElementById(`otp-inp-${idx - 1}`)?.focus()
                        }
                      }}
                      className={`w-12 h-14 rounded-xl border-2 text-center text-xl font-bold text-shriram-dark focus:outline-none transition-all duration-150 ${
                        digit ? 'border-shriram-gold bg-shriram-gold-light' : 'border-shriram-line bg-white focus:border-shriram-gold'
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}

                <button onClick={() => handleVerify()} className="btn-gold w-full mt-7 py-4 text-[15px] rounded-xl flex items-center justify-center gap-2">
                  Verify &amp; continue <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => { setPhase('form'); setOtp(['','','','','','']); setError('') }} className="btn-ghost text-[13px] py-1">
                    ← Change number
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || sending}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-shriram-gold disabled:text-shriram-muted/40 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Verifying ─────────────────────────────────────────────── */}
            {phase === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-[3px] border-shriram-line border-t-shriram-gold animate-spin" />
                  <ShieldCheck className="w-7 h-7 text-shriram-gold absolute inset-0 m-auto" />
                </div>
                <p className="text-shriram-dark font-bold text-[16px]">Verifying OTP…</p>
                <p className="text-shriram-muted text-[13px] mt-1.5">Confirming with Firebase</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
