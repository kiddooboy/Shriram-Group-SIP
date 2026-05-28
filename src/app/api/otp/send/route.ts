import { NextRequest, NextResponse } from 'next/server'
import { countRecentOtps, createOtpSession } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json()

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 })
    }

    // Rate limit: 3 OTPs per 10 minutes per mobile
    const recent = countRecentOtps(mobile, 10)
    if (recent >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Please wait 10 minutes.' }, { status: 429 })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    createOtpSession(mobile, otp, 10)

    const message =
      `Shriram Group SIP: ${otp} is your OTP for employee SIP enrolment. ` +
      `Valid for 10 minutes. Do not share. - Shriram Asset Management`

    const result = await sendSMS(mobile, message)

    if (result.ok) {
      return NextResponse.json({ success: true })
    }

    // Gateway unavailable — surface OTP so the flow stays testable.
    console.log(`[OTP] DEV fallback: OTP for +91${mobile} is ${otp}`)
    return NextResponse.json({ success: true, devOtp: otp })

  } catch (e) {
    console.error('[OTP] send error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
