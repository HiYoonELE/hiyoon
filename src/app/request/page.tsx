'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import type { IntakeFormData } from '@/lib/types'

const TOTAL_STEPS = 6

const CATEGORIES = [
  { label: 'School & Daycare', sub: 'Kids ages 3–18', icon: '🏫' },
  { label: 'Senior Transportation', sub: 'Medical & daily trips', icon: '🏥' },
  { label: 'NEMT', sub: 'Non-emergency medical', icon: '♿' },
  { label: 'Group & Charter', sub: 'Events & programs', icon: '🚐' },
  { label: 'Youth Programs', sub: 'Sports & after school', icon: '⚽' },
  { label: 'Adult Day Programs', sub: 'Recurring routes', icon: '🌿' },
  { label: 'Other', sub: 'Describe your need', icon: '✏️' },
]

const initialForm: IntakeFormData = {
  category: '',
  pickup_address: '',
  dropoff_address: '',
  passenger_count: 1,
  passenger_age_grade: '',
  trip_type: '',
  days_needed: 'Monday–Friday',
  pickup_time: '',
  return_time: '',
  start_date: '',
  duration: 'Ongoing / school year',
  wheelchair_accessible: false,
  car_seat_needed: false,
  medical_monitoring: false,
  aide_needed: false,
  shared_ride_ok: true,
  private_only: false,
  multilingual_driver: false,
  background_checked: false,
  special_notes: '',
  budget_range: '',
  urgency: '',
  name: '',
  email: '',
  phone: '',
  preferred_contact: 'Email',
}

function RequestPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<IntakeFormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setForm((f) => ({ ...f, category: cat }))
  }, [searchParams])

  const progress = Math.round((step / TOTAL_STEPS) * 100)

  const update = (field: keyof IntakeFormData, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const toggleCheck = (field: keyof IntakeFormData) => {
    setForm((f) => ({ ...f, [field]: !f[field] }))
  }

  const next = () => {
    setError('')
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }

  const back = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError('Name and email are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      router.push(`/request/confirmation?ref=${data.reference_number}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
        <div className="max-w-xl mx-auto px-4 py-12">

          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0B1F3A' }}>
              Request transportation
            </h1>
            <p className="text-sm text-gray-500">
              Answer a few questions — we will find providers who can help.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: '#0E9F7E' }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-7" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

            {step === 1 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>
                  What type of transportation do you need?
                </h2>
                <p className="text-sm text-gray-400 mb-6">Choose the one that fits best.</p>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.label} onClick={() => update('category', cat.label)}
                      className={`text-left border-2 rounded-xl p-4 transition-all ${
                        form.category === cat.label ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'
                      }`}>
                      <div className="text-xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{cat.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{cat.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Where do passengers need to go?</h2>
                <p className="text-sm text-gray-400 mb-6">Enter pickup and drop-off locations.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Pickup address</label>
                    <input type="text" placeholder="123 Main St, Boston, MA" value={form.pickup_address}
                      onChange={(e) => update('pickup_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Drop-off address</label>
                    <input type="text" placeholder="456 School Ave, Roxbury, MA" value={form.dropoff_address}
                      onChange={(e) => update('dropoff_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Number of passengers</label>
                      <input type="number" min={1} max={100} placeholder="2" value={form.passenger_count}
                        onChange={(e) => update('passenger_count', parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Age or grade <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" placeholder="e.g. K-5, or age 67" value={form.passenger_age_grade}
                        onChange={(e) => update('passenger_age_grade', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>When and how often?</h2>
                <p className="text-sm text-gray-400 mb-6">Tell us the schedule.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0B1F3A' }}>Trip frequency</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Recurring', 'One-time', 'Flexible'].map((t) => (
                        <button key={t} onClick={() => update('trip_type', t)}
                          className={`py-2.5 px-3 text-sm border-2 rounded-xl transition-all ${form.trip_type === t ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'}`}
                          style={{ color: '#0B1F3A' }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Days needed</label>
                    <select value={form.days_needed} onChange={(e) => update('days_needed', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                      <option>Monday-Friday</option>
                      <option>Monday, Wednesday, Friday</option>
                      <option>Tuesday, Thursday</option>
                      <option>Weekdays only</option>
                      <option>Weekends only</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Morning pickup time</label>
                      <input type="time" value={form.pickup_time} onChange={(e) => update('pickup_time', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Afternoon pickup <span className="text-gray-400 font-normal">(round trip)</span></label>
                      <input type="time" value={form.return_time} onChange={(e) => update('return_time', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Start date</label>
                      <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>How long is service needed?</label>
                      <select value={form.duration} onChange={(e) => update('duration', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                        <option>Ongoing / school year</option>
                        <option>1 month</option>
                        <option>3 months</option>
                        <option>6 months</option>
                        <option>One trip</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Any special requirements?</h2>
                <p className="text-sm text-gray-400 mb-6">Check all that apply.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {[
                    { field: 'wheelchair_accessible', label: 'Wheelchair accessible' },
                    { field: 'car_seat_needed', label: 'Car seat or booster' },
                    { field: 'medical_monitoring', label: 'Medical monitoring' },
                    { field: 'aide_needed', label: 'Aide or attendant' },
                    { field: 'shared_ride_ok', label: 'Shared ride okay' },
                    { field: 'private_only', label: 'Private vehicle only' },
                    { field: 'multilingual_driver', label: 'Multilingual driver' },
                    { field: 'background_checked', label: 'Background-checked driver' },
                  ].map(({ field, label }) => (
                    <label key={field} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      form[field as keyof IntakeFormData] ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="checkbox" checked={!!form[field as keyof IntakeFormData]}
                        onChange={() => toggleCheck(field as keyof IntakeFormData)} className="accent-teal-600" />
                      <span className="text-sm" style={{ color: '#0B1F3A' }}>{label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                    Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="Any details that help us find the right match..."
                    value={form.special_notes} onChange={(e) => update('special_notes', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Budget and timing</h2>
                <p className="text-sm text-gray-400 mb-6">Approximate is fine — this helps providers quote accurately.</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Estimated monthly budget</label>
                    <select value={form.budget_range} onChange={(e) => update('budget_range', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                      <option value="">Prefer not to say</option>
                      <option>Under $200/month</option>
                      <option>$200-$500/month</option>
                      <option>$500-$1,000/month</option>
                      <option>$1,000-$2,000/month</option>
                      <option>$2,000+/month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#0B1F3A' }}>How soon do you need this?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'ASAP', sub: 'Within days' },
                        { label: '2-4 weeks', sub: 'Planning ahead' },
                        { label: '1+ month', sub: 'No rush' },
                      ].map((u) => (
                        <button key={u.label} onClick={() => update('urgency', u.label)}
                          className={`py-3 px-3 text-left border-2 rounded-xl transition-all ${form.urgency === u.label ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{u.label}</div>
                          <div className="text-xs text-gray-400">{u.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>How do we reach you?</h2>
                <p className="text-sm text-gray-400 mb-6">We will send your matched quotes here.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Your name</label>
                    <input type="text" placeholder="First and last name" value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Email</label>
                      <input type="email" placeholder="you@email.com" value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Phone</label>
                      <input type="tel" placeholder="(617) 555-0100" value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Preferred contact method</label>
                    <select value={form.preferred_contact} onChange={(e) => update('preferred_contact', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                      <option>Email</option>
                      <option>Phone call</option>
                      <option>Text message</option>
                    </select>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={back}
                  className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                  Back
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={next} disabled={step === 1 && !form.category}
                  className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-40"
                  style={{ background: '#0B1F3A' }}>
                  Continue
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60"
                  style={{ background: '#0E9F7E' }}>
                  {submitting ? 'Submitting...' : 'Submit request'}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your information is only shared with matched providers. No spam.
          </p>
        </div>
      </div>
    </>
  )
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
      <RequestPageInner />
    </Suspense>
  )
}
