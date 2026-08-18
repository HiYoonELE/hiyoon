import { NextRequest, NextResponse } from 'next/server'
import { sendLeadsToProviders } from '@/lib/sendLeadsToProviders'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { request_id, provider_ids } = body

    if (!request_id || !provider_ids?.length) {
      return NextResponse.json({ error: 'Missing request_id or provider_ids' }, { status: 400 })
    }

    const result = await sendLeadsToProviders({ requestId: request_id, providerIds: provider_ids })

    if ('error' in result) {
      const status = result.error === 'Email not configured' ? 500 : 404
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({ success: true, results: result.results, reopened: result.reopened })
  } catch (error: unknown) {
    console.error('Lead send error:', error)
    return NextResponse.json({ error: 'Failed to send leads' }, { status: 500 })
  }
}
