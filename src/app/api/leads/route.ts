import { NextResponse } from 'next/server'
import { listRegistrations, listSipIntents } from '@/lib/db'

export async function GET() {
  try {
    const registrations = listRegistrations()
    const intents = listSipIntents()
    return NextResponse.json({ registrations, intents })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
