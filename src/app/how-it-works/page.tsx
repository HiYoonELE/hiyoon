import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <section className="pt-16 pb-10 px-4 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-semibold mb-4" style={{ color: '#0B1F3A' }}>How Route Bridge works</h1>
        <p className="text-lg text-gray-500">
          We connect people who need transportation with local providers who can deliver it — without the chaos of cold calls or endless searching.
        </p>
      </section>

      <section className="py-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-8 text-center" style={{ color: '#0B1F3A' }}>For customers</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Submit your request', body: 'Fill out our short guided form — it takes about 3 minutes. Tell us where you need to go, how many passengers, what kind of transportation, and when.' },
            { step: '2', title: 'We match you with providers', body: 'Our team reviews your request and identifies local providers who serve your area, match your transportation type, and have the right vehicle capabilities.' },
            { step: '3', title: 'Providers respond', body: 'Matched providers receive your request and can submit a quote, express interest, or ask for more details. You don't need to do anything during this step.' },
            { step: '4', title: 'You choose', body: 'We send you the best options. You review pricing, vehicle types, and availability — then choose the right fit or ask us for more help.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-5 items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ background: '#0B1F3A', color: '#0E9F7E' }}>{s.step}</div>
              <div>
                <h3 className="text-base font-medium mb-1" style={{ color: '#0B1F3A' }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/request" className="inline-block px-7 py-3 text-sm font-medium text-white rounded-xl" style={{ background: '#0B1F3A' }}>
            Submit a request
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
