'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Name, email, and message are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try emailing us directly at hello@hiyoon.com')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Left — info */}
          <div>
            <h1 className="text-3xl font-semibold mb-4" style={{ color: '#0B1F3A' }}>Get in touch</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Have a question about a request, need help with a provider application, or just want to talk? We're here.
            </p>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: '#0E9F7E' }}>Email</div>
                <a href="mailto:hello@hiyoon.com" className="text-sm font-medium hover:underline" style={{ color: '#0B1F3A' }}>hello@hiyoon.com</a>
              </div>

              <div>
                <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#0E9F7E' }}>Common questions</div>
                <div className="space-y-4">
                  {[
                    { q: 'I submitted a request — what happens next?', a: 'We match your request with local providers and send you an email with a personal offer page link. Providers typically respond within 24–48 hours.' },
                    { q: 'How do I become a provider?', a: 'Click "For providers" in the navigation and complete the application. Our team reviews every application within 2–3 business days.' },
                    { q: 'Is Hiyoon available outside Massachusetts?', a: 'We currently serve Massachusetts and are expanding. If you\'re interested in bringing Hiyoon to your area, reach out.' },
                  ].map((item) => (
                    <div key={item.q} className="border border-gray-100 rounded-xl p-4">
                      <div className="text-sm font-medium mb-1" style={{ color: '#0B1F3A' }}>{item.q}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: '#E6F8F4' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5 9-10" stroke="#0E9F7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#0B1F3A' }}>Message sent</h3>
                <p className="text-sm text-gray-500">We'll get back to you within 1–2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-7 space-y-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Your name</label>
                  <input type="text" placeholder="First and last name" value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Email</label>
                  <input type="email" placeholder="you@email.com" value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>
                    Subject <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select value={form.subject} onChange={(e) => update('subject', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                    <option value="">Select a topic...</option>
                    <option>Question about my request</option>
                    <option>Provider application</option>
                    <option>Technical issue</option>
                    <option>Partnership inquiry</option>
                    <option>Media inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B1F3A' }}>Message</label>
                  <textarea rows={5} placeholder="Tell us what's on your mind..." value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}
                <button type="submit" disabled={submitting}
                  className="w-full py-3 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50"
                  style={{ background: '#0B1F3A' }}>
                  {submitting ? 'Sending...' : 'Send message'}
                </button>
                <p className="text-center text-xs text-gray-400">
                  Or email us directly at <a href="mailto:hello@hiyoon.com" className="underline">hello@hiyoon.com</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
