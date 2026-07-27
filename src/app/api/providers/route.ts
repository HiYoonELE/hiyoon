import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

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
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: provider.id })
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
