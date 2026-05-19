import { EmployeeProfile } from './types'

// Mock SSO directory. At launch the engine has ONLY these SSO fields + age from
// Aadhaar KYC — no HRMS, no salary. Designation is a coarse signal, not income.
export const MOCK_EMPLOYEES: Record<string, EmployeeProfile> = {
  'SF10042': {
    empId: 'SF10042',
    name: 'Aarav Sharma',
    age: 24,
    cityTier: 'TIER3',
    designation: 'Field Sales Executive',
    location: 'Hubballi, Karnataka',
    entity: 'Shriram Finance Ltd',
    email: 'aarav.sharma@shriram.in',
    mobile: '+91 ••••• ••789',
    kycStatus: 'KYC_REGISTERED',
  },
  'SF20183': {
    empId: 'SF20183',
    name: 'Priya Menon',
    age: 31,
    cityTier: 'TIER2',
    designation: 'Branch Operations Manager',
    location: 'Kochi, Kerala',
    entity: 'Shriram Finance Ltd',
    email: 'priya.menon@shriram.in',
    mobile: '+91 ••••• ••452',
    kycStatus: 'KYC_VALIDATED',
  },
  'SF30561': {
    empId: 'SF30561',
    name: 'Ramesh Iyer',
    age: 42,
    cityTier: 'TIER1',
    designation: 'Regional Head — Operations',
    location: 'Chennai, Tamil Nadu',
    entity: 'Shriram Transport Finance',
    email: 'ramesh.iyer@shriram.in',
    mobile: '+91 ••••• ••118',
    kycStatus: 'KYC_VALIDATED',
  },
  'SF40892': {
    empId: 'SF40892',
    name: 'Kavitha Nair',
    age: 38,
    cityTier: 'TIER1',
    designation: 'Vice President — Finance',
    location: 'Mumbai, Maharashtra',
    entity: 'Shriram General Insurance',
    email: 'kavitha.nair@shriram.in',
    mobile: '+91 ••••• ••907',
    kycStatus: 'KYC_VALIDATED',
  },
  'SF50234': {
    empId: 'SF50234',
    name: 'Subramaniam Pillai',
    age: 51,
    cityTier: 'TIER2',
    designation: 'Senior Manager — Credit',
    location: 'Madurai, Tamil Nadu',
    entity: 'Shriram Finance Ltd',
    email: 's.pillai@shriram.in',
    mobile: '+91 ••••• ••276',
    kycStatus: 'KYC_VALIDATED',
  },
  'DEMO': {
    empId: 'DEMO',
    name: 'Demo Employee',
    age: 29,
    cityTier: 'TIER2',
    designation: 'Software Engineer',
    location: 'Pune, Maharashtra',
    entity: 'Shriram Finance Ltd',
    email: 'demo@shriram.in',
    mobile: '+91 ••••• ••000',
    kycStatus: 'KYC_REGISTERED',
  },
}

export function lookupEmployee(empId: string): EmployeeProfile | null {
  return MOCK_EMPLOYEES[empId.toUpperCase()] ?? null
}
