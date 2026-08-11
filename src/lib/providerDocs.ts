export interface ProviderDoc {
  id: string
  label: string
  description: string
  required: boolean
}

export const REQUIRED_DOCS: ProviderDoc[] = [
  { id: 'cert_7d', label: '7D Driver Certificate', description: 'MA RMV-issued 7D certificate for each driver', required: true },
  { id: 'certificate_of_insurance', label: 'Certificate of Insurance (COI)', description: 'Must show $100K/$300K/$5K minimum coverage', required: true },
  { id: 'vehicle_registration', label: 'Vehicle Registration', description: 'MA registration for each 7D vehicle', required: true },
  { id: 'cori_check', label: 'CORI Check Documentation', description: 'Criminal Offender Record Information clearance', required: false },
  { id: 'vehicle_inspection', label: '7D Vehicle Inspection Certificate', description: 'Semi-annual inspection certificate', required: false },
  { id: 'business_registration', label: 'Business Registration', description: 'LLC, corporation, or DBA documentation', required: false },
]

export function missingRequiredDocs(submitted: string[]): ProviderDoc[] {
  return REQUIRED_DOCS.filter((d) => d.required && !submitted.includes(d.id))
}
