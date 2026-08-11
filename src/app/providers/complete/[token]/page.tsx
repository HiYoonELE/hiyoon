'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { REQUIRED_DOCS } from '@/lib/providerDocs'

interface ProviderApplication {
  company_name: string
  approval_status: string
  submitted_documents: string[]
}

export default function CompleteApplicationPage() {
  const params = useParams()
  const token = params.token as string

  const [application, setApplication] = useState<ProviderApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) { setError('Invalid link.'); setLoading(false); return }
    fetch(`/api/providers/complete?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setApplication(d.data)
      })
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => setLoading(false))
  }, [token])

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
    if (Object.keys(uploadedFiles).length === 0) {
      setError('Please select at least one document to upload.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('token', token)
      Object.entries(uploadedFiles).forEach(([key, file]) => formData.append(`doc_${key}`, file))
      const res = await fetch('/api/providers/complete', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSubmitted(true)
      setApplication((a) => a ? { ...a, submitted_documents: data.submitted_documents } : a)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFB' }}>
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  if (error && !application) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Link unavailable</h1>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    </div>
  )

  if (!application) return null

  const submittedIds = application.submitted_documents || []
  const missingRequired = REQUIRED_DOCS.filter((d) => d.required && !submittedIds.includes(d.id))

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: '#F8FAFB' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0B1F3A' }}>Finish your application</h1>
            <p className="text-sm text-gray-500">{application.company_name}</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#E6F8F4' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l6 6 10-12" stroke="#0E9F7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>Documents received</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {missingRequired.length === 0
                  ? "You've submitted all required documents. Our team will review your application shortly."
                  : `We still need: ${missingRequired.map((d) => d.label).join(', ')}. You can come back to this link anytime to finish.`}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {application.approval_status !== 'pending' && (
                <div className="mb-6 p-3 rounded-xl text-xs text-gray-500" style={{ background: '#F8FAFB' }}>
                  Your application status is currently <strong>{application.approval_status}</strong>.
                </div>
              )}
              <p className="text-sm text-gray-500 mb-6">
                Upload any remaining compliance documents below. We won&apos;t approve your account until all required documents are received.
              </p>

              <div className="space-y-3">
                {REQUIRED_DOCS.map((doc) => {
                  const alreadySubmitted = submittedIds.includes(doc.id)
                  const uploaded = uploadedFiles[doc.id]
                  const err = uploadErrors[doc.id]
                  return (
                    <div key={doc.id} className={`border rounded-xl p-4 transition-all ${
                      alreadySubmitted || uploaded ? 'border-teal-300 bg-teal-50' : 'border-gray-100'
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

                        {alreadySubmitted && !uploaded ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium flex-shrink-0" style={{ color: '#0E9F7E' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2.5 7l3 3 6-6" stroke="#0E9F7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Received
                          </div>
                        ) : uploaded ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#0E9F7E' }}>
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7l3 3 6-6" stroke="#0E9F7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Ready to upload
                            </div>
                            <button onClick={() => removeFile(doc.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
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
                      {err && <p className="mt-1.5 text-xs text-red-500">{err}</p>}
                    </div>
                  )
                })}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-6">{error}</p>
              )}

              <button onClick={handleSubmit} disabled={submitting || Object.keys(uploadedFiles).length === 0}
                className="w-full mt-6 py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50"
                style={{ background: '#0B1F3A' }}>
                {submitting ? 'Uploading...' : 'Submit documents'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
