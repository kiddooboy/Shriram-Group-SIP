import { KycData, SectionKey } from './types'

export type FieldErrors = Partial<Record<string, string>>

const PAN_RE     = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAAR_RE = /^\d{12}$/
const IFSC_RE    = /^[A-Z]{4}0[A-Z0-9]{6}$/
const PINCODE_RE = /^\d{6}$/
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateSection(section: SectionKey, data: KycData): FieldErrors {
  const e: FieldErrors = {}
  switch (section) {
    case 'personal': {
      if (!data.personal.dob) e.dob = 'Date of birth is required'
      else {
        const age = ageInYears(data.personal.dob)
        if (age < 18)  e.dob = 'You must be at least 18 years old'
        if (age > 100) e.dob = 'Please enter a valid date of birth'
      }
      if (!data.personal.gender)        e.gender        = 'Please select gender'
      if (!data.personal.maritalStatus) e.maritalStatus = 'Please select marital status'
      if (!data.personal.fatherName.trim()) e.fatherName = "Father's name is required"
      if (!data.personal.motherName.trim()) e.motherName = "Mother's name is required"
      if (!data.personal.email.trim())      e.email      = 'Email is required'
      else if (!EMAIL_RE.test(data.personal.email)) e.email = 'Enter a valid email'
      break
    }
    case 'pan': {
      const v = data.pan.number.trim().toUpperCase()
      if (!v)                   e.number = 'PAN is required'
      else if (!PAN_RE.test(v)) e.number = 'PAN must match the format ABCDE1234F'
      break
    }
    case 'aadhaar': {
      const v = data.aadhaar.number.replace(/\s/g, '')
      if (!v)                       e.number = 'Aadhaar number is required'
      else if (!AADHAAR_RE.test(v)) e.number = 'Aadhaar must be exactly 12 digits'
      break
    }
    case 'address': {
      if (!data.address.line1.trim()) e.line1 = 'Address line 1 is required'
      if (!data.address.city.trim())  e.city  = 'City is required'
      if (!data.address.state.trim()) e.state = 'State is required'
      if (!PINCODE_RE.test(data.address.pincode)) e.pincode = 'Pincode must be 6 digits'
      break
    }
    case 'occupation': {
      if (!data.occupation.occupation)   e.occupation   = 'Please select occupation'
      if (!data.occupation.employer.trim()) e.employer  = 'Employer name is required'
      if (!data.occupation.annualIncome) e.annualIncome = 'Please select annual income range'
      break
    }
    case 'bank': {
      if (!/^\d{9,18}$/.test(data.bank.accountNumber))
        e.accountNumber = 'Account number must be 9-18 digits'
      if (data.bank.accountNumber !== data.bank.confirmAccountNumber)
        e.confirmAccountNumber = 'Account numbers do not match'
      if (!IFSC_RE.test(data.bank.ifsc.toUpperCase()))
        e.ifsc = 'IFSC must match the format SBIN0001234'
      if (!data.bank.holderName.trim())  e.holderName  = 'Account holder name is required'
      if (!data.bank.accountType)        e.accountType = 'Please select account type'
      break
    }
    case 'nominee': {
      if (!data.nominee.name.trim())     e.name     = 'Nominee name is required'
      if (!data.nominee.relation.trim()) e.relation = 'Relation is required'
      if (data.nominee.sharePct <= 0 || data.nominee.sharePct > 100)
        e.sharePct = 'Share must be between 1 and 100'
      if (!data.nominee.dob) e.dob = 'Nominee date of birth is required'
      break
    }
    case 'fatca': {
      if (!data.fatca.indianTaxResident) e.indianTaxResident = 'Required'
      if (!data.fatca.usPerson)          e.usPerson          = 'Required'
      if (!data.fatca.politicallyExposed) e.politicallyExposed = 'Required'
      if (data.fatca.usPerson === 'yes' && !data.fatca.otherTaxJurisdiction.trim())
        e.otherTaxJurisdiction = 'Please specify your other tax jurisdiction'
      break
    }
    case 'uploads': {
      if (!data.uploads.panCard)   e.panCard   = 'PAN card image is required'
      if (!data.uploads.aadhaar)   e.aadhaar   = 'Aadhaar image is required'
      if (!data.uploads.signature) e.signature = 'Signature/photo is required'
      break
    }
    case 'videoKyc': {
      if (!data.videoKyc || !data.videoKyc.verified) {
        e.videoKyc = 'Please complete the Video KYC liveness check to proceed'
      }
      break
    }
    case 'consents': {
      if (!data.consents.dataPrivacy)         e.dataPrivacy        = 'Required'
      if (!data.consents.riskAcknowledged)    e.riskAcknowledged   = 'Required'
      if (!data.consents.debitAuthorisation)  e.debitAuthorisation = 'Required'
      if (!data.consents.truthfulDeclaration) e.truthfulDeclaration = 'Required'
      break
    }
    case 'review':
      // Re-run every section so the user is warned about anything stale.
      const order: SectionKey[] = ['pan', 'aadhaar', 'personal', 'address', 'occupation', 'bank', 'nominee', 'fatca', 'uploads', 'videoKyc', 'consents']
      for (const s of order) {
        if (Object.keys(validateSection(s, data)).length > 0) {
          e._summary = `Please complete the ${s.replace(/([A-Z])/g, ' $1').toLowerCase()} section.`
          break
        }
      }
      break
  }
  return e
}

function ageInYears(iso: string): number {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}
