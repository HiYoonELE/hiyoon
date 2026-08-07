import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET - fetch all quotes for a request by offer token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the request by offer token
    const { data: request, error: reqErr } = await supabase
      .from('transportation_requests')
      .select('*, customer:customers(name, email)')
      .eq('offer_token', token)
      .single()

    if (reqErr || !request) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
    }

    // Get all submitted quotes for this request
    const { data: quotes, error: quotesErr } = await supabase
      .from('lead_matches')
      .select('*, provider:providers(company_name, website, phone, email, description, vehicle_types)')
      .eq('request_id', request.id)
      .eq('status', 'quoted')
      .order('quote_submitted_at', { ascending: true })

    if (quotesErr) throw quotesErr

    // Check if offers are still open
    const isOpen = !request.offers_close_at || new Date(request.offers_close_at) > new Date()
    const isBooked = request.status === 'booked'

    return NextResponse.json({
      request: {
        id: request.id,
        reference_number: request.reference_number,
        category: request.category,
        pickup_address: request.pickup_address,
        dropoff_address: request.dropoff_address,
        passenger_count: request.passenger_count,
        trip_type: request.trip_type,
        days_needed: request.days_needed,
        pickup_time: request.pickup_time,
        return_time: request.return_time,
        start_date: request.start_date,
        offers_close_at: request.offers_close_at,
        status: request.status,
        selected_quote_id: request.selected_quote_id,
      },
      quotes: quotes || [],
      is_open: isOpen,
      is_booked: isBooked,
    })
  } catch (error) {
    console.error('Offers fetch error:', error)
    return NextResponse.json({ error: 'Failed to load offers' }, { status: 500 })
  }
}

// POST - customer selects a quote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, quote_id } = body

    if (!token || !quote_id) {
      return NextResponse.json({ error: 'Missing token or quote' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the request
    const { data: request, error: reqErr } = await supabase
      .from('transportation_requests')
      .select('*, customer:customers(name, email)')
      .eq('offer_token', token)
      .single()

    if (reqErr || !request) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
    }

    if (request.status === 'booked') {
      return NextResponse.json({ error: 'You have already selected a provider' }, { status: 410 })
    }

    // Get the selected quote with provider info
    const { data: quote, error: quoteErr } = await supabase
      .from('lead_matches')
      .select('*, provider:providers(company_name, contact_person, phone, email, website, description)')
      .eq('id', quote_id)
      .eq('request_id', request.id)
      .single()

    if (quoteErr || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Mark request as booked with selected quote
    await supabase
      .from('transportation_requests')
      .update({
        status: 'booked',
        selected_quote_id: quote_id,
        winning_provider_id: quote.provider_id,
        booked_price: quote.quoted_price,
        booked_price_period: quote.quoted_price_period,
        contract_value_monthly: quote.quoted_price,
        contract_value_annual: quote.quoted_price ? quote.quoted_price * 12 : null,
        booked_at: new Date().toISOString(),
        customer_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    // Update the winning lead match
    await supabase
      .from('lead_matches')
      .update({ status: 'booked', response_type: 'booked' })
      .eq('id', quote_id)

    // Create a booking record
    await supabase.from('bookings').insert({
      request_id: request.id,
      provider_id: quote.provider_id,
      lead_match_id: quote_id,
      monthly_price: quote.quoted_price,
      price_period: quote.quoted_price_period || 'monthly',
      annual_value: quote.quoted_price ? quote.quoted_price * 12 : null,
      pickup_city: request.pickup_city,
      pickup_zip: request.pickup_zip,
      dropoff_city: request.dropoff_city,
      dropoff_zip: request.dropoff_zip,
      is_private: quote.quote_is_private || false,
      passenger_count: request.passenger_count,
      category: request.category,
      service_start_date: quote.quote_available_start,
      status: 'active',
    })

    // Send confirmation emails (non-blocking)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
    const customer = request.customer as Record<string, string>
    const provider = quote.provider as Record<string, string>

    fetch(`${siteUrl}/api/notifications/booking-confirmed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, quote, customer, provider }),
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      provider: {
        company_name: provider.company_name,
        phone: provider.phone,
        email: provider.email,
        website: provider.website,
      },
    })
  } catch (error) {
    console.error('Quote selection error:', error)
    return NextResponse.json({ error: 'Failed to select provider' }, { status: 500 })
  }
}
