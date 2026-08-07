'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Quote {
  id: string
  quoted_price: number
  quoted_price_period: string
  quote_vehicle_type?: string
  quote_available_start?: string
  quote_notes?: string
  quote_is_private: boolean
  quote_submitted_at: string
  provider: {
    company_name: string
    website?: string
    phone?: string
    description?: string
    vehicle_types?: string[]
  }
}

interface RequestSummary {
  id: string
  reference_number: string
  category: string
  pickup_address: string
  dropoff_address: string
  passenger_count: number
  trip_type: string
  days_needed?: string
  pickup_time?: string
  return_time?: string
  start_date?: string
  offers_close_at?: string
  status: string
  selected_quote_id?: string
}

export default function OffersPage() {
  const params = useParams()
  const token = params.ref as string
  const [request, setRequest] = useState<RequestSummary | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [isBooked, setIsBooked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selecting, setSelecting] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Record<string, string> | null>(null)

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`/api/offers?token=${token}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid link'); return }
      setRequest(data.request)
      setQuotes(data.quotes || [])
      setIsOpen(data.is_open)
      setIsBooked(data.is_booked)
    } catch {
      setError('Failed to load offers.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchOffers()
    // Poll every 60 seconds for new quotes
    const interval = setInterval(fetchOffers, 60000)
    return () => clearInterval(interval)
  }, [fetchOffers])

  const selectQuote = async (quoteId: string) => {
    setSelecting(quoteId)
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, quote_id: quoteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSelectedProvider(data.provider)
      setIsBooked(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
    setSelecting(null)
  }

  const fmt = (price: number, period: string) => {
    const periodMap: Record<string, string> = { monthly: 'mo', weekly: 'wk', per_trip: 'trip' }
    return `$${price.toLocaleString()}/${periodMap[period] || period}`
  }

  const timeLeft = () => {
    if (!request?.offers_close_at) return null
    const diff = new Date(request.offers_close_at).getTime() - Date.now()
    if (diff <= 0) return 'Closed'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`
    if (hours > 0) return `${hours}h ${mins}m remaining`
    return `${mins}m remaining`
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFB' }}>
      <p className="text-sm text-gray-400">Loading your offers...</p>
    </div>
  )

  if (error && !request) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Link unavailable</h1>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    </div>
  )

  // Confirmed state
  if (isBooked && selectedProvider) return (
    <div className="min-h-screen flex items-start justify-center pt-20 px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: '#E6F8F4' }}>🎉</div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>You're all set!</h1>
          <p className="text-sm text-gray-500 leading-relaxed">You've selected your transportation provider. They'll reach out shortly to confirm route details and your start date.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: '#0E9F7E' }}>Your provider</div>
          <div className="text-lg font-semibold mb-3" style={{ color: '#0B1F3A' }}>{selectedProvider.company_name}</div>
          {selectedProvider.phone && <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"><span>📞</span>{selectedProvider.phone}</div>}
          {selectedProvider.email && <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"><span>✉️</span>{selectedProvider.email}</div>}
          {selectedProvider.website && <div className="flex items-center gap-2 text-sm text-gray-600"><span>🌐</span>{selectedProvider.website}</div>}
        </div>
        <p className="text-center text-xs text-gray-400">A confirmation email has been sent to you and your provider.</p>
      </div>
    </div>
  )

  // Already booked (page reload after booking)
  if (isBooked && !selectedProvider) return (
    <div className="min-h-screen flex items-start justify-center pt-20 px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Provider already selected</h1>
        <p className="text-sm text-gray-500">You've already confirmed a provider for this request. Check your email for confirmation details.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="font-semibold text-lg mb-4" style={{ color: '#0B1F3A' }}>
            Hi<span style={{ color: '#0E9F7E' }}>yoon</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0B1F3A' }}>Your transportation offers</h1>
          <p className="text-sm text-gray-500">
            {quotes.length === 0
              ? 'Providers are reviewing your request. Check back soon — offers appear here in real time.'
              : `${quotes.length} offer${quotes.length !== 1 ? 's' : ''} received. Review and select the best fit.`
            }
          </p>
        </div>

        {/* Request summary card */}
        {request && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1">{request.reference_number}</div>
                <div className="text-sm font-medium truncate" style={{ color: '#0B1F3A' }}>
                  {request.pickup_address} → {request.dropoff_address}
                </div>
                <div className="text-xs text-gray-400 mt-1">{request.trip_type} · {request.days_needed}</div>
              </div>
              {timeLeft() && (
                <div className={`text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0 ${isOpen ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                  {timeLeft()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* No quotes yet */}
        {quotes.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">🚐</div>
            <h3 className="text-base font-medium mb-2" style={{ color: '#0B1F3A' }}>Waiting for offers</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
              Local providers are reviewing your request. Offers typically start coming in within a few hours.
              This page updates automatically — bookmark it and check back anytime.
            </p>
          </div>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="space-y-4">
            {quotes.map((q, i) => (
              <div key={q.id} className={`bg-white border rounded-2xl p-6 transition-all ${
                i === 0 ? 'border-teal-200' : 'border-gray-100'
              }`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {i === 0 && quotes.length > 1 && (
                  <div className="text-xs font-medium px-2.5 py-1 rounded-full inline-block mb-3" style={{ background: '#E6F8F4', color: '#0E9F7E' }}>
                    First offer received
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: '#0B1F3A' }}>{q.provider.company_name}</h3>
                    {q.provider.website && (
                      <a href={q.provider.website.startsWith('http') ? q.provider.website : `https://${q.provider.website}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:underline" style={{ color: '#0E9F7E' }}>
                        {q.provider.website}
                      </a>
                    )}
                    {q.provider.phone && !q.provider.website && (
                      <div className="text-xs text-gray-500">{q.provider.phone}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-semibold" style={{ color: '#0E9F7E' }}>
                      {fmt(q.quoted_price, q.quoted_price_period)}
                    </div>
                    <div className="text-xs text-gray-400">{q.quote_is_private ? 'Private route' : 'Shared route'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4">
                  {q.quote_vehicle_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vehicle</span>
                      <span style={{ color: '#0B1F3A' }}>{q.quote_vehicle_type}</span>
                    </div>
                  )}
                  {q.quote_available_start && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available</span>
                      <span style={{ color: '#0B1F3A' }}>{new Date(q.quote_available_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {q.quote_notes && (
                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4 leading-relaxed">{q.quote_notes}</div>
                )}

                {isOpen && !isBooked && (
                  <button
                    onClick={() => selectQuote(q.id)}
                    disabled={selecting === q.id}
                    className="w-full py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50"
                    style={{ background: '#0B1F3A' }}>
                    {selecting === q.id ? 'Confirming...' : 'Select this provider'}
                  </button>
                )}

                {!isOpen && !isBooked && (
                  <div className="text-center text-xs text-gray-400 py-2">Offer window has closed</div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4 text-center">{error}</p>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          This page updates automatically. Bookmark it to check for new offers.
          <br/>Questions? Contact us at <a href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hello@hiyoon.com'}`} className="underline">hello@hiyoon.com</a>
        </p>
      </div>
    </div>
  )
}
