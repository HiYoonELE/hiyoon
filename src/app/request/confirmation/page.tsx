import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  const ref = searchParams.ref || 'HY-XXXX'

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-start justify-center pt-20 px-4" style={{ background: '#F8FAFB' }}>
        <div className="max-w-md w-full">

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#E6F8F4' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14l6 6 10-12" stroke="#0E9F7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: '#0B1F3A' }}>
              Your request is in
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We'll match your route with local providers. Check your email — we sent you a personal link to track your offers in real time.
            </p>
          </div>

          <div className="text-center py-3 px-5 rounded-xl border mb-6 mx-auto inline-block w-full" style={{ background: '#E8F4FD', borderColor: '#B8D8F0' }}>
            <span className="text-xs text-gray-400 block mb-0.5">Your request reference</span>
            <span className="text-base font-semibold" style={{ color: '#1D6FA4' }}>{ref}</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: '#0B1F3A' }}>What happens next</h3>
            <div className="space-y-3">
              {[
                'Check your email — we sent you a personal offer page link.',
                'Matched providers submit quotes directly. You\'ll see them appear in real time on your offer page.',
                'Review all offers and select the provider that works best for your family.',
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

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
