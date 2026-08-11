'use client'

import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

const FAQS = [
  {
    q: 'What is Hiyoon and how does it work for providers?',
    a: 'Hiyoon is a school transportation marketplace that connects families with local transportation providers. When a customer submits a request that matches your service area and vehicle capabilities, you receive an email with the full route details and a link to submit your quote directly. The customer reviews all quotes on their personal offer page and selects the provider they want.'
  },
  {
    q: 'Is there a cost to join as a provider?',
    a: 'We are currently onboarding founding providers at no cost. You can apply, get approved, and receive matched leads for free during our launch period. Early providers will lock in preferred rates when we introduce subscription pricing. We will give you advance notice before any fees are introduced.'
  },
  {
    q: 'How do I apply to become a provider?',
    a: 'Go to hiyoon.com/providers and complete the application form. You will provide your company information, service areas, vehicle types, and capabilities. You can submit your application immediately and upload your compliance documents right away or return later using a secure link we will email you.'
  },
  {
    q: 'What documents do I need to provide?',
    a: 'Required documents include your Massachusetts 7D Driver Certificate for each driver, Certificate of Insurance showing at minimum $100,000 per person/$300,000 per accident/$5,000 property damage coverage, and vehicle registration for each 7D vehicle. Optional but encouraged: CORI check documentation, 7D vehicle inspection certificate, and business registration. Your application will not be approved until all required documents are received.'
  },
  {
    q: 'What is a 7D certificate and do I need one?',
    a: 'A 7D certificate is issued by the Massachusetts RMV and is required for any driver transporting school pupils in a van or non-bus vehicle on a fixed route. If you are operating school transportation in Massachusetts, you are required by law to hold this certification. We require proof of 7D certification from all providers on Hiyoon. Visit the MA RMV website for information on obtaining certification.'
  },
  {
    q: 'How long does the approval process take?',
    a: 'Our team reviews every application within 2 to 3 business days. If your documents are complete, approval is typically faster. Once approved, you will receive a confirmation email and begin receiving matched leads.'
  },
  {
    q: 'How do I receive leads?',
    a: 'Once approved, when a customer submits a request that matches your service area, vehicle type, and capabilities, you will receive an email with the full request details. The email includes a secure link to your personal quote submission form where you can enter your price, vehicle type, availability, and any notes for the customer.'
  },
  {
    q: 'What information is included in a lead?',
    a: 'Every lead email includes the full route — pickup and drop-off address, category, number of passengers and their age or grade, schedule and frequency, school arrival and afternoon pickup times, start date, duration, any special requirements such as car seat or wheelchair access, and the customer\'s budget range. You have everything you need to quote accurately without any back and forth.'
  },
  {
    q: 'How long do I have to respond to a lead?',
    a: 'Customers typically have a 48 hour offer window for standard requests and 24 hours for urgent requests. You should submit your quote as quickly as possible — customers see all quotes in real time and may select a provider before the window closes.'
  },
  {
    q: 'Can I see other providers\' quotes?',
    a: 'No. Provider quotes are only visible to the customer on their offer page. You will not see what other providers have quoted. Focus on submitting your best, most competitive offer.'
  },
  {
    q: 'What happens when a customer selects my quote?',
    a: 'You will receive a confirmation email notifying you that your quote was accepted. The email includes the customer\'s name and contact information so you can reach out directly to confirm route details, discuss the start date, and finalize the arrangement. The customer also receives your contact information.'
  },
  {
    q: 'What if I am not available for a route after submitting a quote?',
    a: 'Only submit quotes for routes you are confident you can serve. If your availability changes after submitting a quote but before a customer selects you, contact us at hello@hiyoon.com as soon as possible so we can update the customer\'s options.'
  },
  {
    q: 'How do I update my service areas or vehicle information?',
    a: 'Contact us at hello@hiyoon.com with any updates to your service areas, vehicle fleet, capabilities, or contact information. We will update your profile so future lead matching reflects your current operation.'
  },
  {
    q: 'What happens if a customer has a complaint about my service?',
    a: 'We take service quality seriously. Customer complaints are reviewed by the Hiyoon team. Providers with repeated complaints may have their account suspended or removed from the platform. We encourage open communication — if there is an issue, let us know before it escalates.'
  },
  {
    q: 'Am I an employee of Hiyoon?',
    a: 'No. Providers are independent contractors, not employees or agents of Hiyoon. You operate your own business, maintain your own licenses and insurance, and set your own pricing. Hiyoon facilitates the introduction between you and customers but is not a party to your service agreement with them.'
  },
  {
    q: 'Do I need to carry my own insurance?',
    a: 'Yes. You are required to maintain your own commercial auto insurance and any other coverage required by Massachusetts law for your type of operation. Hiyoon does not provide insurance coverage for providers. Your Certificate of Insurance must be kept current and you must notify us if your coverage changes or lapses.'
  },
  {
    q: 'Can I be on Hiyoon and also work with other platforms or schools directly?',
    a: 'Yes. Hiyoon does not require exclusivity. You are free to work with schools, families, and other platforms directly. Hiyoon simply provides an additional channel for you to find matched leads in your area.'
  },
  {
    q: 'How do I contact Hiyoon with a question or issue?',
    a: 'Email us at hello@hiyoon.com or visit hiyoon.com/contact. We respond within one business day. For urgent issues related to an active booking, include "Urgent" in your subject line.'
  },
]

export default function ProviderFAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-semibold mb-3" style={{ color: '#0B1F3A' }}>
            Provider FAQ
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            Everything transportation providers need to know about joining and operating on Hiyoon.
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
          <p className="text-sm font-medium mb-1" style={{ color: '#0B1F3A' }}>Ready to join?</p>
          <p className="text-sm text-gray-500 mb-4">Apply to become a Hiyoon provider and start receiving matched leads in your service area.</p>
          <Link href="/providers"
            className="inline-block px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ background: '#0E9F7E' }}>
            Apply as a provider
          </Link>
        </div>

      </div>
      <Footer />
    </>
  )
}
