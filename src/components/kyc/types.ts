// ── KYC data model ───────────────────────────────────────────────────────────
// Plain JSON-serialisable shape so it can be persisted as a draft and easily
// swapped for a real KYC-provider payload later (Karvy, CAMS, KRA, etc.)

export interface UploadedFileMeta {
  name: string
  size: number
  type: string
}

export interface KycData {
  personal: {
    dob:           string  // ISO yyyy-mm-dd
    gender:        'male' | 'female' | 'other' | ''
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | ''
    fatherName:    string
    motherName:    string
    email:         string
  }
  pan: {
    number: string
  }
  aadhaar: {
    number:        string // 12 digits
    linkedMobile:  boolean
  }
  address: {
    line1:   string
    line2:   string
    city:    string
    state:   string
    pincode: string
    country: string
  }
  occupation: {
    occupation:   string
    employer:     string
    annualIncome: string
    sourceOfFunds: string
  }
  bank: {
    accountNumber: string
    confirmAccountNumber: string
    ifsc:          string
    branchName:    string
    holderName:    string
    accountType:   'savings' | 'current' | ''
  }
  nominee: {
    name:     string
    relation: string
    sharePct: number
    dob:      string
  }
  fatca: {
    indianTaxResident:    'yes' | 'no' | ''
    usPerson:             'yes' | 'no' | ''
    otherTaxJurisdiction: string
    politicallyExposed:   'yes' | 'no' | ''
  }
  uploads: {
    panCard?:   UploadedFileMeta
    aadhaar?:   UploadedFileMeta
    signature?: UploadedFileMeta
  }
  consents: {
    dataPrivacy:        boolean
    riskAcknowledged:   boolean
    debitAuthorisation: boolean
    truthfulDeclaration: boolean
  }
}

export const EMPTY_KYC: KycData = {
  personal:   { dob: '', gender: '', maritalStatus: '', fatherName: '', motherName: '', email: '' },
  pan:        { number: '' },
  aadhaar:    { number: '', linkedMobile: true },
  address:    { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  occupation: { occupation: '', employer: '', annualIncome: '', sourceOfFunds: 'Salary' },
  bank:       { accountNumber: '', confirmAccountNumber: '', ifsc: '', branchName: '', holderName: '', accountType: '' },
  nominee:    { name: '', relation: '', sharePct: 100, dob: '' },
  fatca:      { indianTaxResident: '', usPerson: '', otherTaxJurisdiction: '', politicallyExposed: '' },
  uploads:    {},
  consents:   { dataPrivacy: false, riskAcknowledged: false, debitAuthorisation: false, truthfulDeclaration: false },
}

// ── Section metadata (drives progress tracker and navigation) ────────────────
export type SectionKey =
  | 'personal' | 'pan' | 'aadhaar' | 'address' | 'occupation'
  | 'bank' | 'nominee' | 'fatca' | 'uploads' | 'consents' | 'review'

export const SECTIONS: { key: SectionKey; label: string; short: string }[] = [
  { key: 'personal',   label: 'Personal details',     short: 'Personal' },
  { key: 'pan',        label: 'PAN verification',     short: 'PAN' },
  { key: 'aadhaar',    label: 'Aadhaar verification', short: 'Aadhaar' },
  { key: 'address',    label: 'Address',              short: 'Address' },
  { key: 'occupation', label: 'Occupation & income',  short: 'Income' },
  { key: 'bank',       label: 'Bank account',         short: 'Bank' },
  { key: 'nominee',    label: 'Nominee',              short: 'Nominee' },
  { key: 'fatca',      label: 'FATCA declaration',    short: 'FATCA' },
  { key: 'uploads',    label: 'Document upload',      short: 'Uploads' },
  { key: 'consents',   label: 'Consents',             short: 'Consents' },
  { key: 'review',     label: 'Review & submit',      short: 'Review' },
]
