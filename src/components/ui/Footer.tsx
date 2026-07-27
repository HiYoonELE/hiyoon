import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#0B1F3A' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M8 2l6 6-6 6" stroke="#0E9F7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#0B1F3A' }}>
                Route<span style={{ color: '#0E9F7E' }}>Bridge</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Connecting families, schools, and programs with trusted local transportation providers.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Customers</h4>
            <ul className="space-y-2">
              <li><Link href="/request" className="text-sm text-gray-500 hover:text-gray-900">Request transportation</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-900">How it works</Link></li>
              <li><Link href="/categories" className="text-sm text-gray-500 hover:text-gray-900">Transportation types</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Providers</h4>
            <ul className="space-y-2">
              <li><Link href="/providers" className="text-sm text-gray-500 hover:text-gray-900">Join as a provider</Link></li>
              <li><Link href="/providers#faq" className="text-sm text-gray-500 hover:text-gray-900">Provider FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RouteBridge. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600">Terms</Link>
            <Link href="/contact" className="text-xs text-gray-400 hover:text-gray-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
