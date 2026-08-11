'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

const FAQS = [
  {
    q: 'What is Hiyoon?',
    a: 'Hiyoon is a school transportation marketplace. We connect families and organizations with local, licensed transportation providers who can handle recurring school routes, daycare pickup, and more. You submit your need once, and we match you with providers in your area who can help.'
  },
  {
    q: 'Is it free to submit a request?',
    a: 'Yes, completely free. There is no cost to submit a transportation request on Hiyoon. You only make a decision after you have seen provider quotes and chosen the right fit for your family.'
  },
  {
    q: 'How does the matching work?',
    a: 'When you submit a request, we review your route, schedule, passenger details, and any special requirements. We then match your request with approved local providers who serve your area and have the right vehicle type and capabilities. They receive your details and can submit a quote directly.'
  },
  {
    q: 'How long does it take to receive quotes?',
    a: 'Providers have 48 hours to respond for standard requests. If you selected ASAP as your urgency, providers have 24 hours. Most quotes start coming in within a few hours of your request being sent out.'
  },
  {
    q: 'How do I see my quotes?',
    a: 'When you submit a request, you will receive a confirmation email with a link to your personal offer page. That page updates in real time as providers submit quotes — no login required. Bookmark it and check back anytime.'
  },
  {
    q: 'What information do providers see about me?',
    a: 'Providers see your route details, schedule, passenger information, and any special requirements you noted. Your personal contact information — phone number and email — is only shared after you select a provider and confirm your booking.'
  },
  {
    q: 'What happens after I select a provider?',
    a: 'Once you select a provider from your offer page, both you and the provider receive a confirmation email. The provider gets your contact information and will reach out to confirm route details, start date, and any final logistics. You will receive their contact information so you can reach them directly.'
  },
  {
    q: 'Are the providers on Hiyoon verified?',
    a: 'Yes. Every provider goes through an approval process before they can receive leads. We require proof of their Massachusetts 7D Driver Certificate, Certificate of Insurance, and vehicle registration at minimum. Our team reviews every application before approving providers on the platform.'
  },
  {
    q: 'What is a 7D certificate?',
    a: 'A 7D certificate is issued by the Massachusetts RMV and is required for any driver transporting school pupils in a van or non-bus vehicle on a fixed route. It involves background checks, driving record review, and vehicle inspections. We require this from all school transportation providers on Hiyoon.'
  },
  {
    q: 'What if I need a wheelchair accessible vehicle?',
    a: 'When filling out your request on step 4, check the "Wheelchair accessible vehicle" option. This filters your request to only providers who have accessible vehicles and can accommodate your passenger\'s needs.'
  },
  {
    q: 'What if my child needs a car seat or booster?',
    a: 'Select the "Car seat or booster needed" option when completing your request. Providers who respond to your quote will confirm they have the appropriate seat for your child\'s age and weight.'
  },
  {
    q: 'Can I request a shared or private ride?',
    a: 'Yes. During the request form you can specify whether a shared ride is okay — where your child rides with other students along a planned route — or whether you need a private vehicle where your child is the only passenger. Private routes typically cost more than shared routes.'
  },
  {
    q: 'What areas does Hiyoon currently serve?',
    a: 'We are currently serving families across Greater Boston and the surrounding Massachusetts communities including Dorchester, Roxbury, Milton, Canton, Hyde Park, Mattapan, the South Shore, and more. We are expanding.'
  },
  {
    q: 'Can I submit a request for a one-time trip?',
    a: 'Yes. When filling out your request, select "One-time trip" as the frequency. Providers will be notified that it is a single trip and can quote accordingly.'
  },
  {
    q: 'What if no providers respond to my request?',
    a: 'If your request does not receive quotes within the offer window, contact us at hello@hiyoon.com. We will follow up, reach out to additional providers in your area, or help you adjust your request details to improve your chances of a match.'
  },
  {
    q: 'How is Hiyoon different from calling transportation companies directly?',
    a: 'With Hiyoon you submit your details once and multiple providers compete for your route. You see all your options in one place with clear pricing, vehicle types, and availability. No phone tag, no back and forth, no guessing who to call. We also handle the vetting so you know every provider you see has been reviewed.'
  },
  {
    q: 'Is my information secure?',
    a: 'Yes. All data is transmitted over HTTPS and stored securely. We do not sell your personal information to third parties. Your contact details are only shared with the specific provider you choose to book with.'
  },
  {
    q: 'How do I contact Hiyoon with a question?',
    a: 'Visit our contact page at hiyoon.com/contact or email us directly at hello@hiyoon.com. We typically respond within one business day.'
  },
]

export default function CustomerFAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold mb-3" style={{ color: '#0B1F3A' }}>
            Frequently asked questions
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            Everything families need to know about finding school transportation through Hiyoon.
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium" style={{ color: '#0B1F3A' }}>{faq.q}</span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{ background: open === i ? '#0E9F7E' : '#F1F5F9' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M2 4l4 4 4-4" stroke={open === i ? '#fff' : '#6B7B8D'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl" style={{ background: '#F8FAFB', border: '1px solid #E2E8F0' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#0B1F3A' }}>Still have questions?</p>
          <p className="text-sm text-gray-500 mb-4">We are happy to help. Reach out and we will get back to you within one business day.</p>
          <Link href="/contact"
            className="inline-block px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ background: '#0B1F3A' }}>
            Contact us
          </Link>
        </div>

      </div>
      <Footer />
    </>
  )
}
