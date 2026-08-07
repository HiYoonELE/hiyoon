import React from 'react'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'

export default function ProviderConfirmationPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-start justify-center pt-20 px-4" style={{ background: '#F8FAFB' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: '#E6F8F4' }}>
            🚐
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>
            Application received
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Our team reviews every provider to make sure families get quality options. We'll be in touch within 2–3 business days.
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left mb-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: '#0B1F3A' }}>What to expect</h3>
            <div className="space-y-3">
              {[
                'Our team reviews your application and service areas.',
                "Once approved, you'll receive matched transportation requests by email with a link to submit your quote directly.",
                'When a customer selects your quote, you\'ll get a confirmation email with their contact information.',
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5" style={{ background: '#E6F8F4', color: '#0E9F7E' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </>
  )
}
