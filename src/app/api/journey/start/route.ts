import { NextRequest, NextResponse } from 'next/server'
import { createJourney } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employeeId,
      name,
      mobile,
      fundId,
      fundName,
      suggestedSip,
      consentStatus,
    } = body ?? {}

    if (!employeeId || !name || !fundId || !fundName) {
      return NextResponse.json(
        { error: 'employeeId, name, fundId and fundName are required' },
        { status: 400 },
      )
    }
    if (!/^\d{10}$/.test(mobile ?? '')) {
      return NextResponse.json({ error: 'Mobile must be exactly 10 digits' }, { status: 400 })
    }

    const journey = createJourney({
      employeeId: String(employeeId).trim().toUpperCase(),
      name:       String(name).trim(),
      mobile:     String(mobile).trim(),
      fundId:     String(fundId).trim(),
      fundName:   String(fundName).trim(),
      suggestedSip: suggestedSip ?? 500,
      consentStatus: consentStatus === 'withdrawn' ? 'withdrawn' : 'given',
      userAgent:  req.headers.get('user-agent'),
      ipAddress:  req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
    })

    // Compose resume link (still returned to the client so the "Continue Now"
    // button can navigate to it directly — but it is NOT included in the SMS,
    // since Fast2SMS Quick route flags URLs as spam and disables the account.
    const origin = req.headers.get('origin')
      || (req.headers.get('host') ? `https://${req.headers.get('host')}` : '')
    const resumeLink = `${origin}/k/${journey.resume_token}`

    const shortRef = `GSIP-${String(journey.id).padStart(6, '0')}`
    const fundLabel = (journey.fund_name ?? 'SIP').slice(0, 28)
    const message =
      `Shriram Group SIP: Your KYC enrolment for ${fundLabel} is queued. ` +
      `Ref ${shortRef}. Complete it within 48 hours to activate. - Shriram AMC`

    const sms = await sendSMS(journey.mobile, message)

    return NextResponse.json({
      success: true,
      journey: {
        token:        journey.resume_token,
        id:           journey.id,
        stage:        journey.stage,
        mobile:       journey.mobile,
        fundName:     journey.fund_name,
        suggestedSip: journey.suggested_sip,
      },
      resumeLink,
      smsSent:    sms.ok,
      // Surfaces the link when the gateway can't deliver, so demos still flow.
      devMessage: sms.ok ? undefined : sms.devMessage,
    })
  } catch (e: any) {
    console.error('[journey/start]', e)
    return NextResponse.json({ error: e?.message ?? 'Internal error' }, { status: 500 })
  }
}
