'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#0B1F3A' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8 2l6 6-6 6" stroke="#0E9F7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: '#0B1F3A' }}>
              Hi<span style={{ color: '#0E9F7E' }}>yoon</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/providers" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              For providers
            </Link>
            <Link href="/how-it-works" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              How it works
            </Link>
            <Link href="/request" className="ml-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors" style={{ background: '#0B1F3A' }}>
              Request transportation
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link href="/providers" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              For providers
            </Link>
            <Link href="/how-it-works" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              How it works
            </Link>
            <Link href="/request" className="block mx-0 mt-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg text-center" style={{ background: '#0B1F3A' }}>
              Request transportation
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
