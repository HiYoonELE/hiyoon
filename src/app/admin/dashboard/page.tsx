'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TransportationRequest, Provider } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  sent_to_providers: 'Sent to providers',
  provider_interested: 'Provider interested',
  quote_received: 'Quote received',
  customer_contacted: 'Customer contacted',
  booked: 'Booked',
  lost: 'Lost',
  not_serviceable: 'Not serviceable',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  reviewed: 'bg-amber-50 text-amber-700',
  sent_to_providers: 'bg-purple-50 text-purple-700',
  provider_interested: 'bg-indigo-50 text-indigo-700',
  quote_received: 'bg-teal-50 text-teal-700',
  customer_contacted: 'bg-green-50 text-green-700',
  booked: 'bg-green-100 text-green-800',
  lost: 'bg-red-50 text-red-600',
  not_serviceable: 'bg-gray-100 text-gray-500',
}

type Tab = 'requests' | 'providers'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('requests')
  const [requests, setRequests] = useState<TransportationRequest[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TransportationRequest | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'requests') {
        const res = await fetch('/api/requests')
        const json = await res.json()
        setRequests(json.data || [])
      } else {
        const res = await fetch('/api/providers')
        const json = await res.json()
        setProviders(json.data || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setRequests((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status: status as TransportationRequest['status'] } : r))
    )
    if (selected?.id === id) setSelected((s) => s ? { ...s, status: status as TransportationRequest['status'] } : s)
  }

  const updateProviderStatus = async (id: string, approval_status: string) => {
    await fetch(`/api/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_status }),
    })
    setProviders((ps) =>
      ps.map((p) => (p.id === id ? { ...p, approval_status: approval_status as Provider['approval_status'] } : p))
    )
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const filteredRequests = requests.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.customer?.name?.toLowerCase().includes(q) ||
      r.pickup_address?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const metrics = {
    open: requests.filter((r) => ['new', 'reviewed'].includes(r.status)).length,
    sent: requests.filter((r) => r.status === 'sent_to_providers').length,
    booked: requests.filter((r) => r.status === 'booked').length,
    pendingProviders: providers.filter((p) => p.approval_status === 'pending').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
      {/* Admin Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#0B1F3A' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M8 2l6 6-6 6" stroke="#0E9F7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold text-sm" style={{ color: '#0B1F3A' }}>
                RouteBridge <span className="text-gray-400 font-normal">Admin</span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Open requests', value: metrics.open, tag: 'Needs attention' },
            { label: 'Sent to providers', value: metrics.sent, tag: 'Awaiting response' },
            { label: 'Booked this month', value: metrics.booked, tag: '🎉 Conversions' },
            { label: 'Providers pending', value: metrics.pendingProviders, tag: 'Needs review' },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-xs text-gray-400 mb-1">{m.label}</div>
              <div className="text-3xl font-semibold mb-1" style={{ color: '#0B1F3A' }}>{m.value}</div>
              <div className="text-xs text-gray-400">{m.tag}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit">
          {(['requests', 'providers'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null) }}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                tab === t ? 'font-medium text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ background: tab === t ? '#0B1F3A' : 'transparent' }}
            >
              {t === 'requests' ? `Requests (${requests.length})` : `Providers (${providers.length})`}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          {/* Main table */}
          <div className="flex-1 min-w-0">
            {tab === 'requests' && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search by name, address, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">All statuses</option>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <button onClick={fetchData} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-sm text-gray-400">Loading requests...</div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-400">No requests found.</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredRequests.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selected?.id === r.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: '#0B1F3A' }}>
                            {r.customer?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            {r.pickup_address} → {r.dropoff_address}
                          </div>
                        </div>
                        <div className="hidden sm:block text-xs text-gray-400 w-28 flex-shrink-0">{r.category}</div>
                        <div className="hidden sm:block text-xs text-gray-400 w-20 flex-shrink-0">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                        <select
                          value={r.status}
                          onChange={(e) => { e.stopPropagation(); updateStatus(r.id, e.target.value) }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 flex-shrink-0"
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'providers' && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                {loading ? (
                  <div className="text-center py-12 text-sm text-gray-400">Loading providers...</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {providers
                      .filter((p) => !search || p.company_name.toLowerCase().includes(search.toLowerCase()))
                      .map((p) => (
                        <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{p.company_name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {p.contact_person} · {p.email}
                            </div>
                            {p.service_areas && p.service_areas.length > 0 && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {p.service_areas.slice(0, 3).join(', ')}
                                {p.service_areas.length > 3 && ` +${p.service_areas.length - 3} more`}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 hidden sm:block">
                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <select
                            value={p.approval_status}
                            onChange={(e) => updateProviderStatus(p.id, e.target.value)}
                            className={`text-xs border rounded-lg px-2 py-1 flex-shrink-0 ${
                              p.approval_status === 'approved' ? 'border-green-200 text-green-700 bg-green-50' :
                              p.approval_status === 'rejected' ? 'border-red-200 text-red-600 bg-red-50' :
                              'border-amber-200 text-amber-700 bg-amber-50'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && tab === 'requests' && (
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
                  ['Route', `${selected.pickup_address} → ${selected.dropoff_address}`],
                  ['Passengers', `${selected.passenger_count}${selected.passenger_age_grade ? ` (${selected.passenger_age_grade})` : ''}`],
                  ['Schedule', `${selected.trip_type} · ${selected.days_needed || '—'}`],
                  ['Times', `${selected.pickup_time || '—'} / ${selected.return_time || '—'}`],
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

              {/* Requirements */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {[
                  selected.wheelchair_accessible && 'Wheelchair',
                  selected.car_seat_needed && 'Car seat',
                  selected.medical_monitoring && 'Medical monitoring',
                  selected.background_checked && 'Background check',
                  selected.private_only && 'Private only',
                ].filter(Boolean).map((req) => (
                  <span key={req as string} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{req}</span>
                ))}
              </div>

              {selected.special_notes && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
                  {selected.special_notes}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Update status</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex gap-2">
                <a
                  href={`mailto:${selected.customer?.email}`}
                  className="flex-1 py-2 text-xs text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: '#0B1F3A' }}
                >
                  Email customer
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
