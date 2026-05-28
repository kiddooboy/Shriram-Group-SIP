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
  videoKyc: {
    verified: boolean
    completedAt: string
    verificationCode: string
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
  videoKyc:   { verified: false, completedAt: '', verificationCode: '8492' },
  consents:   { dataPrivacy: false, riskAcknowledged: false, debitAuthorisation: false, truthfulDeclaration: false },
}

// ── Demo prefill ──────────────────────────────────────────────────────────────
// Realistic placeholder values so a presenter can click through the KYC in a
// live demo without typing every field. Mirrors a Chennai-based Shriram
// employee profile. All values pass the validators in ./validators.ts.
export const DEMO_KYC: KycData = {
  personal: {
    dob:           '1992-08-15',
    gender:        'male',
    maritalStatus: 'married',
    fatherName:    'Ramachandran N',
    motherName:    'Lakshmi Ramachandran',
    email:         'employee@shriram.com',
  },
  pan: {
    number: 'AKLPS3492J',
  },
  aadhaar: {
    number:       '234567890123',
    linkedMobile: true,
  },
  address: {
    line1:   'Flat 304, Pearl Residency',
    line2:   'Sardar Patel Road, T. Nagar',
    city:    'Chennai',
    state:   'Tamil Nadu',
    pincode: '600017',
    country: 'India',
  },
  occupation: {
    occupation:    'salaried',
    employer:      'Shriram Finance',
    annualIncome:  '5L-10L',
    sourceOfFunds: 'Salary',
  },
  bank: {
    accountNumber:        '04531234567890',
    confirmAccountNumber: '04531234567890',
    ifsc:                 'HDFC0001234',
    branchName:           'T. Nagar, Chennai',
    holderName:           'Demo Employee',
    accountType:          'savings',
  },
  nominee: {
    name:     'Priya N',
    relation: 'Spouse',
    sharePct: 100,
    dob:      '1994-03-22',
  },
  fatca: {
    indianTaxResident:    'yes',
    usPerson:             'no',
    otherTaxJurisdiction: '',
    politicallyExposed:   'no',
  },
  uploads: {
    panCard:   { name: 'pan-card.jpg',  size: 245_120, type: 'image/jpeg' },
    aadhaar:   { name: 'aadhaar.jpg',   size: 312_864, type: 'image/jpeg' },
    signature: { name: 'signature.png', size:  87_232, type: 'image/png'  },
  },
  videoKyc: {
    verified: true,
    completedAt: '2026-05-28 12:45:00',
    verificationCode: '8492',
  },
  consents: {
    dataPrivacy:         true,
    riskAcknowledged:    true,
    debitAuthorisation:  true,
    truthfulDeclaration: true,
  },
}

// ── Section metadata (drives progress tracker and navigation) ────────────────
export type SectionKey =
  | 'pan' | 'aadhaar' | 'personal' | 'address' | 'occupation'
  | 'bank' | 'nominee' | 'fatca' | 'uploads' | 'videoKyc' | 'consents' | 'review'

export const SECTIONS: { key: SectionKey; label: string; short: string }[] = [
  { key: 'pan',        label: 'PAN verification',     short: 'PAN' },
  { key: 'aadhaar',    label: 'Aadhaar verification', short: 'Aadhaar' },
  { key: 'personal',   label: 'Personal details',     short: 'Personal' },
  { key: 'address',    label: 'Address details',      short: 'Address' },
  { key: 'occupation', label: 'Occupation & income',  short: 'Income' },
  { key: 'bank',       label: 'Bank account',         short: 'Bank' },
  { key: 'nominee',    label: 'Nominee details',      short: 'Nominee' },
  { key: 'fatca',      label: 'FATCA declaration',    short: 'FATCA' },
  { key: 'uploads',    label: 'Document upload',      short: 'Uploads' },
  { key: 'videoKyc',   label: 'Video KYC',            short: 'Video' },
  { key: 'consents',   label: 'Consents',             short: 'Consents' },
  { key: 'review',     label: 'Review & submit',      short: 'Review' },
]
