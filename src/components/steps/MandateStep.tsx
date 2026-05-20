'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertCircle, Check, Lock } from 'lucide-react'
import { useSIPStore } from '@/store/useSIPStore'
import { formatSIPAmount } from '@/lib/funds'

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Canara Bank']

export default function MandateStep() {
  const { recommendation, adjustedSIP, adjustedFund, setMandate, goNext } = useSIPStore()
  const [bank, setBank] = useState('')
  const [accountNum, setAccountNum] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState<'form' | 'submitting' | 'done'>('form')

  const sipAmt = adjustedSIP ?? recommendation?.sipAmount ?? 500
  const fund = adjustedFund ?? recommendation?.fund

  function handleSubmit() {
    if (!bank) return setError('Select your bank')
    if (accountNum.length < 8) return setError('Enter a valid account number')
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return setError('Enter a valid IFSC (e.g. SBIN0001234)')
    if (!agreed) return setError('Please authorise the NACH e-mandate')
    setError(''); setStage('submitting')
    setTimeout(() => {
      setStage('done')
      setTimeout(() => {
        setMandate({
          bankName: bank,
          accountNumber: accountNum.replace(/.(?=.{4})/g, '•'),
          ifsc,
          mandateDate: new Date().toLocaleDateString('en-IN'),
          mandateId: 'NACH' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        })
        goNext()
      }, 1400)
    }, 1800)
  }

  if (stage !== 'form') {
    return (
      <div className="cred-page flex items-center justify-center">
        <AnimatePresence mode="wait">
          {stage === 'submitting' ? (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-6">
              <div className="w-16 h-16 rounded-full border-[3px] border-white/10 border-t-shriram-orange animate-spin mx-auto mb-5" />
              <p className="text-white font-semibold">Registering NACH e-mandate</p>
              <p className="text-white/35 text-[13px] mt-1">Connecting to NPCI…</p>
            </motion.div>
          ) : (
            <motion.div key="d" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/12 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-5">
                <Check className="w-9 h-9 text-emerald-400" strokeWidth={3} />
              </div>
              <p className="text-white font-bold text-lg">Mandate registered</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="cred-page">
      <div className="px-6 pt-[122px] pb-10 flex flex-col min-h-[100dvh]">
        <span className="cred-label">Step 5 — Auto-debit</span>
        <h1 className="cred-h1 mt-3 mb-5">Set up your<br />NACH e-mandate</h1>

        {/* amount summary */}
        <div className="rounded-3xl bg-orange-gradient p-5 mb-6">
          <div className="text-black/55 text-[12px] mb-1 font-medium">Monthly auto-debit</div>
          <div className="text-black font-extrabold text-3xl tracking-tightest">{formatSIPAmount(sipAmt)}</div>
          <div className="text-black/65 text-[13px] mt-1 font-medium">
            {recommendation && recommendation.goals.length > 1
              ? `Across ${recommendation.goals.length} goals · 1st of every month`
              : `${fund?.shortName} · 1st of every month`}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-black/55 text-[11px] font-medium">
            <Lock className="w-3 h-3" /> RBI NACH framework · 24-hour pre-debit SMS
          </div>
        </div>

        <div className="space-y-3">
          {/* bank */}
          <div className="cred-row px-4 py-3.5">
            <div className="cred-label mb-1.5">Bank</div>
            <select value={bank} onChange={e => { setBank(e.target.value); setError('') }}
              className="w-full bg-transparent text-white text-[15px] focus:outline-none">
              <option value="" className="bg-cred-card">Select your bank</option>
              {BANKS.map(b => <option key={b} value={b} className="bg-cred-card">{b}</option>)}
            </select>
          </div>
          {/* account */}
          <div className="cred-row px-4 py-3.5">
            <div className="cred-label mb-1.5">Account Number</div>
            <input type="text" value={accountNum} placeholder="Enter account number"
              onChange={e => { setAccountNum(e.target.value.replace(/\D/g, '')); setError('') }}
              className="w-full bg-transparent text-white text-[15px] placeholder-white/15 focus:outline-none" />
          </div>
          {/* ifsc */}
          <div className="cred-row px-4 py-3.5">
            <div className="cred-label mb-1.5">IFSC Code</div>
            <input type="text" value={ifsc} placeholder="SBIN0001234" maxLength={11}
              onChange={e => { setIfsc(e.target.value.toUpperCase()); setError('') }}
              className="w-full bg-transparent text-white text-[15px] font-mono tracking-wider placeholder-white/15 focus:outline-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300/90 text-[13px]">{error}</span>
            </div>
          )}

          {/* consent */}
          <button onClick={() => setAgreed(!agreed)}
            className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
              agreed ? 'cred-card-active' : 'cred-row'
            }`}>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${agreed ? 'bg-shriram-orange border-shriram-orange' : 'border-white/20'}`}>
              {agreed && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </div>
            <p className="text-white/55 text-[12px] leading-relaxed">
              I authorise Shriram Finance Ltd to debit <span className="text-white font-semibold">{formatSIPAmount(sipAmt)}</span> on the 1st of every month via NACH e-mandate, with a 24-hour pre-debit SMS as per RBI guidelines.
            </p>
          </button>
        </div>

        <div className="mt-auto pt-8">
          <button onClick={handleSubmit} className="cred-btn">
            Activate my SIP <ArrowRight className="w-[18px] h-[18px]" />
          </button>
          <p className="text-white/22 text-[10px] text-center mt-3">
            Secured by NPCI&apos;s NACH framework. No other debits are authorised.
          </p>
        </div>
      </div>
    </div>
  )
}
