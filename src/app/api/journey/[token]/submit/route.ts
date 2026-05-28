import { NextRequest, NextResponse } from 'next/server'
import {
  getJourneyByToken,
  upsertKycDraft,
  insertKycSubmission,
  updateJourneyStage,
} from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const journey = getJourneyByToken(params.token)
  if (!journey) {
    return NextResponse.json({ error: 'Journey not found or link expired' }, { status: 404 })
  }

  let data: any
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Persist the final form state and create the submission record.
  upsertKycDraft(journey.id, data)
  const submission = insertKycSubmission(journey.id, data)
  updateJourneyStage(journey.id, 'kyc_submitted')

  // Confirmation SMS — demo only, gateway failure is non-fatal.
  const msg =
    `Shriram Group SIP: Your KYC has been submitted successfully. ` +
    `Reference: ${submission.reference_number}. - Shriram AMC`
  sendSMS(journey.mobile, msg).catch(() => {})

  return NextResponse.json({
    success: true,
    referenceNumber: submission.reference_number,
    submittedAt:     submission.submitted_at,
  })
}
