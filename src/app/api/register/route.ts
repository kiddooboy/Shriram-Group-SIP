import { NextRequest, NextResponse } from 'next/server'
import { insertRegistration } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { employeeId, name, mobile } = await req.json()

    if (!employeeId || !name || !mobile) {
      return NextResponse.json({ error: 'employeeId, name and mobile are required' }, { status: 400 })
    }
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Mobile must be exactly 10 digits' }, { status: 400 })
    }

    const row = insertRegistration(employeeId.trim().toUpperCase(), name.trim(), mobile.trim())
    return NextResponse.json({ success: true, registration: row })
  } catch (err: any) {
    console.error('[register]', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
