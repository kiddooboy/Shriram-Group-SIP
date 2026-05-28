import { NextRequest, NextResponse } from 'next/server'
import { getJourneyByToken, getKycDraft, getKycSubmissionByJourney } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const journey = getJourneyByToken(params.token)
  if (!journey) {
    return NextResponse.json({ error: 'Journey not found or link expired' }, { status: 404 })
  }

  const draft      = getKycDraft(journey.id)
  const submission = getKycSubmissionByJourney(journey.id)

  return NextResponse.json({
    journey: {
      id:             journey.id,
      token:          journey.resume_token,
      employeeId:     journey.employee_id,
      name:           journey.name,
      mobile:         journey.mobile,
      fundId:         journey.fund_id,
      fundName:       journey.fund_name,
      suggestedSip:   journey.suggested_sip,
      consentStatus:  journey.consent_status,
      stage:          journey.stage,
      startedAt:      journey.started_at,
      updatedAt:      journey.updated_at,
    },
    kycDraft: draft ?? null,
    submission: submission
      ? { referenceNumber: submission.reference_number, submittedAt: submission.submitted_at }
      : null,
  })
}
