'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Check, AlertCircle, Loader2, ShieldCheck,
  Upload, FileCheck2, X, CheckCircle2, MessageSquare, Video
} from 'lucide-react'
import { EMPTY_KYC, DEMO_KYC, KycData, SECTIONS, SectionKey, UploadedFileMeta } from './types'
import { validateSection, FieldErrors } from './validators'

interface Props { token: string }

interface JourneyMeta {
  id:             number
  name:           string
  mobile:         string
  fundName:       string | null
  suggestedSip:   number
  stage:          string
}

export default function KYCJourney({ token }: Props) {
  const [loading,    setLoading]    = useState(true)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [journey,    setJourney]    = useState<JourneyMeta | null>(null)
  const [data,       setData]       = useState<KycData>(EMPTY_KYC)
  const [sectionIdx, setSectionIdx] = useState(0)
  const [errors,     setErrors]     = useState<FieldErrors>({})
  const [saving,     setSaving]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<{ ref: string; at: string } | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // ── Load journey & draft ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/journey/${token}`, { cache: 'no-store' })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          if (!cancelled) setErrorMsg(j?.error || 'Resume link not found. Please return to the home page.')
          return
        }
        const j = await res.json()
        if (cancelled) return
        setJourney({
          id:           j.journey.id,
          name:         j.journey.name,
          mobile:       j.journey.mobile,
          fundName:     j.journey.fundName,
          suggestedSip: j.journey.suggestedSip,
          stage:        j.journey.stage,
        })
        if (j.kycDraft) {
          // Resume from saved draft — merge over EMPTY_KYC so newly-added fields are filled.
          setData({ ...EMPTY_KYC, ...j.kycDraft, uploads: { ...EMPTY_KYC.uploads, ...(j.kycDraft.uploads || {}) } })
        } else {
          // Fresh session — prefill realistic demo data tailored to the registered employee.
          const employeeName = j.journey.name?.trim() || 'Demo Employee'
          const slug         = employeeName.toLowerCase().split(/\s+/)[0] || 'employee'
          setData({
            ...DEMO_KYC,
            personal: { ...DEMO_KYC.personal, email: `${slug}@shriram.com` },
            bank:     { ...DEMO_KYC.bank, holderName: employeeName },
          })
        }
        if (j.submission?.referenceNumber) {
          setSubmission({ ref: j.submission.referenceNumber, at: j.submission.submittedAt })
        }
      } catch (_) {
        if (!cancelled) setErrorMsg('Could not load your KYC. Please refresh and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  const currentSection = SECTIONS[sectionIdx].key
  const progressPct    = Math.round(((sectionIdx) / (SECTIONS.length - 1)) * 100)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setNested<K extends keyof KycData>(section: K, patch: Partial<KycData[K]>) {
    setData(d => ({ ...d, [section]: { ...d[section], ...patch } }))
  }

  async function saveDraft(next: KycData) {
    try {
      setSaving(true)
      await fetch(`/api/journey/${token}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
    } catch (_) {
      // non-blocking
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    const fieldErrors = validateSection(currentSection, data)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    await saveDraft(data)
    if (sectionIdx < SECTIONS.length - 1) {
      setSectionIdx(sectionIdx + 1)
      setErrors({})
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  function handleBack() {
    if (sectionIdx > 0) {
      setSectionIdx(sectionIdx - 1)
      setErrors({})
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  async function handleSubmit() {
    const fieldErrors = validateSection('review', data)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/journey/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const j = await res.json()
      if (!res.ok) {
        setErrors({ _summary: j?.error || 'Submission failed. Please try again.' })
      } else {
        setSubmission({ ref: j.referenceNumber, at: j.submittedAt })
      }
    } catch {
      setErrors({ _summary: 'Network error. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / error / submitted states ────────────────────────────────────
  if (loading)   return <CenterLoader message="Loading your KYC journey…" />
  if (errorMsg)  return <CenterError message={errorMsg} />
  if (submission) return <SubmittedScreen reference={submission.ref} at={submission.at} journey={journey} />
  if (!journey)  return <CenterError message="Journey not available." />

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <Greeting journey={journey} progressPct={progressPct} sectionIdx={sectionIdx} saving={saving} />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mt-6">
          <ProgressTracker sectionIdx={sectionIdx} />

          <div ref={sectionRef} className="bg-white rounded-2xl border border-shriram-line shadow-card-lg px-6 sm:px-8 py-7 sm:py-9 scroll-mt-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <SectionHeader sectionKey={currentSection} idx={sectionIdx} total={SECTIONS.length} />
                <SectionBody section={currentSection} data={data} errors={errors} setNested={setNested} setData={setData} />
              </motion.div>
            </AnimatePresence>

            {errors._summary && (
              <div className="mt-5 flex items-start gap-2 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errors._summary}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-shriram-line/60">
              <button
                onClick={handleBack}
                disabled={sectionIdx === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-shriram-line text-shriram-charcoal text-[13.5px] font-semibold hover:border-shriram-gold hover:text-shriram-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {currentSection !== 'review' ? (
                <button
                  onClick={handleNext}
                  className="btn-gold px-5 py-3 text-[14px] rounded-xl flex items-center gap-2"
                >
                  Save & continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-gold px-6 py-3 text-[14px] rounded-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : <>Submit KYC <ShieldCheck className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell components
// ─────────────────────────────────────────────────────────────────────────────

function CenterLoader({ message }: { message: string }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-[3px] border-shriram-line border-t-shriram-gold animate-spin" />
        <p className="text-shriram-muted text-[14px]">{message}</p>
      </div>
    </section>
  )
}

function CenterError({ message }: { message: string }) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-white border border-shriram-line rounded-2xl p-8 shadow-card-lg">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-shriram-dark font-bold text-[18px] mb-2">Link not available</h2>
        <p className="text-shriram-muted text-[13.5px] mb-5">{message}</p>
        <a href="/" className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px]">Return home <ArrowRight className="w-4 h-4" /></a>
      </div>
    </section>
  )
}

function Greeting({ journey, progressPct, sectionIdx, saving }: {
  journey: JourneyMeta
  progressPct: number
  sectionIdx: number
  saving: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-shriram-line p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <span className="eyebrow-dark">Secure e-KYC Verification 🔒</span>
        <h1 className="text-[22px] sm:text-[26px] font-bold font-display text-shriram-dark tracking-tight mt-1">
          Welcome back, {journey.name.split(' ')[0] || 'Investor'}
        </h1>
        <p className="text-shriram-muted text-[13px] mt-1.5 leading-relaxed">
          Step {sectionIdx + 1} of {SECTIONS.length} · {journey.fundName ?? 'Shriram SIP'} · ₹{journey.suggestedSip}/mo
        </p>
      </div>
      <div className="sm:w-72 shrink-0">
        <div className="flex items-center justify-between text-[11.5px] text-shriram-muted font-semibold mb-1.5">
          <span>{progressPct}% complete</span>
          {saving && <span className="flex items-center gap-1 text-shriram-gold"><Loader2 className="w-3 h-3 animate-spin" /> Saving</span>}
        </div>
        <div className="h-2 bg-shriram-line rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-shriram-gold rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function ProgressTracker({ sectionIdx }: { sectionIdx: number }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 bg-white rounded-2xl border border-shriram-line p-4 shadow-card">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-muted mb-3 px-1">
          KYC checklist
        </div>
        <ol className="space-y-1">
          {SECTIONS.map((s, i) => {
            const done   = i < sectionIdx
            const active = i === sectionIdx
            return (
              <li key={s.key} className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                active ? 'bg-shriram-gold/10 text-shriram-dark font-semibold' :
                done   ? 'text-shriram-gold' :
                         'text-shriram-muted/70'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  active ? 'bg-shriram-gold text-shriram-dark' :
                  done   ? 'bg-shriram-gold/20 text-shriram-gold' :
                           'bg-shriram-line/70 text-shriram-muted/70'
                }`}>
                  {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                {s.label}
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}

function SectionHeader({ sectionKey, idx, total }: { sectionKey: SectionKey; idx: number; total: number }) {
  const meta = SECTIONS.find(s => s.key === sectionKey)!
  const subtitles: Record<SectionKey, string> = {
    personal:   'Tell us a bit about yourself. All fields match what is on your government IDs.',
    pan:        'Your PAN is required by SEBI for all mutual-fund investments.',
    aadhaar:    'We use Aadhaar to e-verify your identity. Only the last 4 digits will be stored.',
    address:    'Your current residential address as per your Aadhaar / utility bill.',
    occupation: 'Required for KYC risk-categorisation under PMLA rules.',
    bank:       'The bank account that will be debited each month for your SIP.',
    nominee:    'Your nominee will receive the SIP value in the unfortunate event of your demise.',
    fatca:      'Mandatory tax-residency declarations under FATCA / CRS regulations.',
    uploads:    'Clear photos of the original documents. JPG, PNG or PDF up to 5 MB each.',
    videoKyc:   'Live webcam liveness check required by SEBI to verify your identity and prevent fraud.',
    consents:   'Please read and acknowledge the following declarations to proceed.',
    review:     'Review everything before final submission. You can go back to edit any section.',
  }
  return (
    <div className="mb-6">
      <span className="text-[11px] font-bold uppercase tracking-wider text-shriram-gold">Section {idx + 1} of {total}</span>
      <h2 className="text-[22px] sm:text-[24px] font-bold font-display text-shriram-dark tracking-tight mt-1">
        {meta.label}
      </h2>
      <p className="text-shriram-muted text-[13px] mt-1.5 leading-relaxed">{subtitles[sectionKey]}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section bodies
// ─────────────────────────────────────────────────────────────────────────────

interface BodyProps {
  section:   SectionKey
  data:      KycData
  errors:    FieldErrors
  setNested: <K extends keyof KycData>(section: K, patch: Partial<KycData[K]>) => void
  setData:   React.Dispatch<React.SetStateAction<KycData>>
}

function SectionBody(props: BodyProps) {
  const { section } = props
  switch (section) {
    case 'personal':   return <PersonalSection {...props} />
    case 'pan':        return <PanSection {...props} />
    case 'aadhaar':    return <AadhaarSection {...props} />
    case 'address':    return <AddressSection {...props} />
    case 'occupation': return <OccupationSection {...props} />
    case 'bank':       return <BankSection {...props} />
    case 'nominee':    return <NomineeSection {...props} />
    case 'fatca':      return <FatcaSection {...props} />
    case 'uploads':    return <UploadsSection {...props} />
    case 'videoKyc':   return <VideoKycSection {...props} />
    case 'consents':   return <ConsentsSection {...props} />
    case 'review':     return <ReviewSection {...props} />
  }
}

// ── Field primitives ──────────────────────────────────────────────────────────

function Field({ label, error, children, required }: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-shriram-charcoal mb-1.5">
        {label}{required && <span className="text-shriram-gold ml-0.5">*</span>}
      </label>
      {children}
      {error && <div className="text-red-600 text-[11.5px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>}
    </div>
  )
}

const inputBase =
  'w-full px-4 py-2.5 rounded-xl border border-shriram-line bg-white text-[14px] text-shriram-dark ' +
  'focus:outline-none focus:border-shriram-gold focus:ring-2 focus:ring-shriram-gold/20 transition-colors'

// ─────────────────────────────────────────────────────────────────────────────
// Personal
// ─────────────────────────────────────────────────────────────────────────────
function PersonalSection({ data, errors, setNested }: BodyProps) {
  const p = data.personal
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Date of birth" error={errors.dob} required>
        <input type="date" className={inputBase} value={p.dob} onChange={e => setNested('personal', { dob: e.target.value })} max={new Date().toISOString().slice(0,10)} />
      </Field>
      <Field label="Gender" error={errors.gender} required>
        <select className={inputBase} value={p.gender} onChange={e => setNested('personal', { gender: e.target.value as any })}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Marital status" error={errors.maritalStatus} required>
        <select className={inputBase} value={p.maritalStatus} onChange={e => setNested('personal', { maritalStatus: e.target.value as any })}>
          <option value="">Select</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
      </Field>
      <Field label="Email address" error={errors.email} required>
        <input type="email" className={inputBase} value={p.email} onChange={e => setNested('personal', { email: e.target.value })} placeholder="you@example.com" />
      </Field>
      <Field label="Father's name" error={errors.fatherName} required>
        <input type="text" className={inputBase} value={p.fatherName} onChange={e => setNested('personal', { fatherName: e.target.value })} placeholder="As per official ID" />
      </Field>
      <Field label="Mother's name" error={errors.motherName} required>
        <input type="text" className={inputBase} value={p.motherName} onChange={e => setNested('personal', { motherName: e.target.value })} placeholder="As per official ID" />
      </Field>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAN
// ─────────────────────────────────────────────────────────────────────────────
function PanSection({ data, errors, setNested }: BodyProps) {
  return (
    <div className="max-w-md">
      <Field label="PAN number" error={errors.number} required>
        <input
          type="text"
          className={`${inputBase} font-mono tracking-widest uppercase`}
          value={data.pan.number}
          onChange={e => setNested('pan', { number: e.target.value.toUpperCase().slice(0, 10) })}
          placeholder="ABCDE1234F"
          maxLength={10}
        />
      </Field>
      <div className="mt-4 bg-shriram-cream border border-shriram-line rounded-xl p-4 text-[12.5px] text-shriram-muted leading-relaxed">
        Your PAN will be verified against the Income Tax department's database. The name on your PAN must match the name you entered earlier.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Aadhaar
// ─────────────────────────────────────────────────────────────────────────────
function AadhaarSection({ data, errors, setNested }: BodyProps) {
  function formatAadhaar(v: string) {
    return v.replace(/\D/g, '').slice(0, 12).replace(/(.{4})(?=.)/g, '$1 ')
  }
  return (
    <div className="max-w-md">
      <Field label="Aadhaar number" error={errors.number} required>
        <input
          type="text"
          className={`${inputBase} font-mono tracking-widest`}
          value={formatAadhaar(data.aadhaar.number)}
          onChange={e => setNested('aadhaar', { number: e.target.value.replace(/\s/g, '') })}
          placeholder="1234 5678 9012"
          maxLength={14}
          inputMode="numeric"
        />
      </Field>
      <label className="mt-4 flex items-start gap-2.5 cursor-pointer text-[12.5px] text-shriram-charcoal leading-relaxed">
        <input
          type="checkbox"
          checked={data.aadhaar.linkedMobile}
          onChange={e => setNested('aadhaar', { linkedMobile: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-shriram-gold shrink-0"
        />
        <span>My mobile number is linked to my Aadhaar. (Required for OTP-based e-KYC.)</span>
      </label>
      <div className="mt-4 bg-shriram-cream border border-shriram-line rounded-xl p-4 text-[12.5px] text-shriram-muted leading-relaxed">
        We will send a one-time password to your Aadhaar-linked mobile. Only the last 4 digits of your Aadhaar will be stored in our records — the full number is never persisted.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────────────────────
function AddressSection({ data, errors, setNested }: BodyProps) {
  const a = data.address
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <Field label="Address line 1" error={errors.line1} required>
          <input type="text" className={inputBase} value={a.line1} onChange={e => setNested('address', { line1: e.target.value })} placeholder="House / Flat no, Building" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Address line 2">
          <input type="text" className={inputBase} value={a.line2} onChange={e => setNested('address', { line2: e.target.value })} placeholder="Street, Locality (optional)" />
        </Field>
      </div>
      <Field label="City" error={errors.city} required>
        <input type="text" className={inputBase} value={a.city} onChange={e => setNested('address', { city: e.target.value })} />
      </Field>
      <Field label="State" error={errors.state} required>
        <input type="text" className={inputBase} value={a.state} onChange={e => setNested('address', { state: e.target.value })} />
      </Field>
      <Field label="Pincode" error={errors.pincode} required>
        <input type="text" inputMode="numeric" maxLength={6} className={`${inputBase} font-mono`} value={a.pincode} onChange={e => setNested('address', { pincode: e.target.value.replace(/\D/g, '') })} />
      </Field>
      <Field label="Country">
        <input type="text" className={`${inputBase} bg-shriram-cream`} value={a.country} disabled />
      </Field>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Occupation
// ─────────────────────────────────────────────────────────────────────────────
function OccupationSection({ data, errors, setNested }: BodyProps) {
  const o = data.occupation
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Occupation" error={errors.occupation} required>
        <select className={inputBase} value={o.occupation} onChange={e => setNested('occupation', { occupation: e.target.value })}>
          <option value="">Select</option>
          <option value="salaried">Salaried (Private)</option>
          <option value="govt">Government employee</option>
          <option value="business">Business / Self-employed</option>
          <option value="professional">Professional (CA / Doctor / etc.)</option>
          <option value="retired">Retired</option>
          <option value="homemaker">Homemaker</option>
          <option value="student">Student</option>
        </select>
      </Field>
      <Field label="Employer / Firm name" error={errors.employer} required>
        <input type="text" className={inputBase} value={o.employer} onChange={e => setNested('occupation', { employer: e.target.value })} placeholder="Shriram Group" />
      </Field>
      <Field label="Annual income (₹)" error={errors.annualIncome} required>
        <select className={inputBase} value={o.annualIncome} onChange={e => setNested('occupation', { annualIncome: e.target.value })}>
          <option value="">Select</option>
          <option value="0-1L">Below ₹1 Lakh</option>
          <option value="1L-5L">₹1 – 5 Lakhs</option>
          <option value="5L-10L">₹5 – 10 Lakhs</option>
          <option value="10L-25L">₹10 – 25 Lakhs</option>
          <option value="25L-50L">₹25 – 50 Lakhs</option>
          <option value="50L+">Above ₹50 Lakhs</option>
        </select>
      </Field>
      <Field label="Source of funds" error={errors.sourceOfFunds}>
        <select className={inputBase} value={o.sourceOfFunds} onChange={e => setNested('occupation', { sourceOfFunds: e.target.value })}>
          <option value="Salary">Salary</option>
          <option value="Business income">Business income</option>
          <option value="Inheritance">Inheritance</option>
          <option value="Savings">Savings</option>
          <option value="Other">Other</option>
        </select>
      </Field>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Bank
// ─────────────────────────────────────────────────────────────────────────────
function BankSection({ data, errors, setNested }: BodyProps) {
  const b = data.bank
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Account number" error={errors.accountNumber} required>
        <input type="text" inputMode="numeric" className={`${inputBase} font-mono`} value={b.accountNumber} onChange={e => setNested('bank', { accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })} />
      </Field>
      <Field label="Confirm account number" error={errors.confirmAccountNumber} required>
        <input type="text" inputMode="numeric" className={`${inputBase} font-mono`} value={b.confirmAccountNumber} onChange={e => setNested('bank', { confirmAccountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })} />
      </Field>
      <Field label="IFSC code" error={errors.ifsc} required>
        <input type="text" className={`${inputBase} font-mono tracking-widest uppercase`} value={b.ifsc} onChange={e => setNested('bank', { ifsc: e.target.value.toUpperCase().slice(0, 11) })} placeholder="SBIN0001234" maxLength={11} />
      </Field>
      <Field label="Branch name" error={errors.branchName}>
        <input type="text" className={inputBase} value={b.branchName} onChange={e => setNested('bank', { branchName: e.target.value })} placeholder="(optional)" />
      </Field>
      <Field label="Account holder name" error={errors.holderName} required>
        <input type="text" className={inputBase} value={b.holderName} onChange={e => setNested('bank', { holderName: e.target.value })} placeholder="As on bank passbook" />
      </Field>
      <Field label="Account type" error={errors.accountType} required>
        <select className={inputBase} value={b.accountType} onChange={e => setNested('bank', { accountType: e.target.value as any })}>
          <option value="">Select</option>
          <option value="savings">Savings</option>
          <option value="current">Current</option>
        </select>
      </Field>
      <div className="sm:col-span-2 bg-shriram-cream border border-shriram-line rounded-xl p-4 text-[12.5px] text-shriram-muted leading-relaxed">
        Your bank account will be verified via a ₹1 penny-drop to confirm the holder name matches your PAN. The ₹1 will be refunded immediately.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Nominee
// ─────────────────────────────────────────────────────────────────────────────
function NomineeSection({ data, errors, setNested }: BodyProps) {
  const n = data.nominee
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label="Nominee full name" error={errors.name} required>
        <input type="text" className={inputBase} value={n.name} onChange={e => setNested('nominee', { name: e.target.value })} />
      </Field>
      <Field label="Relationship" error={errors.relation} required>
        <select className={inputBase} value={n.relation} onChange={e => setNested('nominee', { relation: e.target.value })}>
          <option value="">Select</option>
          <option value="Spouse">Spouse</option>
          <option value="Parent">Parent</option>
          <option value="Child">Child</option>
          <option value="Sibling">Sibling</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Nominee date of birth" error={errors.dob} required>
        <input type="date" className={inputBase} value={n.dob} onChange={e => setNested('nominee', { dob: e.target.value })} max={new Date().toISOString().slice(0,10)} />
      </Field>
      <Field label="Share %" error={errors.sharePct} required>
        <input type="number" min={1} max={100} className={inputBase} value={n.sharePct} onChange={e => setNested('nominee', { sharePct: Number(e.target.value) })} />
      </Field>
      <div className="sm:col-span-2 bg-shriram-cream border border-shriram-line rounded-xl p-4 text-[12.5px] text-shriram-muted leading-relaxed">
        You may add up to three nominees. For this demo we capture a single nominee with 100% share. Multi-nominee support is on the production roadmap.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FATCA
// ─────────────────────────────────────────────────────────────────────────────
function FatcaSection({ data, errors, setNested }: BodyProps) {
  const f = data.fatca
  return (
    <div className="space-y-6">
      <YesNoRow label="Are you a tax resident of India?" value={f.indianTaxResident} onChange={v => setNested('fatca', { indianTaxResident: v })} error={errors.indianTaxResident} />
      <YesNoRow label="Are you a U.S. person for tax purposes (citizen / green-card holder)?" value={f.usPerson} onChange={v => setNested('fatca', { usPerson: v })} error={errors.usPerson} />
      {f.usPerson === 'yes' && (
        <Field label="If yes, please specify your other tax jurisdiction(s)" error={errors.otherTaxJurisdiction} required>
          <input type="text" className={inputBase} value={f.otherTaxJurisdiction} onChange={e => setNested('fatca', { otherTaxJurisdiction: e.target.value })} placeholder="Country & Tax ID" />
        </Field>
      )}
      <YesNoRow label="Are you a Politically Exposed Person (PEP) or related to one?" value={f.politicallyExposed} onChange={v => setNested('fatca', { politicallyExposed: v })} error={errors.politicallyExposed} />
    </div>
  )
}

function YesNoRow({ label, value, onChange, error }: {
  label: string
  value: 'yes' | 'no' | ''
  onChange: (v: 'yes' | 'no') => void
  error?: string
}) {
  return (
    <div>
      <div className="text-[13px] text-shriram-charcoal font-semibold leading-relaxed mb-2">{label}</div>
      <div className="flex gap-2">
        {(['yes', 'no'] as const).map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-5 py-2 rounded-xl border-2 text-[13px] font-semibold capitalize transition-colors ${
              value === opt
                ? 'border-shriram-gold bg-shriram-gold/10 text-shriram-dark'
                : 'border-shriram-line text-shriram-muted hover:border-shriram-gold/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <div className="text-red-600 text-[11.5px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Uploads
// ─────────────────────────────────────────────────────────────────────────────
function UploadsSection({ data, errors, setData }: BodyProps) {
  function handleFile(key: 'panCard' | 'aadhaar' | 'signature', file: File | null) {
    if (!file) {
      setData(d => ({ ...d, uploads: { ...d.uploads, [key]: undefined } }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5 MB.')
      return
    }
    const meta: UploadedFileMeta = { name: file.name, size: file.size, type: file.type }
    setData(d => ({ ...d, uploads: { ...d.uploads, [key]: meta } }))
  }
  return (
    <div className="space-y-4">
      <UploadCard label="PAN card"           caption="Front side, all four corners visible." value={data.uploads.panCard}   onPick={f => handleFile('panCard', f)}   onClear={() => handleFile('panCard', null)}   error={errors.panCard} />
      <UploadCard label="Aadhaar card"       caption="Front and back side, both readable."  value={data.uploads.aadhaar}   onPick={f => handleFile('aadhaar', f)}   onClear={() => handleFile('aadhaar', null)}   error={errors.aadhaar} />
      <UploadCard label="Signature / photo"  caption="A clear photo of your signature on plain paper, OR a passport photo." value={data.uploads.signature} onPick={f => handleFile('signature', f)} onClear={() => handleFile('signature', null)} error={errors.signature} />
    </div>
  )
}

function UploadCard({ label, caption, value, onPick, onClear, error }: {
  label:   string
  caption: string
  value?:  UploadedFileMeta
  onPick:  (f: File | null) => void
  onClear: () => void
  error?:  string
}) {
  return (
    <div className={`rounded-xl border-2 px-4 py-4 transition-colors ${value ? 'border-shriram-gold bg-shriram-gold/5' : error ? 'border-red-300 bg-red-50/40' : 'border-shriram-line bg-white hover:border-shriram-gold/50'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${value ? 'bg-shriram-gold text-shriram-dark' : 'bg-shriram-line/60 text-shriram-muted'}`}>
          {value ? <FileCheck2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-shriram-dark font-semibold text-[14px]">{label}</div>
          {value ? (
            <div className="text-shriram-muted text-[12px] mt-0.5 truncate">
              {value.name} <span className="text-shriram-muted/60">· {(value.size / 1024).toFixed(0)} KB</span>
            </div>
          ) : (
            <div className="text-shriram-muted text-[12px] mt-0.5">{caption}</div>
          )}
          {error && <div className="text-red-600 text-[11.5px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>}
        </div>
        <div className="shrink-0">
          {value ? (
            <button type="button" onClick={onClear} className="p-2 rounded-lg text-shriram-muted hover:text-red-500 hover:bg-red-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <label className="cursor-pointer text-[12.5px] font-semibold text-shriram-gold hover:text-shriram-gold-dark px-3 py-1.5 rounded-lg border border-shriram-gold/40 hover:bg-shriram-gold/5 transition-colors">
              Choose file
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="hidden"
                onChange={e => onPick(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Video KYC Step (Simulated & Interactive)
// ─────────────────────────────────────────────────────────────────────────────
function VideoKycSection({ data, errors, setNested, setData }: BodyProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [step, setStep] = useState<'init' | 'recording' | 'verifying' | 'success'>('init')
  const [countdown, setCountdown] = useState(4)
  const [loaderMsg, setLoaderMsg] = useState('Analysing face coordinates...')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start webcam feed if permitted
  async function startCamera() {
    try {
      setPermissionState('prompt')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
        audio: false
      })
      setStream(mediaStream)
      streamRef.current = mediaStream
      setPermissionState('granted')
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err)
      setPermissionState('denied')
    }
  }

  // Stop camera feed
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setStream(null)
  }

  useEffect(() => {
    // Attempt to start camera immediately on mount
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  // Start simulated recording countdown
  function handleStartVerification() {
    setStep('recording')
    setCountdown(4)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Move to verifying stage
          handleVerifyStage()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Simulated AI Verification steps
  function handleVerifyStage() {
    setStep('verifying')
    
    // Step 1: Liveness detection
    setLoaderMsg('Running real-time liveness detection...')
    
    // Step 2: Match facial vectors with PAN card uploads
    setTimeout(() => {
      setLoaderMsg('Matching face coordinates with uploaded PAN Card...')
    }, 1200)

    // Step 3: Run anti-spoofing
    setTimeout(() => {
      setLoaderMsg('Running anti-spoofing and deepfake filters...')
    }, 2400)

    // Step 4: Confirm verification success
    setTimeout(() => {
      setLoaderMsg('Biometric verification verified successfully!')
    }, 3600)

    // Complete verification
    setTimeout(() => {
      setStep('success')
      setData(d => ({
        ...d,
        videoKyc: {
          verified: true,
          completedAt: new Date().toLocaleString('en-IN'),
          verificationCode: '8492'
        }
      }))
      stopCamera()
    }, 4500)
  }

  return (
    <div className="space-y-6">
      <div className="bg-shriram-cream/40 border border-shriram-line/60 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
        
        {/* Left column: Sleek Viewfinder */}
        <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-shriram-charcoal border-4 border-white shadow-card-lg flex items-center justify-center shrink-0">
          
          {permissionState === 'granted' && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            /* Premium Animated Mock Scan Viewfinder */
            <div className="absolute inset-0 bg-gradient-to-b from-shriram-charcoal to-shriram-dark flex flex-col items-center justify-center p-4">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-shriram-gold/40 flex items-center justify-center mb-3 animate-[spin_10s_linear_infinity]">
                <div className="w-12 h-12 rounded-full bg-shriram-gold/10 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-shriram-gold/20" />
                </div>
              </div>
              <span className="text-[12px] text-white/50 font-semibold text-center">Camera Access Pending</span>
              {permissionState === 'denied' && (
                <button
                  onClick={startCamera}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-shriram-gold/20 border border-shriram-gold/40 text-[11px] text-shriram-gold font-bold hover:bg-shriram-gold/30 transition-colors"
                >
                  Retry Permission
                </button>
              )}
            </div>
          )}

          {/* Biometric overlay guide (oval scan area) */}
          {step !== 'success' && (
            <div className="absolute inset-0 border-2 border-dashed border-shriram-gold/20 rounded-3xl pointer-events-none flex items-center justify-center">
              <div className={`w-[170px] h-[210px] rounded-[50%] border-2 transition-all duration-300 ${
                step === 'recording' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' :
                step === 'verifying' ? 'border-shriram-gold shadow-[0_0_15px_rgba(207,164,73,0.4)] animate-pulse' :
                'border-shriram-gold/50'
              }`}>
                {/* Crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-px bg-white/20" />
                  <div className="h-6 w-px bg-white/20" />
                </div>
              </div>
            </div>
          )}

          {/* Pulsating Recording indicator */}
          {step === 'recording' && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-[10.5px] font-bold text-white shadow backdrop-blur">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>REC</span>
            </div>
          )}

          {/* Success tick overlay */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-emerald-600/95 flex flex-col items-center justify-center p-4 text-center z-20 text-white"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow">
                <Check className="w-9 h-9 text-emerald-600" strokeWidth={3} />
              </div>
              <span className="font-extrabold text-[15px] block">Liveness Verified</span>
              <span className="text-[11px] text-white/80 block mt-0.5">Biometrics Aligned (98.6%)</span>
            </motion.div>
          )}
        </div>

        {/* Right column: Instructions / Verification panel */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-shriram-gold/10 border border-shriram-gold/30 text-shriram-gold text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded">
              Liveness Check
            </span>
            <span className="text-shriram-muted text-[11px] font-semibold">
              SEBI Compliant Step
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'init' && (
              <motion.div
                key="init"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-shriram-dark font-extrabold text-[16px] leading-tight">
                  Verify your identity in real-time
                </h3>
                <p className="text-shriram-muted text-[12.5px] leading-relaxed">
                  To complete your onboarding, click below to start a secure video scan. You will be asked to hold steady and read aloud the confirmation code.
                </p>

                <div className="bg-shriram-cream border border-shriram-line p-3 rounded-xl">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-shriram-gold mb-1">
                    Your Verification Code
                  </div>
                  <div className="text-[26px] font-extrabold tracking-[0.2em] font-mono text-shriram-dark">
                    8492
                  </div>
                  <span className="text-[11.5px] text-shriram-muted">
                    Read this code clearly aloud while holding your face in the oval frame.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleStartVerification}
                  className="btn-gold px-6 py-3 rounded-xl text-[13.5px] font-bold flex items-center gap-2 w-full sm:w-auto shadow-md"
                >
                  Start Video KYC <Video className="w-4.5 h-4.5" />
                </button>
              </motion.div>
            )}

            {step === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-red-600 font-extrabold text-[16.5px] leading-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
                  Recording verification stream...
                </h3>
                
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-[12.5px] text-red-900 block font-semibold leading-relaxed">
                    Say code: <span className="text-[22px] font-extrabold font-mono text-red-700 tracking-wider">8492</span>
                  </span>
                  <span className="text-[11.5px] text-red-700 block mt-1">
                    Hold steady in good lighting. Time remaining: <span className="font-bold text-[14px]">{countdown}s</span>
                  </span>
                </div>

                <div className="flex gap-2 items-center text-[12px] text-shriram-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Capturing frame data & reading verification code...</span>
                </div>
              </motion.div>
            )}

            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-shriram-dark font-extrabold text-[16.5px] leading-tight">
                  Running AI Biometric Match
                </h3>
                
                <div className="p-4 bg-shriram-gold/5 border border-shriram-gold/20 rounded-xl flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-shriram-gold shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[12.5px] text-shriram-dark font-semibold block leading-tight truncate">
                      {loaderMsg}
                    </span>
                    <span className="text-[11.5px] text-shriram-muted block mt-0.5">
                      Verifying stream against PAN card records...
                    </span>
                  </div>
                </div>

                <div className="w-full bg-shriram-line h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-shriram-gold"
                    initial={{ width: "10%" }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 4.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                  <h3 className="font-extrabold text-[17px]">
                    Video KYC Verified!
                  </h3>
                </div>
                <p className="text-shriram-muted text-[12.5px] leading-relaxed">
                  Liveness confirmation and biometric checking completed successfully. Shriram Group compliance has pre-verified your facial records.
                </p>

                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[12px] text-emerald-800 leading-normal">
                  <div className="flex justify-between items-center py-0.5 font-bold">
                    <span>Liveness match score</span>
                    <span>98.6% (Passed)</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-emerald-700 mt-1">
                    <span>Verified code matched</span>
                    <span>"8492" ✓</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 text-emerald-700">
                    <span>Biometric reference</span>
                    <span className="font-mono">V-KYC-942851</span>
                  </div>
                </div>

                <span className="text-[11px] text-shriram-gold font-bold block animate-pulse">
                  ✓ Click 'Save & continue' below to advance to consents.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {errors.videoKyc && (
        <div className="text-red-600 text-[11.5px] mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {errors.videoKyc}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Consents
// ─────────────────────────────────────────────────────────────────────────────
function ConsentsSection({ data, errors, setNested }: BodyProps) {
  const c = data.consents
  const rows: { key: keyof typeof c; label: string; required: boolean }[] = [
    { key: 'dataPrivacy',         label: 'I consent to Shriram Asset Management processing my personal data in accordance with the Privacy Policy and applicable Indian data protection laws.',                                  required: true },
    { key: 'riskAcknowledged',    label: 'I understand that mutual fund investments are subject to market risk and that past performance is not indicative of future returns. I have read all scheme-related documents.', required: true },
    { key: 'debitAuthorisation',  label: 'I authorise my employer to deduct the SIP amount from my monthly salary and remit it to the chosen mutual fund scheme.',                                                          required: true },
    { key: 'truthfulDeclaration', label: 'I declare that all information provided in this form is true, complete and correct to the best of my knowledge.',                                                                  required: true },
  ]
  return (
    <div className="space-y-4">
      {rows.map(r => (
        <label key={r.key} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${c[r.key] ? 'border-shriram-gold bg-shriram-gold/5' : 'border-shriram-line hover:border-shriram-gold/40 bg-white'}`}>
          <input
            type="checkbox"
            checked={c[r.key]}
            onChange={e => setNested('consents', { [r.key]: e.target.checked } as any)}
            className="mt-0.5 w-4 h-4 accent-shriram-gold shrink-0"
          />
          <span className="text-[13px] text-shriram-charcoal leading-relaxed">
            {r.label}{r.required && <span className="text-shriram-gold ml-0.5">*</span>}
            {errors[r.key] && <span className="block text-red-600 text-[11.5px] mt-1">{errors[r.key]}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Review & submit
// ─────────────────────────────────────────────────────────────────────────────
function ReviewSection({ data }: BodyProps) {
  const rows: { title: string; entries: [string, string][] }[] = [
    { title: 'Personal', entries: [
      ['Date of birth',     data.personal.dob || '—'],
      ['Gender',            data.personal.gender || '—'],
      ['Marital status',    data.personal.maritalStatus || '—'],
      ['Email',             data.personal.email || '—'],
      ["Father's name",     data.personal.fatherName || '—'],
      ["Mother's name",     data.personal.motherName || '—'],
    ]},
    { title: 'Identity', entries: [
      ['PAN',     data.pan.number || '—'],
      ['Aadhaar', data.aadhaar.number ? `XXXX XXXX ${data.aadhaar.number.slice(-4)}` : '—'],
    ]},
    { title: 'Address', entries: [
      ['Line 1',  data.address.line1 || '—'],
      ['Line 2',  data.address.line2 || '—'],
      ['City',    data.address.city || '—'],
      ['State',   data.address.state || '—'],
      ['Pincode', data.address.pincode || '—'],
    ]},
    { title: 'Occupation', entries: [
      ['Occupation',     data.occupation.occupation || '—'],
      ['Employer',       data.occupation.employer || '—'],
      ['Annual income',  data.occupation.annualIncome || '—'],
      ['Source of funds',data.occupation.sourceOfFunds || '—'],
    ]},
    { title: 'Bank account', entries: [
      ['Account no.',  data.bank.accountNumber ? `XXXX${data.bank.accountNumber.slice(-4)}` : '—'],
      ['IFSC',         data.bank.ifsc || '—'],
      ['Account type', data.bank.accountType || '—'],
      ['Holder',       data.bank.holderName || '—'],
    ]},
    { title: 'Nominee', entries: [
      ['Name',     data.nominee.name || '—'],
      ['Relation', data.nominee.relation || '—'],
      ['Share %',  String(data.nominee.sharePct || '—')],
      ['DOB',      data.nominee.dob || '—'],
    ]},
    { title: 'FATCA', entries: [
      ['Indian tax resident', data.fatca.indianTaxResident || '—'],
      ['US person',           data.fatca.usPerson || '—'],
      ['PEP',                 data.fatca.politicallyExposed || '—'],
    ]},
    { title: 'Uploads', entries: [
      ['PAN card',  data.uploads.panCard?.name   ?? '—'],
      ['Aadhaar',   data.uploads.aadhaar?.name   ?? '—'],
      ['Signature', data.uploads.signature?.name ?? '—'],
    ]},
    { title: 'Video KYC', entries: [
      ['Status',         data.videoKyc.verified ? 'Verified successfully ✓' : 'Pending — Action required'],
      ['Completed at',   data.videoKyc.completedAt || '—'],
      ['Verified code',  data.videoKyc.verificationCode || '—'],
    ]},
  ]
  return (
    <div className="space-y-5">
      {rows.map(group => (
        <div key={group.title} className="bg-shriram-cream border border-shriram-line rounded-xl p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-shriram-gold mb-2">{group.title}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6">
            {group.entries.map(([label, value]) => (
              <div key={label} className="flex justify-between text-[13px] py-0.5">
                <span className="text-shriram-muted">{label}</span>
                <span className="text-shriram-dark font-semibold text-right max-w-[60%] truncate" title={value}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-shriram-gold/10 border border-shriram-gold/40 rounded-xl p-4 text-[12.5px] text-shriram-dark leading-relaxed">
        By clicking <span className="font-bold">Submit KYC</span>, you authorise Shriram Asset Management to process this application and initiate your SIP enrolment. You will receive a confirmation SMS with your reference number.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Submitted screen
// ─────────────────────────────────────────────────────────────────────────────
function SubmittedScreen({ reference, at, journey }: { reference: string; at: string; journey: JourneyMeta | null }) {
  return (
    <section className="px-4 py-12 sm:py-20">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-shriram-line shadow-card-lg overflow-hidden"
        >
          <div className="bg-gradient-to-br from-shriram-dark to-shriram-charcoal px-8 py-9 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern bg-[size:20px_20px] opacity-50 pointer-events-none" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-shriram-gold flex items-center justify-center mx-auto mb-5 shadow-gold relative z-10"
            >
              <CheckCircle2 className="w-10 h-10 text-shriram-dark" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-white text-[24px] font-bold font-display tracking-tight mb-2">KYC submitted successfully</h2>
            <p className="text-white/65 text-[13.5px] leading-relaxed">
              Your application is now in queue for verification. We'll text you on{' '}
              <span className="text-shriram-gold font-bold">+91 {journey?.mobile?.slice(0, 5)}·····</span>{' '}
              once your KYC is approved.
            </p>
          </div>

          <div className="px-8 py-7">
            <div className="bg-shriram-cream border border-shriram-line rounded-xl p-5 mb-6">
              <div className="text-shriram-muted text-[10.5px] font-bold uppercase tracking-wider mb-3">Confirmation</div>
              <div className="flex justify-between items-center py-1.5 border-b border-shriram-line/50">
                <span className="text-shriram-muted text-[12.5px]">Reference number</span>
                <span className="text-shriram-dark font-bold text-[13px] font-mono">{reference}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-shriram-line/50">
                <span className="text-shriram-muted text-[12.5px]">Submitted at</span>
                <span className="text-shriram-dark font-bold text-[13px]">{at}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-shriram-muted text-[12.5px]">Fund</span>
                <span className="text-shriram-dark font-bold text-[13px]">{journey?.fundName ?? 'Shriram SIP'}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Verification (under 24 hrs)', desc: 'Our team verifies PAN, Aadhaar, and bank details.' },
                { label: 'Mandate activation',          desc: 'Salary deduction is auto-set with your employer.' },
                { label: 'First SIP runs on the 1st',    desc: 'Of the next calendar month.' },
              ].map(s => (
                <div key={s.label} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-shriram-gold shrink-0 mt-0.5" />
                  <div>
                    <div className="text-shriram-dark font-semibold text-[13.5px]">{s.label}</div>
                    <div className="text-shriram-muted text-[12.5px]">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <a href="/" className="btn-gold w-full py-3.5 text-[14px] rounded-xl flex items-center justify-center gap-2">
              Back to home <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        <p className="text-shriram-muted/60 text-[11px] text-center mt-6 px-4">
          A confirmation SMS with your reference number has been sent to your registered mobile number.
        </p>
      </div>
    </section>
  )
}
