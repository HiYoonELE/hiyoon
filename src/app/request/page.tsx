'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import type { IntakeFormData } from '@/lib/types'

const TOTAL_STEPS = 6

const initialForm: IntakeFormData = {
  category: 'School & Daycare',
  pickup_address: '',
  dropoff_address: '',
  passenger_count: 1,
  passenger_age_grade: '',
  trip_type: '',
  days_needed: 'Monday-Friday',
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
  how_did_you_hear: '',
  name: '',
  email: '',
  phone: '',
  preferred_contact: 'Email',
}

// Tooltip component
function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
        style={{ background: '#E2E8F0', color: '#6B7B8D' }}
        aria-label="More info"
      >
        ?
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 leading-relaxed z-50 shadow-lg" style={{ maxWidth: 'calc(100vw - 2rem)', boxSizing: 'border-box' }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  )
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
  const update = (field: keyof IntakeFormData, value: unknown) => setForm((f) => ({ ...f, [field]: value }))
  const toggleCheck = (field: keyof IntakeFormData) => setForm((f) => ({ ...f, [field]: !f[field] }))
  const next = () => { setError(''); if (step < TOTAL_STEPS) setStep((s) => s + 1) }
  const back = () => { if (step > 1) setStep((s) => s - 1) }

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return }
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

  const REQUIREMENTS = [
    {
      field: 'car_seat_needed',
      label: 'Car seat or booster needed',
      tip: 'Select this if your child requires a car seat or booster seat. Providers will confirm they have the appropriate seat for your child\'s age and weight.',
    },
    {
      field: 'wheelchair_accessible',
      label: 'Wheelchair accessible vehicle',
      tip: 'The provider will bring a vehicle equipped with a wheelchair ramp or lift. Required for passengers who use a wheelchair or mobility device.',
    },
    {
      field: 'aide_needed',
      label: 'Aide or monitor needed',
      tip: 'A second adult in the vehicle to assist or supervise the passenger during the ride. Common for children with special needs.',
    },
    {
      field: 'shared_ride_ok',
      label: 'Shared ride is okay',
      tip: 'Your child rides with other students in a traditional school van along a planned route. Typically more affordable. Other students will be similar age.',
    },
    {
      field: 'private_only',
      label: 'Private vehicle only',
      tip: 'Your child will be the only passenger besides the driver. No other students in the vehicle. Typically costs more than a shared route.',
    },
    {
      field: 'multilingual_driver',
      label: 'Multilingual driver preferred',
      tip: 'Select if it would be helpful for the driver to speak a language other than English. Note any specific language in the notes field below.',
    },
    {
      field: 'medical_monitoring',
      label: 'Medical monitoring needed',
      tip: 'The passenger requires medical attention or monitoring during transit. Please describe the specific needs in the notes field.',
    },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: '#F8FAFB', overflowX: 'hidden' }}>
        <div className="max-w-xl mx-auto px-4 py-12" style={{ width: '100%' }}>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0B1F3A' }}>Find school transportation</h1>
            <p className="text-sm text-gray-500">Answer a few questions and we will match you with local providers.</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: '#0E9F7E' }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-7" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

            {/* STEP 1: Route */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Where does your child need to go?</h2>
                <p className="text-sm text-gray-400 mb-6">Enter the pickup and drop-off locations.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Home pickup address</label>
                    <input type="text" placeholder="123 Main St, Boston, MA" value={form.pickup_address}
                      onChange={(e) => update('pickup_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>School or daycare name & address</label>
                    <input type="text" placeholder="Roxbury Prep, 120 Fisher Ave, Boston" value={form.dropoff_address}
                      onChange={(e) => update('dropoff_address', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Number of children</label>
                      <input type="number" min={1} max={20} placeholder="1" value={form.passenger_count}
                        onChange={(e) => update('passenger_count', parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Grade or age</label>
                      <input type="text" placeholder="e.g. Grade 3, or age 8" value={form.passenger_age_grade}
                        onChange={(e) => update('passenger_age_grade', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Frequency */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>How often do you need transportation?</h2>
                <p className="text-sm text-gray-400 mb-6">Choose what fits your situation.</p>
                <div className="space-y-3">
                  {[
                    { val: 'Recurring', label: 'Regular schedule', sub: 'Same days every week — most common for school routes' },
                    { val: 'One-time', label: 'One-time trip', sub: 'A single pickup or drop-off' },
                    { val: 'Flexible', label: 'Varies week to week', sub: 'Schedule changes depending on the week' },
                  ].map((t) => (
                    <button key={t.val} onClick={() => update('trip_type', t.val)}
                      className={`w-full text-left p-4 border-2 rounded-xl transition-all ${form.trip_type === t.val ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'}`}>
                      <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{t.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Timing */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>What are the school hours?</h2>
                <p className="text-sm text-gray-400 mb-6">Approximate times are fine. Providers will plan the route accordingly.</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>What time does your child need to arrive at school?</label>
                    <input type="time" value={form.pickup_time} onChange={(e) => update('pickup_time', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-1.5">The provider will plan the pickup time to get them there on time.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>What time should they be picked up from school?</label>
                    <input type="time" value={form.return_time} onChange={(e) => update('return_time', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-1.5">Leave blank if you only need a morning drop-off.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Days needed</label>
                    <select value={form.days_needed} onChange={(e) => update('days_needed', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                      <option>Monday-Friday</option>
                      <option>Monday, Wednesday, Friday</option>
                      <option>Tuesday, Thursday</option>
                      <option>Weekdays only</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Start date</label>
                      <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>How long needed?</label>
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

            {/* STEP 4: Requirements with tooltips */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Any special requirements?</h2>
                <p className="text-sm text-gray-400 mb-6">Check all that apply. Hover the <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-xs" style={{ background: '#E2E8F0', color: '#6B7B8D' }}>?</span> for details on each option.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {REQUIREMENTS.map(({ field, label, tip }) => (
                    <label key={field} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      form[field as keyof IntakeFormData] ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="checkbox" checked={!!form[field as keyof IntakeFormData]}
                        onChange={() => toggleCheck(field as keyof IntakeFormData)} className="accent-teal-600 flex-shrink-0" />
                      <span className="text-sm flex items-center" style={{ color: '#0B1F3A' }}>
                        {label}
                        <Tooltip text={tip} />
                      </span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                    Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="Specific language needs, behavioral notes, medical details, or anything else that helps us find the right provider..."
                    value={form.special_notes} onChange={(e) => update('special_notes', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
                </div>
              </div>
            )}

            {/* STEP 5: Budget & urgency */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>Budget and timing</h2>
                <p className="text-sm text-gray-400 mb-6">Approximate is fine — this helps providers give you accurate quotes.</p>
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
                        { label: 'ASAP', sub: 'Within days', tip: 'Providers have 24 hours to respond' },
                        { label: '2-4 weeks', sub: 'Planning ahead', tip: 'Providers have 48 hours to respond' },
                        { label: '1+ month', sub: 'No rush', tip: 'Providers have 48 hours to respond' },
                      ].map((u) => (
                        <button key={u.label} onClick={() => update('urgency', u.label)}
                          className={`py-3 px-3 text-left border-2 rounded-xl transition-all ${form.urgency === u.label ? 'border-teal-500 bg-teal-50' : 'border-gray-100 hover:border-gray-300'}`}>
                          <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{u.label}</div>
                          <div className="text-xs text-gray-400">{u.sub}</div>
                        </button>
                      ))}
                    </div>
                    {form.urgency && (
                      <p className="text-xs text-gray-400 mt-2">
                        {form.urgency === 'ASAP' ? '⚡ Providers will have 24 hours to submit quotes.' : '📅 Providers will have 48 hours to submit quotes.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Contact */}
            {step === 6 && (
              <div>
                <h2 className="text-xl font-medium mb-1" style={{ color: '#0B1F3A' }}>How do we reach you?</h2>
                <p className="text-sm text-gray-400 mb-6">We will email you a personal link where you can view and compare provider quotes.</p>
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
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                      How did you hear about Hiyoon? <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select value={form.how_did_you_hear} onChange={(e) => update('how_did_you_hear', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                      <option value="">Select one...</option>
                      <option>Google search</option>
                      <option>Facebook</option>
                      <option>Instagram</option>
                      <option>Friend or family</option>
                      <option>School or daycare</option>
                      <option>Flyer or mailer</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={back} className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                  Back
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={next}
                  disabled={(step === 1 && (!form.pickup_address || !form.dropoff_address)) || (step === 2 && !form.trip_type)}
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
            Your information is only shared with matched providers. No spam, ever.
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
