import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { missingRequiredDocs } from '@/lib/providerDocs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body = JSON.parse(formData.get('data') as string)
    const supabase = createAdminClient()

    const submittedDocIds: string[] = []
    const attachments: { filename: string; content: string }[] = []
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('doc_') && value instanceof File) {
        const docId = key.slice('doc_'.length)
        submittedDocIds.push(docId)
        const buffer = Buffer.from(await value.arrayBuffer())
        attachments.push({ filename: value.name, content: buffer.toString('base64') })
      }
    }

    // Parse service areas into array
    const serviceAreasArray = body.service_areas
      ? body.service_areas.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    const { data: provider, error } = await supabase
      .from('providers')
      .insert({
        company_name: body.company_name,
        contact_person: body.contact_person,
        title: body.title || null,
        phone: body.phone,
        email: body.email,
        website: body.website || null,
        description: body.description || null,
        service_areas: serviceAreasArray,
        categories_served: body.categories_served || [],
        vehicle_types: body.vehicle_types || [],
        wheelchair_accessible: body.wheelchair_accessible || false,
        car_seats_available: body.car_seats_available || false,
        recurring_routes: body.recurring_routes || false,
        one_time_trips: body.one_time_trips || false,
        background_checked: body.background_checked || false,
        licensed_insured: body.licensed_insured || false,
        vehicle_count: body.vehicle_count ? parseInt(body.vehicle_count) : null,
        max_passenger_capacity: body.max_passenger_capacity ? parseInt(body.max_passenger_capacity) : null,
        insurance_notes: body.insurance_notes || null,
        approval_status: 'pending',
        submitted_documents: submittedDocIds,
      })
      .select()
      .single()

    if (error) throw error

    const missing = missingRequiredDocs(submittedDocIds)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'

    // Notify admin of the new application. Awaited (not fire-and-forgotten)
    // because Vercel serverless functions can freeze right after the
    // response is returned, which silently drops unawaited fetches.
    const notifyResult = await Promise.allSettled([
      fetch(`${siteUrl}/api/notifications/provider-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          attachments,
          missingDocs: missing.map((d) => d.label),
          resumeUrl: missing.length > 0 ? `${siteUrl}/providers/complete/${provider.application_token}` : null,
        }),
      }),
    ])
    if (notifyResult[0].status === 'rejected') {
      console.error('Provider signup notification failed:', notifyResult[0].reason)
    }

    return NextResponse.json({
      success: true,
      id: provider.id,
      application_token: provider.application_token,
      docs_complete: missing.length === 0,
    })
  } catch (error: unknown) {
    console.error('Provider signup error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}
