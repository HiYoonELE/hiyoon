import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Hiyoon – School Transportation Marketplace',
  description: 'Find trusted local transportation providers for school runs, daycare pickup, and more. Submit your need once and get matched with qualified providers across Massachusetts.',
  keywords: 'school transportation, daycare transportation, student transportation, Boston, Massachusetts, van services, school pickup',
  openGraph: {
    title: 'Hiyoon',
    description: 'School transportation, made simple. Find local providers for your child\'s route.',
    type: 'website',
    url: 'https://hiyoon.com',
  },
  metadataBase: new URL('https://hiyoon.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
