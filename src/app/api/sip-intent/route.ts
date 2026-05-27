import { NextRequest, NextResponse } from 'next/server'
import { insertSipIntent } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { employeeId, fundId, fundName, suggestedSip } = await req.json()

    if (!employeeId || !fundId || !fundName) {
      return NextResponse.json({ error: 'employeeId, fundId and fundName are required' }, { status: 400 })
    }

    const row = insertSipIntent(
      employeeId.trim().toUpperCase(),
      fundId.trim(),
      fundName.trim(),
      suggestedSip ?? 500,
    )
    return NextResponse.json({ success: true, intent: row })
  } catch (err: any) {
    console.error('[sip-intent]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
