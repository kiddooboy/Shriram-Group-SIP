import { NextRequest, NextResponse } from 'next/server'
import { verifyOtpSession } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { mobile, otp } = await req.json()

    if (!/^\d{10}$/.test(mobile) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const result = verifyOtpSession(mobile, otp)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[OTP] verify error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
