'use client'

import { useSIPStore } from '@/store/useSIPStore'

const STEP_LABELS: Record<string, string> = {
  login:             'Verify',
  'funds-select':    'Funds',
  'intent-captured': 'Captured',
  'goal-select':     'Goal',
  'tuned-plan':      'Tuned Plan',
  kyc:               'KYC',
  activation:        'Activate',
  success:           'Activated',
  dashboard:         'Portfolio',
}

export default function Header() {
  const { currentStep, employee } = useSIPStore()
  const showEmployee = ['funds-select', 'intent-captured', 'goal-select', 'tuned-plan', 'kyc', 'activation', 'success', 'dashboard'].includes(currentStep)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cred-black/85 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[11px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shriram--600.png" alt="Shriram SIP" className="w-full h-full object-cover" />
          </div>
          <div className="leading-none">
            <div className="text-white font-bold text-[13px] tracking-tight">Shriram SIP</div>
            <div className="text-white/35 text-[10px] mt-0.5 uppercase tracking-[0.12em]">
              {STEP_LABELS[currentStep] ?? 'Benefit'}
            </div>
          </div>
        </div>

        {showEmployee && employee && (
          <div className="flex items-center gap-2.5">
            <div className="text-right leading-none">
              <div className="text-white text-[12px] font-semibold">{employee.name}</div>
              <div className="text-white/35 text-[10px] mt-0.5">{employee.empId}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
              <span className="text-white/80 font-bold text-xs">{employee.name.charAt(0)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
