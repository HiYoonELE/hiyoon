'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import type { ProviderFormData } from '@/lib/types'
import { REQUIRED_DOCS } from '@/lib/providerDocs'

const CATEGORIES = ['School & Daycare', 'Senior Transportation', 'NEMT', 'Youth Programs', 'Group & Charter', 'Adult Day Programs']
const VEHICLE_TYPES = ['Sedan / SUV', 'Minivan (7 seats)', 'Passenger van (12-15)', 'Wheelchair van', 'School bus', 'Charter bus']
const CAPABILITIES = [
  { field: 'wheelchair_accessible', label: 'Wheelchair accessible' },
  { field: 'car_seats_available', label: 'Car seats available' },
  { field: 'recurring_routes', label: 'Recurring routes' },
  { field: 'one_time_trips', label: 'One-time trips' },
  { field: 'background_checked', label: 'Background-checked drivers' },
  { field: 'licensed_insured', label: 'Licensed & insured' },
]

const initial: ProviderFormData = {
  company_name: '',
  contact_person: '',
  title: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  service_areas: '',
  categories_served: [],
  vehicle_types: [],
  wheelchair_accessible: false,
  car_seats_available: false,
  recurring_routes: false,
  one_time_trips: false,
  background_checked: false,
  licensed_insured: false,
  vehicle_count: '',
  max_passenger_capacity: '',
  insurance_notes: '',
}

export default function ProvidersPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProviderFormData>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<{ categories_served?: boolean; vehicle_types?: boolean }>({})

  const update = (field: keyof ProviderFormData, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const toggleArray = (field: 'categories_served' | 'vehicle_types', val: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter((v) => v !== val)
        : [...f[field], val],
    }))
    setFieldErrors((prev) => ({ ...prev, [field]: false }))
  }

  const toggleBool = (field: keyof ProviderFormData) => {
    setForm((f) => ({ ...f, [field]: !f[field] }))
  }

  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadErrors((prev) => ({ ...prev, [docId]: 'File must be under 10MB' }))
      return
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setUploadErrors((prev) => ({ ...prev, [docId]: 'Only PDF, JPG, or PNG files accepted' }))
      return
    }
    setUploadErrors((prev) => ({ ...prev, [docId]: '' }))
    setUploadedFiles((prev) => ({ ...prev, [docId]: file }))
  }

  const removeFile = (docId: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
  }

  const handleSubmit = async () => {
    if (!form.company_name || !form.email || !form.phone) {
      setError('Company name, email, and phone are required.')
      return
    }

    const missingCategories = form.categories_served.length === 0
    const missingVehicleTypes = form.vehicle_types.length === 0
    if (missingCategories || missingVehicleTypes) {
      setFieldErrors({ categories_served: missingCategories, vehicle_types: missingVehicleTypes })
      const missing = [
        missingCategories && 'at least one transportation category',
        missingVehicleTypes && 'at least one vehicle type',
      ].filter(Boolean).join(' and ')
      setError(`Please select ${missing}.`)
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('data', JSON.stringify(form))
      Object.entries(uploadedFiles).forEach(([key, file]) => {
        formData.append(`doc_${key}`, file)
      })
      const res = await fetch('/api/providers', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      router.push(`/providers/confirmation?token=${data.application_token}&complete=${data.docs_complete}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const SectionLabel = ({ children }: { children: string }) => (
    <div className="text-xs font-medium tracking-widest uppercase mt-8 mb-4 pb-2 border-b border-gray-100" style={{ color: '#0E9F7E' }}>
      {children}
    </div>
  )

  const uploadedCount = Object.keys(uploadedFiles).length
  const requiredUploaded = REQUIRED_DOCS.filter(d => d.required && uploadedFiles[d.id]).length
  const totalRequired = REQUIRED_DOCS.filter(d => d.required).length

  return (
    <>
      <Navbar />

      <section className="pt-16 pb-10 px-4 text-center" style={{ background: '#0B1F3A' }}>
        <div className="text-3xl mb-3">🚐</div>
        <h1 className="text-3xl font-semibold text-white mb-2">Join as a transportation provider</h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Get matched with local transportation requests in your area. Free to apply.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

          <SectionLabel>Company info</SectionLabel>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Company name</label>
              <input type="text" placeholder="Reliable Rides LLC" value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Contact person</label>
                <input type="text" placeholder="Jane Smith" value={form.contact_person}
                  onChange={(e) => update('contact_person', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Title / role</label>
                <input type="text" placeholder="Owner, Operations Manager" value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Phone</label>
                <input type="tel" placeholder="(617) 555-0100" value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Email</label>
                <input type="email" placeholder="contact@company.com" value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Website <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="url" placeholder="https://yourcompany.com" value={form.website}
                onChange={(e) => update('website', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Brief description of your services</label>
              <textarea rows={3} placeholder="Tell customers what you do and who you serve..." value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
          </div>

          <SectionLabel>Service areas</SectionLabel>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Cities or zip codes you serve</label>
            <input type="text" placeholder="Boston, Roxbury, Dorchester, South End (or zip codes)" value={form.service_areas}
              onChange={(e) => update('service_areas', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
          </div>

          <SectionLabel>Transportation categories</SectionLabel>
          {fieldErrors.categories_served && (
            <p className="text-xs text-red-500 -mt-3 mb-3">Select at least one category.</p>
          )}
          <div className={`grid grid-cols-2 gap-2 rounded-xl transition-all ${
            fieldErrors.categories_served ? 'ring-2 ring-red-300 ring-offset-2 p-1' : ''
          }`}>
            {CATEGORIES.map((cat) => (
              <label key={cat} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer text-sm transition-all ${
                form.categories_served.includes(cat) ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input type="checkbox" checked={form.categories_served.includes(cat)}
                  onChange={() => toggleArray('categories_served', cat)} className="accent-teal-600" />
                <span style={{ color: '#0B1F3A' }}>{cat}</span>
              </label>
            ))}
          </div>

          <SectionLabel>Vehicle types</SectionLabel>
          {fieldErrors.vehicle_types && (
            <p className="text-xs text-red-500 -mt-3 mb-3">Select at least one vehicle type.</p>
          )}
          <div className={`grid grid-cols-2 gap-2 rounded-xl transition-all ${
            fieldErrors.vehicle_types ? 'ring-2 ring-red-300 ring-offset-2 p-1' : ''
          }`}>
            {VEHICLE_TYPES.map((vt) => (
              <label key={vt} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer text-sm transition-all ${
                form.vehicle_types.includes(vt) ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input type="checkbox" checked={form.vehicle_types.includes(vt)}
                  onChange={() => toggleArray('vehicle_types', vt)} className="accent-teal-600" />
                <span style={{ color: '#0B1F3A' }}>{vt}</span>
              </label>
            ))}
          </div>

          <SectionLabel>Capabilities</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {CAPABILITIES.map(({ field, label }) => (
              <label key={field} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer text-sm transition-all ${
                form[field as keyof ProviderFormData] ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                <input type="checkbox" checked={!!form[field as keyof ProviderFormData]}
                  onChange={() => toggleBool(field as keyof ProviderFormData)} className="accent-teal-600" />
                <span style={{ color: '#0B1F3A' }}>{label}</span>
              </label>
            ))}
          </div>

          <SectionLabel>Fleet details</SectionLabel>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Number of vehicles</label>
                <input type="number" placeholder="4" min="1" value={form.vehicle_count}
                  onChange={(e) => update('vehicle_count', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Max passenger capacity</label>
                <input type="number" placeholder="15" min="1" value={form.max_passenger_capacity}
                  onChange={(e) => update('max_passenger_capacity', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                Insurance & licensing notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea rows={2} placeholder="e.g. MA livery license, $1M liability, CDL drivers..."
                value={form.insurance_notes} onChange={(e) => update('insurance_notes', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
          </div>

          <SectionLabel>Compliance documents</SectionLabel>

          {/* Document progress indicator */}
          {uploadedCount > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-4 ${
              requiredUploaded === totalRequired ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <span>{requiredUploaded}/{totalRequired} required documents uploaded</span>
              {requiredUploaded === totalRequired && <span>✓ All required documents received</span>}
            </div>
          )}

          <div className="p-4 rounded-xl mb-4" style={{ background: '#F8FAFB', border: '1px solid #E2E8F0' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#0B1F3A' }}>Upload now or complete later</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              You can submit your application now and upload documents later using a secure link we&apos;ll email you. However, your application won&apos;t be approved until all required documents are received. PDF, JPG, or PNG. Max 10MB per file.
            </p>
          </div>

          <div className="space-y-3">
            {REQUIRED_DOCS.map((doc) => {
              const uploaded = uploadedFiles[doc.id]
              const err = uploadErrors[doc.id]
              return (
                <div key={doc.id} className={`border rounded-xl p-4 transition-all ${
                  uploaded ? 'border-teal-300 bg-teal-50' : 'border-gray-100'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{doc.label}</span>
                        {doc.required ? (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            Required
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Optional</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{doc.description}</p>
                    </div>

                    {uploaded ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#0E9F7E' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7l3 3 6-6" stroke="#0E9F7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Uploaded
                        </div>
                        <button onClick={() => removeFile(doc.id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex-shrink-0 cursor-pointer">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
                          onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} />
                        <span className="inline-block px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" style={{ color: '#0B1F3A' }}>
                          Upload file
                        </span>
                      </label>
                    )}
                  </div>

                  {uploaded && (
                    <div className="mt-2 text-xs text-gray-500 truncate">
                      {uploaded.name} ({(uploaded.size / 1024).toFixed(0)} KB)
                    </div>
                  )}

                  {err && (
                    <p className="mt-1.5 text-xs text-red-500">{err}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-3 p-3 rounded-xl text-xs text-gray-500 leading-relaxed" style={{ background: '#F8FAFB' }}>
            Your documents are reviewed only by the Hiyoon team for verification purposes. They are never shared publicly or with customers.
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-6">
              {error}
            </p>
          )}

          <div className="mt-8">
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-60"
              style={{ background: '#0B1F3A' }}>
              {submitting ? 'Submitting application...' : 'Submit application'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Our team reviews every application within 2-3 business days.
              {requiredUploaded < totalRequired && ' You can upload missing documents later via a secure link we\'ll email you.'}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
