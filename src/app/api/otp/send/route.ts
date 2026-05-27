import { NextRequest, NextResponse } from 'next/server'
import { countRecentOtps, createOtpSession } from '@/lib/db'

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

    const apiKey = process.env.FAST2SMS_API_KEY
    if (apiKey) {
      try {
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&flash=0&numbers=${mobile}`
        const res  = await fetch(url, { method: 'GET' })
        const data = await res.json()
        if (data.return) {
          console.log(`[OTP] SMS sent to +91${mobile}`)
        } else {
          console.error('[OTP] Fast2SMS error:', JSON.stringify(data))
        }
      } catch (e) {
        console.error('[OTP] Fast2SMS request failed:', e)
      }
      return NextResponse.json({ success: true })
    }

    // No API key — dev/fallback mode: OTP visible in PM2 logs on server
    console.log(`[OTP] *** DEV MODE — OTP for +91${mobile} is: ${otp} ***`)
    return NextResponse.json({ success: true, dev: true })

  } catch (e) {
    console.error('[OTP] send error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
