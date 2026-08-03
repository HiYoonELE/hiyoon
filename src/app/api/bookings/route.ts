import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const monthly = body.monthly_price ? parseFloat(body.monthly_price) : null
    const months = body.duration_months ? parseInt(body.duration_months) : null
    const annual = monthly ? monthly * 12 : null
    const total = monthly && months ? monthly * months : null

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        request_id: body.request_id,
        provider_id: body.provider_id,
        lead_match_id: body.lead_match_id || null,
        monthly_price: monthly,
        price_period: body.price_period || 'monthly',
        duration_months: months,
        annual_value: annual,
        total_contract_value: total,
        pickup_city: body.pickup_city || null,
        pickup_zip: body.pickup_zip || null,
        dropoff_city: body.dropoff_city || null,
        dropoff_zip: body.dropoff_zip || null,
        is_private: body.is_private || false,
        passenger_count: body.passenger_count || null,
        category: body.category || null,
        service_start_date: body.service_start_date || null,
        service_end_date: body.service_end_date || null,
        status: 'active',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    // Update the request status to booked and record financial data
    await supabase
      .from('transportation_requests')
      .update({
        status: 'booked',
        booked_price: monthly,
        booked_price_period: body.price_period || 'monthly',
        contract_value_monthly: monthly,
        contract_value_annual: annual,
        duration_months: months,
        winning_provider_id: body.provider_id,
        booked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.request_id)

    // Update lead match to booked
    if (body.lead_match_id) {
      await supabase
        .from('lead_matches')
        .update({ status: 'booked', response_type: 'booked' })
        .eq('id', body.lead_match_id)
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error: unknown) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, provider:providers(company_name, email, phone), request:transportation_requests(reference_number, category, pickup_address, dropoff_address, customer:customers(name, email))')
      .order('booked_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
