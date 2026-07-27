import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    // 1. Create or find customer
    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        preferred_contact: body.preferred_contact || 'email',
      })
      .select()
      .single()

    if (custErr) throw custErr

    // 2. Create the transportation request
    const { data: request, error: reqErr } = await supabase
      .from('transportation_requests')
      .insert({
        customer_id: customer.id,
        category: body.category,
        pickup_address: body.pickup_address,
        dropoff_address: body.dropoff_address,
        passenger_count: body.passenger_count || 1,
        passenger_age_grade: body.passenger_age_grade || null,
        trip_type: body.trip_type || 'recurring',
        days_needed: body.days_needed || null,
        pickup_time: body.pickup_time || null,
        return_time: body.return_time || null,
        start_date: body.start_date || null,
        duration: body.duration || null,
        wheelchair_accessible: body.wheelchair_accessible || false,
        car_seat_needed: body.car_seat_needed || false,
        medical_monitoring: body.medical_monitoring || false,
        aide_needed: body.aide_needed || false,
        shared_ride_ok: body.shared_ride_ok ?? true,
        private_only: body.private_only || false,
        multilingual_driver: body.multilingual_driver || false,
        background_checked: body.background_checked || false,
        special_notes: body.special_notes || null,
        budget_range: body.budget_range || null,
        urgency: body.urgency || null,
        status: 'new',
      })
      .select()
      .single()

    if (reqErr) throw reqErr

    // 3. Send admin notification email (fire and forget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/notifications/new-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id, customerName: body.name }),
      })
    } catch {
      // Non-blocking - don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      reference_number: request.reference_number,
      id: request.id,
    })
  } catch (error: unknown) {
    console.error('Request submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Admin only - requires service role via middleware
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('transportation_requests')
      .select(`*, customer:customers(*)`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}
