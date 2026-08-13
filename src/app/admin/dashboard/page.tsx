'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  TransportationRequest, Provider, LeadHistory,
  Booking, ProviderPerformance, GeographicIntelligence, Customer
} from '@/lib/types'
import { REQUIRED_DOCS, missingRequiredDocs } from '@/lib/providerDocs'

const STATUS_LABELS: Record<string, string> = {
  new: 'New', reviewed: 'Reviewed', sent_to_providers: 'Sent to providers',
  provider_interested: 'Provider interested', quote_received: 'Quote received',
  customer_contacted: 'Customer contacted', booked: 'Booked',
  lost: 'Lost', not_serviceable: 'Not serviceable',
}
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700', reviewed: 'bg-amber-50 text-amber-700',
  sent_to_providers: 'bg-purple-50 text-purple-700', provider_interested: 'bg-indigo-50 text-indigo-700',
  quote_received: 'bg-teal-50 text-teal-700', customer_contacted: 'bg-green-50 text-green-700',
  booked: 'bg-green-100 text-green-800', lost: 'bg-red-50 text-red-600',
  not_serviceable: 'bg-gray-100 text-gray-500',
}

type Tab = 'requests' | 'providers' | 'leads' | 'bookings' | 'analytics'

const fmt = (n?: number | null) => n != null ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<TransportationRequest[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [geoData, setGeoData] = useState<GeographicIntelligence[]>([])
  const [provPerf, setProvPerf] = useState<ProviderPerformance[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TransportationRequest | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [providerNote, setProviderNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Lead send state
  const [leadRequest, setLeadRequest] = useState('')
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([])
  const [sendingLeads, setSendingLeads] = useState(false)
  const [leadResult, setLeadResult] = useState('')

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    request_id: '', provider_id: '', monthly_price: '',
    price_period: 'monthly', duration_months: '',
    service_start_date: '', notes: '', is_private: false,
  })
  const [savingBooking, setSavingBooking] = useState(false)
  const [bookingResult, setBookingResult] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [reqRes, provRes, analyticsRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/providers'),
        fetch('/api/analytics'),
      ])
      const [reqJson, provJson, analyticsJson] = await Promise.all([
        reqRes.json(), provRes.json(), analyticsRes.json(),
      ])
      setRequests(reqJson.data || [])
      setProviders(provJson.data || [])
      setLeadHistory(analyticsJson.lead_history || [])
      setBookings(analyticsJson.bookings || [])
      setGeoData(analyticsJson.geographic || [])
      setProvPerf(analyticsJson.provider_performance || [])
      setSummary(analyticsJson.summary || {})
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status: status as TransportationRequest['status'] } : r))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status: status as TransportationRequest['status'] } : s)
  }

  const updateProviderStatus = async (id: string, approval_status: string) => {
    await fetch(`/api/providers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approval_status }) })
    setProviders((ps) => ps.map((p) => p.id === id ? { ...p, approval_status: approval_status as Provider['approval_status'] } : p))
    if (selectedProvider?.id === id) setSelectedProvider((p) => p ? { ...p, approval_status: approval_status as Provider['approval_status'] } : p)
  }

  const deleteRequest = async (id: string) => {
    if (!confirm('Delete this request? This cannot be undone.')) return
    const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Failed to delete request.'); return }
    setRequests((rs) => rs.filter((r) => r.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const deleteProvider = async (id: string) => {
    if (!confirm('Delete this provider? This cannot be undone.')) return
    const res = await fetch(`/api/providers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Failed to delete provider.'); return }
    setProviders((ps) => ps.filter((p) => p.id !== id))
    if (selectedProvider?.id === id) setSelectedProvider(null)
  }

  const saveProviderNote = async () => {
    if (!selectedProvider) return
    setSavingNote(true)
    await fetch(`/api/providers/${selectedProvider.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_notes: providerNote }) })
    setProviders((ps) => ps.map((p) => p.id === selectedProvider.id ? { ...p, admin_notes: providerNote } : p))
    setSavingNote(false)
  }

  const openProviderDetail = (p: Provider) => {
    setSelectedProvider(p)
    setProviderNote(p.admin_notes || '')
    setEmailSubject(`Your Hiyoon provider application — ${p.company_name}`)
    setEmailBody(`Hi ${p.contact_person},\n\nThank you for applying to join Hiyoon.\n\n`)
    setEmailSent(false)
  }

  const sendProviderEmail = () => {
    if (!selectedProvider) return
    window.open(`mailto:${selectedProvider.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`)
    setEmailSent(true)
  }

  const resendApprovalEmail = async (provider: Provider) => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
      const missing = missingRequiredDocs(provider.submitted_documents || [])
      await fetch('/api/notifications/provider-approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          docsComplete: missing.length === 0,
          resumeUrl: missing.length > 0 && provider.application_token ? `${siteUrl}/providers/complete/${provider.application_token}` : null,
        }),
      })
      alert(`Approval email resent to ${provider.email}`)
    } catch {
      alert('Failed to resend email. Please try again.')
    }
  }

  const toggleLeadProvider = (id: string) => {
    setSelectedProviderIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id])
  }

  const sendLeads = async () => {
    if (!leadRequest || selectedProviderIds.length === 0) return
    setSendingLeads(true)
    setLeadResult('')
    try {
      const res = await fetch('/api/leads/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: leadRequest, provider_ids: selectedProviderIds }) })
      const data = await res.json()
      if (res.ok) {
        const sent = data.results?.filter((r: { success: boolean }) => r.success).length || 0
        const reopenedNote = data.reopened ? ' The offer window had closed and was reopened for 24-48 hours.' : ''
        setLeadResult(`Successfully sent to ${sent} provider${sent !== 1 ? 's' : ''}.${reopenedNote}`)
        setSelectedProviderIds([])
        fetchAll()
      } else { setLeadResult('Something went wrong. Please try again.') }
    } catch { setLeadResult('Failed to send. Please try again.') }
    setSendingLeads(false)
  }

  const saveBooking = async () => {
    if (!bookingForm.request_id || !bookingForm.provider_id || !bookingForm.monthly_price) {
      setBookingResult('Request, provider, and price are required.')
      return
    }
    setSavingBooking(true)
    setBookingResult('')
    try {
      const req = requests.find((r) => r.id === bookingForm.request_id)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          pickup_city: req?.pickup_city,
          pickup_zip: req?.pickup_zip,
          dropoff_city: req?.dropoff_city,
          dropoff_zip: req?.dropoff_zip,
          passenger_count: req?.passenger_count,
          category: req?.category,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setBookingResult('Booking recorded successfully.')
        setBookingForm({ request_id: '', provider_id: '', monthly_price: '', price_period: 'monthly', duration_months: '', service_start_date: '', notes: '', is_private: false })
        fetchAll()
      } else { setBookingResult(data.error || 'Failed to save booking.') }
    } catch { setBookingResult('Failed to save booking.') }
    setSavingBooking(false)
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const approvedProviders = providers.filter((p) => p.approval_status === 'approved')
  const pendingProviders = providers.filter((p) => p.approval_status === 'pending')
  const filteredRequests = requests.filter((r) => {
    const q = search.toLowerCase()
    return (!q || r.customer?.name?.toLowerCase().includes(q) || r.pickup_address?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter)
  })

  const TABS: { key: Tab; label: string }[] = [
    { key: 'requests', label: `Requests (${requests.length})` },
    { key: 'providers', label: `Providers (${providers.length})` },
    { key: 'leads', label: 'Send Leads' },
    { key: 'bookings', label: `Bookings (${bookings.length})` },
    { key: 'analytics', label: 'Analytics' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#0B1F3A' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke="#0E9F7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-semibold text-sm" style={{ color: '#0B1F3A' }}>Hi<span style={{ color: '#0E9F7E' }}>yoon</span> <span className="text-gray-400 font-normal">Admin</span></span>
            </div>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Open requests', value: requests.filter((r) => ['new', 'reviewed'].includes(r.status)).length },
            { label: 'Sent to providers', value: requests.filter((r) => r.status === 'sent_to_providers').length },
            { label: 'Active bookings', value: bookings.filter((b) => b.status === 'active').length },
            { label: 'Pending providers', value: pendingProviders.length },
            { label: 'Annual pipeline', value: fmt(summary.total_annual_value) as unknown as number },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{m.label}</div>
              <div className="text-2xl font-semibold" style={{ color: '#0B1F3A' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); setSelectedProvider(null) }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all whitespace-nowrap ${tab === t.key ? 'font-medium text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={{ background: tab === t.key ? '#0B1F3A' : 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4">

          {/* REQUESTS */}
          {tab === 'requests' && (
            <>
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
                    <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="">All statuses</option>
                      {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                    <button onClick={fetchAll} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Refresh</button>
                  </div>
                  {loading ? <div className="text-center py-12 text-sm text-gray-400">Loading...</div> :
                    filteredRequests.length === 0 ? <div className="text-center py-12 text-sm text-gray-400">No requests found.</div> :
                    <div className="divide-y divide-gray-50">
                      {filteredRequests.map((r) => (
                        <div key={r.id} onClick={() => setSelected(r)}
                          className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === r.id ? 'bg-blue-50' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: '#0B1F3A' }}>{r.customer?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-400 mt-0.5 truncate">{r.pickup_city || r.pickup_address} → {r.dropoff_city || r.dropoff_address}</div>
                          </div>
                          <div className="hidden sm:block text-xs text-gray-400 w-24 flex-shrink-0">{r.category}</div>
                          <div className="hidden sm:block text-xs text-gray-400 w-20 flex-shrink-0">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-500'}`}>{STATUS_LABELS[r.status] || r.status}</span>
                          <select value={r.status} onChange={(e) => { e.stopPropagation(); updateStatus(r.id, e.target.value) }} onClick={(e) => e.stopPropagation()} className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex-shrink-0">
                            {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); deleteRequest(r.id) }} title="Delete request" className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              </div>
              {selected && (
                <div className="w-80 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 h-fit sticky top-20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{selected.customer?.name}</h3>
                      <div className="text-xs text-gray-400 mt-0.5">{selected.reference_number}</div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    {[
                      ['Category', selected.category],
                      ['Route', `${selected.pickup_city || selected.pickup_address} → ${selected.dropoff_city || selected.dropoff_address}`],
                      ['Zip codes', `${selected.pickup_zip || '—'} → ${selected.dropoff_zip || '—'}`],
                      ['Passengers', `${selected.passenger_count}${selected.passenger_age_grade ? ` (${selected.passenger_age_grade})` : ''}`],
                      ['Schedule', `${selected.trip_type} · ${selected.days_needed || '—'}`],
                      ['School arrival', selected.pickup_time || '—'],
                      ['Afternoon pickup', selected.return_time || 'Morning only'],
                      ['Private route', selected.private_only ? 'Yes' : 'No'],
                      ['Budget', selected.budget_range || '—'],
                      ['Urgency', selected.urgency || '—'],
                      ['Submitted', new Date(selected.created_at).toLocaleDateString()],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-right font-medium" style={{ color: '#0B1F3A' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {selected.special_notes && <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">{selected.special_notes}</div>}
                  <div className="mb-3">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Update status</label>
                    <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                      {Object.entries(STATUS_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <a href={`mailto:${selected.customer?.email}`} className="flex-1 py-2 text-xs text-center border border-gray-200 rounded-lg hover:bg-gray-50" style={{ color: '#0B1F3A' }}>Email customer</a>
                    <button onClick={() => { setTab('leads'); setLeadRequest(selected.id) }} className="flex-1 py-2 text-xs text-center rounded-lg font-medium text-white" style={{ background: '#0E9F7E' }}>Send leads</button>
                  </div>
                  <button onClick={() => deleteRequest(selected.id)} className="mt-2 w-full py-2 text-xs text-center border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete request</button>
                </div>
              )}
            </>
          )}

          {/* PROVIDERS */}
          {tab === 'providers' && (
            <>
              <div className="flex-1 min-w-0">
                {pendingProviders.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
                    ⚠️ {pendingProviders.length} provider{pendingProviders.length !== 1 ? 's' : ''} waiting for review
                  </div>
                )}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex gap-3">
                    <input type="text" placeholder="Search providers..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <button onClick={fetchAll} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Refresh</button>
                  </div>
                  {loading ? <div className="text-center py-12 text-sm text-gray-400">Loading...</div> : (
                    <div className="divide-y divide-gray-50">
                      {providers.filter((p) => !search || p.company_name.toLowerCase().includes(search.toLowerCase())).map((p) => (
                        <div key={p.id} onClick={() => openProviderDetail(p)}
                          className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 ${selectedProvider?.id === p.id ? 'bg-blue-50' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{p.company_name}</div>
                              {p.approval_status === 'pending' && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Pending</span>}
                              {p.approval_status === 'pending' && missingRequiredDocs(p.submitted_documents || []).length > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Docs missing</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.contact_person} · {p.email}</div>
                            {p.service_areas && p.service_areas.length > 0 && <div className="text-xs text-gray-400 mt-0.5">{p.service_areas.slice(0, 3).join(', ')}</div>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0 items-center">
                            {p.approval_status === 'pending' ? (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); updateProviderStatus(p.id, 'approved') }} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ background: '#0E9F7E' }}>Approve</button>
                                <button onClick={(e) => { e.stopPropagation(); updateProviderStatus(p.id, 'rejected') }} className="text-xs px-3 py-1.5 rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50">Deny</button>
                              </>
                            ) : (
                              <select value={p.approval_status} onChange={(e) => { e.stopPropagation(); updateProviderStatus(p.id, e.target.value) }} onClick={(e) => e.stopPropagation()}
                                className={`text-xs border rounded-lg px-2 py-1 ${p.approval_status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' : p.approval_status === 'rejected' ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-500'}`}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                              </select>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); deleteProvider(p.id) }} title="Delete provider" className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {selectedProvider && (
                <div className="w-80 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-5 h-fit sticky top-20 overflow-y-auto max-h-screen">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{selectedProvider.company_name}</h3>
                      <div className="text-xs text-gray-400 mt-0.5">{selectedProvider.contact_person}</div>
                    </div>
                    <button onClick={() => setSelectedProvider(null)} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
                  </div>
                  <div className="space-y-2 text-xs mb-4">
                    {[
                      ['Email', selectedProvider.email],
                      ['Phone', selectedProvider.phone],
                      ['Website', selectedProvider.website || '—'],
                      ['Areas', selectedProvider.service_areas?.join(', ') || '—'],
                      ['Categories', selectedProvider.categories_served?.join(', ') || '—'],
                      ['Vehicles', selectedProvider.vehicle_types?.join(', ') || '—'],
                      ['Fleet', selectedProvider.vehicle_count ? `${selectedProvider.vehicle_count} vehicles` : '—'],
                      ['Capacity', selectedProvider.max_passenger_capacity ? `${selectedProvider.max_passenger_capacity} passengers` : '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-gray-400 flex-shrink-0">{label}</span>
                        <span className="text-right font-medium text-xs break-all" style={{ color: '#0B1F3A' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Compliance documents */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="text-xs font-medium mb-2" style={{ color: '#0B1F3A' }}>Compliance documents</div>
                    <div className="space-y-1.5">
                      {REQUIRED_DOCS.map((doc) => {
                        const received = (selectedProvider.submitted_documents || []).includes(doc.id)
                        return (
                          <div key={doc.id} className="flex items-center justify-between text-xs">
                            <span style={{ color: '#0B1F3A' }}>{doc.label}{doc.required && <span className="text-gray-400"> (required)</span>}</span>
                            <span className={`font-medium ${received ? 'text-teal-600' : doc.required ? 'text-red-500' : 'text-gray-300'}`}>
                              {received ? '✓ Received' : doc.required ? 'Missing' : 'Not submitted'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Performance from analytics */}
                  {(() => {
                    const perf = provPerf.find((p) => p.provider_id === selectedProvider.id)
                    if (!perf) return null
                    return (
                      <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        <div className="text-xs font-medium mb-2" style={{ color: '#0B1F3A' }}>Performance</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            ['Leads received', perf.total_leads_received],
                            ['Responded', perf.total_leads_responded],
                            ['Win rate', `${perf.win_rate_pct}%`],
                            ['Avg response', `${perf.avg_response_days || '—'}d`],
                            ['Bookings', perf.total_bookings],
                            ['Avg price', fmt(perf.avg_booking_price)],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <div className="text-gray-400">{label}</div>
                              <div className="font-medium" style={{ color: '#0B1F3A' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex gap-2 mb-4">
                    <button onClick={() => updateProviderStatus(selectedProvider.id, 'approved')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${selectedProvider.approval_status === 'approved' ? 'text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      style={{ background: selectedProvider.approval_status === 'approved' ? '#0E9F7E' : undefined }}>
                      {selectedProvider.approval_status === 'approved' ? '✓ Approved' : 'Approve'}
                    </button>
                    <button onClick={() => updateProviderStatus(selectedProvider.id, 'rejected')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${selectedProvider.approval_status === 'rejected' ? 'bg-red-600 text-white' : 'border border-red-200 text-red-600 hover:bg-red-50'}`}>
                      {selectedProvider.approval_status === 'rejected' ? '✗ Denied' : 'Deny'}
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Internal notes</label>
                    <textarea rows={3} value={providerNote} onChange={(e) => setProviderNote(e.target.value)} placeholder="Add notes..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
                    <button onClick={saveProviderNote} disabled={savingNote} className="mt-1.5 w-full py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                      {savingNote ? 'Saving...' : 'Save note'}
                    </button>
                  </div>
                  {selectedProvider.approval_status === 'approved' && (
                    <button
                      onClick={() => resendApprovalEmail(selectedProvider)}
                      className="w-full py-2 text-xs font-medium rounded-lg transition-colors mb-3"
                      style={{ background: '#0E9F7E', color: '#fff' }}
                    >
                      Resend approval email
                    </button>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Email provider</label>
                    <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs mb-2" />
                    <textarea rows={4} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Message..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none mb-2" />
                    <button onClick={sendProviderEmail} className="w-full py-2 text-xs font-medium text-white rounded-lg" style={{ background: '#0B1F3A' }}>
                      {emailSent ? '✓ Email opened' : 'Open email'}
                    </button>
                  </div>
                  <button onClick={() => deleteProvider(selectedProvider.id)} className="mt-4 w-full py-2 text-xs text-center border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Delete provider</button>
                </div>
              )}
            </>
          )}

          {/* SEND LEADS */}
          {tab === 'leads' && (
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
                <h2 className="text-base font-medium mb-1" style={{ color: '#0B1F3A' }}>Send leads manually</h2>
                <p className="text-sm text-gray-400 mb-6">Select a request and choose providers to notify.</p>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#0B1F3A' }}>1. Select a request</label>
                  <select value={leadRequest} onChange={(e) => setLeadRequest(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                    <option value="">Choose a request...</option>
                    {requests.map((r) => <option key={r.id} value={r.id}>{r.reference_number} — {r.customer?.name} — {r.pickup_city || r.pickup_address} [{STATUS_LABELS[r.status]}]</option>)}
                  </select>
                  {leadRequest && (() => {
                    const req = requests.find((r) => r.id === leadRequest)
                    if (!req) return null
                    return (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                        <div><span className="text-gray-400">Route:</span> {req.pickup_city || req.pickup_address} → {req.dropoff_city || req.dropoff_address}</div>
                        <div><span className="text-gray-400">Schedule:</span> {req.trip_type} · {req.days_needed}</div>
                        <div><span className="text-gray-400">Private:</span> {req.private_only ? 'Yes' : 'Shared OK'}</div>
                      </div>
                    )
                  })()}
                </div>
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: '#0B1F3A' }}>2. Choose providers</label>
                    <button onClick={() => setSelectedProviderIds(approvedProviders.map((p) => p.id))} className="text-xs text-gray-400 hover:text-gray-600 underline">Select all approved</button>
                  </div>
                  {approvedProviders.length === 0 ? (
                    <div className="text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-xl">No approved providers yet.</div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {approvedProviders.map((p) => (
                        <label key={p.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedProviderIds.includes(p.id) ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}>
                          <input type="checkbox" checked={selectedProviderIds.includes(p.id)} onChange={() => toggleLeadProvider(p.id)} className="accent-teal-600 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{p.company_name}</div>
                            <div className="text-xs text-gray-400">{p.service_areas?.slice(0, 3).join(', ')}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={sendLeads} disabled={sendingLeads || !leadRequest || selectedProviderIds.length === 0}
                  className="w-full py-3 text-sm font-medium text-white rounded-xl disabled:opacity-40" style={{ background: '#0E9F7E' }}>
                  {sendingLeads ? 'Sending...' : `Send to ${selectedProviderIds.length} provider${selectedProviderIds.length !== 1 ? 's' : ''}`}
                </button>
                {leadResult && <div className={`mt-3 text-sm text-center p-3 rounded-lg ${leadResult.includes('Successfully') ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{leadResult}</div>}
              </div>

              {/* Lead history table */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>Lead history</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Every lead sent, response received, and outcome recorded</p>
                </div>
                {leadHistory.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">No leads sent yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Sent', 'Reference', 'Route', 'Provider', 'Response', 'Quoted price', 'Booked price', 'Status'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {leadHistory.map((l) => (
                          <tr key={l.lead_match_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(l.sent_at)}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{l.reference_number}</td>
                            <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{l.pickup_city || '—'} → {l.dropoff_city || '—'}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{l.company_name}</td>
                            <td className="px-4 py-3">
                              {l.response_type ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  l.response_type === 'booked' ? 'bg-green-100 text-green-700' :
                                  l.response_type === 'interested' ? 'bg-blue-50 text-blue-700' :
                                  l.response_type === 'not_interested' ? 'bg-red-50 text-red-600' :
                                  'bg-gray-100 text-gray-500'
                                }`}>{l.response_type.replace('_', ' ')}</span>
                              ) : <span className="text-gray-300">No response</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-500">{l.quoted_price ? `${fmt(l.quoted_price)}/${l.quoted_price_period || 'mo'}` : '—'}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: l.booked_monthly_price ? '#0E9F7E' : undefined }}>{l.booked_monthly_price ? `${fmt(l.booked_monthly_price)}/mo` : '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                l.booking_status === 'active' ? 'bg-green-100 text-green-700' :
                                l.lead_status === 'sent' ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-500'
                              }`}>{l.booking_status || l.lead_status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {tab === 'bookings' && (
            <div className="flex-1 min-w-0 space-y-6">
              {/* Record a booking */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-medium mb-1" style={{ color: '#0B1F3A' }}>Record a booking</h2>
                <p className="text-sm text-gray-400 mb-5">When a request is confirmed, log it here to track contract value and provider performance.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Request</label>
                    <select value={bookingForm.request_id} onChange={(e) => setBookingForm((f) => ({ ...f, request_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="">Select request...</option>
                      {requests.filter((r) => r.status !== 'booked').map((r) => <option key={r.id} value={r.id}>{r.reference_number} — {r.customer?.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Provider</label>
                    <select value={bookingForm.provider_id} onChange={(e) => setBookingForm((f) => ({ ...f, provider_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="">Select provider...</option>
                      {approvedProviders.map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Monthly price ($)</label>
                    <input type="number" placeholder="450" value={bookingForm.monthly_price} onChange={(e) => setBookingForm((f) => ({ ...f, monthly_price: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Duration (months)</label>
                    <input type="number" placeholder="10" value={bookingForm.duration_months} onChange={(e) => setBookingForm((f) => ({ ...f, duration_months: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Service start date</label>
                    <input type="date" value={bookingForm.service_start_date} onChange={(e) => setBookingForm((f) => ({ ...f, service_start_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" id="is_private" checked={bookingForm.is_private} onChange={(e) => setBookingForm((f) => ({ ...f, is_private: e.target.checked }))} className="accent-teal-600" />
                    <label htmlFor="is_private" className="text-sm text-gray-600">Private route</label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Notes (optional)</label>
                    <textarea rows={2} placeholder="Any additional notes about this booking..." value={bookingForm.notes} onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                  </div>
                </div>
                {bookingForm.monthly_price && bookingForm.duration_months && (
                  <div className="mt-3 p-3 bg-teal-50 rounded-xl text-xs text-teal-700">
                    Estimated contract value: <strong>{fmt(parseFloat(bookingForm.monthly_price) * parseInt(bookingForm.duration_months))}</strong> total · {fmt(parseFloat(bookingForm.monthly_price) * 12)}/year
                  </div>
                )}
                <button onClick={saveBooking} disabled={savingBooking} className="mt-4 w-full py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50" style={{ background: '#0B1F3A' }}>
                  {savingBooking ? 'Recording...' : 'Record booking'}
                </button>
                {bookingResult && <div className={`mt-3 text-sm text-center p-3 rounded-lg ${bookingResult.includes('success') ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600'}`}>{bookingResult}</div>}
              </div>

              {/* Bookings table */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>All bookings</h3>
                </div>
                {bookings.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">No bookings recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Date', 'Reference', 'Customer', 'Provider', 'City', 'Monthly', 'Annual value', 'Duration', 'Type', 'Status'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(b.booked_at)}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{(b.request as TransportationRequest & { reference_number: string })?.reference_number || '—'}</td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{(b.request as TransportationRequest & { customer?: Customer })?.customer?.name || '—'}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{(b.provider as Provider)?.company_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-500">{b.pickup_city || '—'}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: '#0E9F7E' }}>{fmt(b.monthly_price)}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: '#0B1F3A' }}>{fmt(b.annual_value)}</td>
                            <td className="px-4 py-3 text-gray-500">{b.duration_months ? `${b.duration_months}mo` : '—'}</td>
                            <td className="px-4 py-3 text-gray-500">{b.is_private ? 'Private' : 'Shared'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${b.status === 'active' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="flex-1 min-w-0 space-y-6">

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total requests', value: summary.total_requests || 0 },
                  { label: 'Total booked', value: summary.total_booked || 0 },
                  { label: 'Booking rate', value: `${summary.statewide_booking_rate || 0}%` },
                  { label: 'Avg monthly spend', value: fmt(summary.statewide_avg_monthly_spend) },
                ].map((m) => (
                  <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                    <div className="text-2xl font-semibold" style={{ color: '#0B1F3A' }}>{m.value}</div>
                    <div className="text-xs text-gray-400 mt-1">Statewide</div>
                  </div>
                ))}
              </div>

              {/* Geographic intelligence */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>Geographic intelligence</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Requests, booking rates, and spend by city vs. statewide average</p>
                </div>
                {geoData.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">No geographic data yet. Data builds as requests come in.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['City', 'Zip', 'Requests', 'Booked', 'Booking rate', 'Private', 'Shared', 'Avg monthly spend', 'vs. Statewide avg', 'Annual value', 'Car seats', 'Wheelchair'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {geoData.map((g) => {
                          const vsState = g.avg_monthly_spend && summary.statewide_avg_monthly_spend
                            ? g.avg_monthly_spend - summary.statewide_avg_monthly_spend
                            : null
                          return (
                            <tr key={`${g.city}-${g.zip}`} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{g.city}</td>
                              <td className="px-4 py-3 text-gray-400">{g.zip || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{g.total_requests}</td>
                              <td className="px-4 py-3 text-gray-600">{g.total_booked}</td>
                              <td className="px-4 py-3">
                                <span className={`font-medium ${g.booking_rate_pct >= 50 ? 'text-green-600' : g.booking_rate_pct >= 25 ? 'text-amber-600' : 'text-gray-400'}`}>
                                  {g.booking_rate_pct}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{g.private_requests}</td>
                              <td className="px-4 py-3 text-gray-600">{g.shared_requests}</td>
                              <td className="px-4 py-3 font-medium" style={{ color: '#0B1F3A' }}>{fmt(g.avg_monthly_spend)}</td>
                              <td className="px-4 py-3">
                                {vsState != null ? (
                                  <span className={`font-medium ${vsState > 0 ? 'text-green-600' : vsState < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {vsState > 0 ? '+' : ''}{fmt(vsState)}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 font-medium" style={{ color: '#0E9F7E' }}>{fmt(g.total_annual_value)}</td>
                              <td className="px-4 py-3 text-gray-600">{g.car_seat_requests}</td>
                              <td className="px-4 py-3 text-gray-600">{g.wheelchair_requests}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Provider performance */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-medium" style={{ color: '#0B1F3A' }}>Provider performance</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Leads received, response rates, win rates, and revenue by provider</p>
                </div>
                {provPerf.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">No performance data yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Provider', 'Leads sent', 'Responded', 'Interested', 'Quoted', 'Booked', 'Win rate', 'Avg response', 'Avg price', 'Total annual value'].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {provPerf.map((p) => (
                          <tr key={p.provider_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0B1F3A' }}>{p.company_name}</td>
                            <td className="px-4 py-3 text-gray-600">{p.total_leads_received}</td>
                            <td className="px-4 py-3 text-gray-600">{p.total_leads_responded}</td>
                            <td className="px-4 py-3 text-gray-600">{p.leads_interested}</td>
                            <td className="px-4 py-3 text-gray-600">{p.leads_quoted}</td>
                            <td className="px-4 py-3 text-gray-600">{p.total_bookings}</td>
                            <td className="px-4 py-3">
                              <span className={`font-medium ${p.win_rate_pct >= 30 ? 'text-green-600' : p.win_rate_pct >= 10 ? 'text-amber-600' : 'text-gray-400'}`}>
                                {p.win_rate_pct}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{p.avg_response_days ? `${p.avg_response_days}d` : '—'}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: '#0B1F3A' }}>{fmt(p.avg_booking_price)}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: '#0E9F7E' }}>{fmt(p.total_annual_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
