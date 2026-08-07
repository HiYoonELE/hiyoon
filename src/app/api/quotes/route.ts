import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - fetch lead match details by quote token (for the provider quote form)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: match, error } = await supabase
      .from('lead_matches')
      .select(`
        *,
        provider:providers(company_name, contact_person, email),
        request:transportation_requests(
          reference_number, category, pickup_address, dropoff_address,
          passenger_count, passenger_age_grade, trip_type, days_needed,
          pickup_time, return_time, start_date, duration,
          car_seat_needed, wheelchair_accessible, private_only,
          shared_ride_ok, special_notes, budget_range, offer_token,
          offers_close_at, status
        )
      `)
      .eq('quote_token', token)
      .single()

    if (error || !match) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    // Check if offers are still open
    const request = match.request as Record<string, unknown>
    if (request.offers_close_at && new Date(request.offers_close_at as string) < new Date()) {
      return NextResponse.json({ error: 'This request is no longer accepting quotes' }, { status: 410 })
    }

    if (request.status === 'booked') {
      return NextResponse.json({ error: 'This request has already been filled' }, { status: 410 })
    }

    return NextResponse.json({ data: match })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json({ error: 'Failed to load quote form' }, { status: 500 })
  }
}

// POST - provider submits a quote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, price, price_period, vehicle_type, available_start, notes, is_private } = body

    if (!token || !price) {
      return NextResponse.json({ error: 'Token and price are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the lead match
    const { data: match, error: matchErr } = await supabase
      .from('lead_matches')
      .select('*, request:transportation_requests(reference_number, offer_token, status, offers_close_at, pickup_address, dropoff_address, category, customer:customers(name, email)), provider:providers(company_name, contact_person, email, website, phone)')
      .eq('quote_token', token)
      .single()

    if (matchErr || !match) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
    }

    const request = match.request as Record<string, unknown>

    // Check if still open
    if (request.status === 'booked') {
      return NextResponse.json({ error: 'This request has already been filled' }, { status: 410 })
    }

    // Update the lead match with quote details
    const { error: updateErr } = await supabase
      .from('lead_matches')
      .update({
        quoted_price: parseFloat(price),
        quoted_price_period: price_period || 'monthly',
        quote_vehicle_type: vehicle_type || null,
        quote_available_start: available_start || null,
        quote_notes: notes || null,
        quote_is_private: is_private || false,
        quote_submitted_at: new Date().toISOString(),
        response_type: 'quoted',
        response_at: new Date().toISOString(),
        status: 'quoted',
      })
      .eq('quote_token', token)

    if (updateErr) throw updateErr

    // Notify admin
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
      await fetch(`${siteUrl}/api/notifications/quote-received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match, price, price_period, vehicle_type, notes }),
      })
    } catch (e) {
      console.error('Failed to notify admin of quote:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote submission error:', error)
    return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 })
  }
}
