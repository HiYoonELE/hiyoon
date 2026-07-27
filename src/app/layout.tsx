import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Route Bridge – Local Transportation Marketplace',
  description: 'Find trusted local transportation providers for school runs, senior trips, NEMT routes, and more. Submit your need once and get matched with qualified providers.',
  keywords: 'local transportation, school transportation, senior transportation, NEMT, van services, Boston',
  openGraph: {
    title: 'Route Bridge',
    description: 'Find local transportation providers for families, schools, and programs.',
    type: 'website',
  },
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
