import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

const categories = [
  { name: 'School & Daycare', icon: '🏫', sub: 'Ages 3–18', href: '/request?category=School+%26+Daycare' },
  { name: 'Senior Transportation', icon: '🏥', sub: 'Medical & daily trips', href: '/request?category=Senior+Transportation' },
  { name: 'NEMT', icon: '♿', sub: 'Non-emergency medical', href: '/request?category=NEMT' },
  { name: 'Group & Charter', icon: '🚐', sub: 'Events & programs', href: '/request?category=Group+%26+Charter' },
  { name: 'Youth Programs', icon: '⚽', sub: 'Sports & after school', href: '/request?category=Youth+Programs' },
  { name: 'Adult Day Programs', icon: '🌿', sub: 'Recurring routes', href: '/request?category=Adult+Day+Programs' },
]

const steps = [
  {
    num: '1',
    title: 'Tell us your need',
    body: 'A short guided form — no account needed. Takes about 3 minutes.',
  },
  {
    num: '2',
    title: 'We match providers',
    body: 'Local providers who serve your area and route type are notified.',
  },
  {
    num: '3',
    title: 'Review your options',
    body: 'Providers respond with availability and pricing. You choose the right fit.',
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-block text-xs font-medium tracking-widest uppercase mb-5 px-3 py-1 rounded-full"
            style={{ background: '#E6F8F4', color: '#0E9F7E' }}
          >
            Local transportation marketplace
          </div>
          <h1
            className="text-4xl sm:text-5xl font-semibold leading-tight mb-5"
            style={{ color: '#0B1F3A', letterSpacing: '-0.5px' }}
          >
            Find the right ride for the people who matter most
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
            Submit your transportation need once. We connect you with local providers for school runs, senior trips, NEMT routes, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/request"
              className="px-7 py-3.5 text-base font-medium text-white rounded-xl transition-colors"
              style={{ background: '#0B1F3A' }}
            >
              Request transportation
            </Link>
            <Link
              href="/providers"
              className="px-7 py-3.5 text-base font-medium rounded-xl border-2 transition-colors"
              style={{ color: '#0B1F3A', borderColor: '#0B1F3A' }}
            >
              I'm a provider
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: '#0B1F3A' }} className="py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            'School & daycare transportation',
            'Senior & NEMT providers',
            'Charter vans & shuttles',
            'No commitment to submit',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#0E9F7E' }} />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#0E9F7E' }}>
              How it works
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#0B1F3A' }}>
              Three steps from request to route
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white border border-gray-100 rounded-2xl p-7"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold mb-4"
                  style={{ background: '#E6F8F4', color: '#0E9F7E' }}
                >
                  {step.num}
                </div>
                <h3 className="text-base font-medium mb-2" style={{ color: '#0B1F3A' }}>{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#F8FAFB' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#0E9F7E' }}>
              Transportation types
            </div>
            <h2 className="text-3xl font-semibold" style={{ color: '#0B1F3A' }}>
              We cover the routes families and programs need most
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors group"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <p className="text-sm font-medium mb-1" style={{ color: '#0B1F3A' }}>{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: '#0B1F3A' }}
          >
            <div className="text-3xl mb-1">🚐</div>
            <h2 className="text-2xl font-semibold text-white mt-4 mb-3">
              Are you a transportation provider?
            </h2>
            <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Join Route Bridge to receive matched leads in your service area. Free to apply.
            </p>
            <Link
              href="/providers"
              className="inline-block px-7 py-3 text-sm font-medium rounded-xl transition-colors"
              style={{ background: '#0E9F7E', color: '#fff' }}
            >
              Join as a provider
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
