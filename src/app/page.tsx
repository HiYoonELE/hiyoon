import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col" style={{ background: '#fff' }}>

        {/* Main centered content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4" style={{ marginTop: '-64px' }}>

          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="font-semibold" style={{ fontSize: '52px', color: '#0B1F3A', letterSpacing: '-1px', lineHeight: 1 }}>
              Route<span style={{ color: '#0E9F7E' }}>Bridge</span>
            </h1>
            <p className="mt-3 text-base" style={{ color: '#6B7B8D' }}>
              School transportation, made simple
            </p>
          </div>

          {/* Search bar */}
          <Link
            href="/request"
            className="w-full max-w-xl flex items-center gap-3 px-5 py-4 rounded-full border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
            style={{ background: '#fff' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: '#9CA3AF', flexShrink: 0 }}>
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12.5 12.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ color: '#9CA3AF', fontSize: '16px' }}>Where does your child need to go?</span>
          </Link>

          {/* CTA buttons */}
          <div className="flex gap-3 mt-6">
            <Link
              href="/request"
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ background: '#F1F3F4', color: '#3C4043' }}
            >
              Find transportation
            </Link>
            <Link
              href="/providers"
              className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ background: '#F1F3F4', color: '#3C4043' }}
            >
              Join as a provider
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs" style={{ color: '#BDC1C6' }}>
            Serving families across Massachusetts &mdash; school & daycare transportation
          </p>
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-xs" style={{ color: '#70757A' }}>
              &copy; {new Date().getFullYear()} RouteBridge
            </p>
            <div className="flex gap-5">
              <Link href="/how-it-works" className="text-xs hover:underline" style={{ color: '#70757A' }}>How it works</Link>
              <Link href="/providers" className="text-xs hover:underline" style={{ color: '#70757A' }}>For providers</Link>
              <Link href="/privacy" className="text-xs hover:underline" style={{ color: '#70757A' }}>Privacy</Link>
              <Link href="/terms" className="text-xs hover:underline" style={{ color: '#70757A' }}>Terms</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
