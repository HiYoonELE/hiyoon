'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface LeadMatch {
  id: string
  quote_token: string
  quoted_price?: number
  quote_submitted_at?: string
  provider: {
    company_name: string
    contact_person: string
  }
  request: {
    reference_number: string
    category: string
    pickup_address: string
    dropoff_address: string
    passenger_count: number
    passenger_age_grade?: string
    trip_type: string
    days_needed?: string
    pickup_time?: string
    return_time?: string
    start_date?: string
    duration?: string
    car_seat_needed: boolean
    wheelchair_accessible: boolean
    private_only: boolean
    shared_ride_ok: boolean
    special_notes?: string
    budget_range?: string
  }
}

function QuoteFormInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [match, setMatch] = useState<LeadMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    price: '',
    price_period: 'monthly',
    vehicle_type: '',
    available_start: '',
    notes: '',
    is_private: false,
  })

  useEffect(() => {
    if (!token) { setError('Invalid link.'); setLoading(false); return }
    fetch(`/api/quotes?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else {
          setMatch(d.data)
          if (d.data.quote_submitted_at) setSubmitted(true)
        }
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async () => {
    if (!form.price) { setError('Please enter a price.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFB' }}>
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  if (error && !match) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Link unavailable</h1>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#E6F8F4' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14l6 6 10-12" stroke="#0E9F7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Quote submitted</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your quote has been sent to the customer. If they select your offer, you'll receive a confirmation email with their contact information.
        </p>
      </div>
    </div>
  )

  if (!match) return null

  const req = match.request

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-semibold text-xl mb-1" style={{ color: '#0B1F3A' }}>
            Hi<span style={{ color: '#0E9F7E' }}>yoon</span>
          </div>
          <p className="text-sm text-gray-400">Provider quote submission</p>
        </div>

        {/* Request summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>Transportation request</h2>
            <span className="text-xs text-gray-400">{req.reference_number}</span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              ['Route', `${req.pickup_address} → ${req.dropoff_address}`],
              ['Category', req.category],
              ['Passengers', `${req.passenger_count}${req.passenger_age_grade ? ` (${req.passenger_age_grade})` : ''}`],
              ['Schedule', `${req.trip_type} · ${req.days_needed || 'TBD'}`],
              ['School arrival', req.pickup_time || '—'],
              ['Afternoon pickup', req.return_time || 'Morning only'],
              ['Start date', req.start_date || 'ASAP'],
              ['Duration', req.duration || 'Ongoing'],
              ['Budget range', req.budget_range || 'Not specified'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-gray-400 flex-shrink-0">{label}</span>
                <span className="text-right font-medium" style={{ color: '#0B1F3A' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {req.car_seat_needed && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Car seat needed</span>}
            {req.wheelchair_accessible && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Wheelchair accessible</span>}
            {req.private_only && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">Private only</span>}
            {req.shared_ride_ok && !req.private_only && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Shared ride okay</span>}
          </div>

          {req.special_notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">{req.special_notes}</div>
          )}
        </div>

        {/* Quote form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 className="text-base font-medium mb-5" style={{ color: '#0B1F3A' }}>Submit your quote</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                  Your price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" placeholder="450" value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Per</label>
                <select value={form.price_period} onChange={(e) => setForm((f) => ({ ...f, price_period: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option value="monthly">Month</option>
                  <option value="weekly">Week</option>
                  <option value="per_trip">Trip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Vehicle type</label>
              <select value={form.vehicle_type} onChange={(e) => setForm((f) => ({ ...f, vehicle_type: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                <option value="">Select vehicle type...</option>
                <option>Sedan / SUV</option>
                <option>Minivan (7 seats)</option>
                <option>Passenger van (12-15)</option>
                <option>Wheelchair van</option>
                <option>School bus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Available start date</label>
              <input type="date" value={form.available_start}
                onChange={(e) => setForm((f) => ({ ...f, available_start: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea rows={3} placeholder="e.g. Pickup between 7:30AM - 7:45AM. Any other details about your service, route approach, or availability..."
                value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${form.is_private ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input type="checkbox" checked={form.is_private} onChange={(e) => setForm((f) => ({ ...f, is_private: e.target.checked }))} className="accent-teal-600" />
              <div>
                <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>This is a private route</div>
                <div className="text-xs text-gray-400">Student will be the only passenger besides the driver</div>
              </div>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">{error}</p>
          )}

          <button onClick={handleSubmit} disabled={submitting || !form.price}
            className="w-full mt-6 py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50"
            style={{ background: '#0E9F7E' }}>
            {submitting ? 'Submitting...' : 'Submit quote'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Your quote will be visible to the customer immediately on their offer page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function QuoteFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
      <QuoteFormInner />
    </Suspense>
  )
}
