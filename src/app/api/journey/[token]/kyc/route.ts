import { NextRequest, NextResponse } from 'next/server'
import { getJourneyByToken, upsertKycDraft, updateJourneyStage } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const journey = getJourneyByToken(params.token)
  if (!journey) {
    return NextResponse.json({ error: 'Journey not found or link expired' }, { status: 404 })
  }

  let data: unknown
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  upsertKycDraft(journey.id, data)
  if (journey.stage === 'intent_captured') {
    updateJourneyStage(journey.id, 'kyc_in_progress')
  }

  return NextResponse.json({ success: true })
}
