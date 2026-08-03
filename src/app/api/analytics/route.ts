import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    const [geoRes, perfRes, leadRes, bookRes] = await Promise.all([
      supabase.from('geographic_intelligence').select('*'),
      supabase.from('provider_performance').select('*').order('total_bookings', { ascending: false }),
      supabase.from('lead_history').select('*').limit(200),
      supabase.from('bookings').select('*, provider:providers(company_name), request:transportation_requests(reference_number, category, pickup_city, dropoff_city, customer:customers(name))').order('booked_at', { ascending: false }),
    ])

    const geoData = geoRes.data || []
    const totalRequests = geoData.reduce((sum, r) => sum + (r.total_requests || 0), 0)
    const totalBooked = geoData.reduce((sum, r) => sum + (r.total_booked || 0), 0)
    const allSpend = geoData.filter((r) => r.avg_monthly_spend).map((r) => r.avg_monthly_spend)
    const statewideAvgSpend = allSpend.length > 0
      ? allSpend.reduce((a: number, b: number) => a + b, 0) / allSpend.length
      : 0
    const statewideBookingRate = totalRequests > 0 ? (totalBooked / totalRequests) * 100 : 0

    return NextResponse.json({
      geographic: geoData,
      provider_performance: perfRes.data || [],
      lead_history: leadRes.data || [],
      bookings: bookRes.data || [],
      summary: {
        total_requests: totalRequests,
        total_booked: totalBooked,
        statewide_booking_rate: Math.round(statewideBookingRate * 10) / 10,
        statewide_avg_monthly_spend: Math.round(statewideAvgSpend * 100) / 100,
        total_annual_value: geoData.reduce((sum, r) => sum + (r.total_annual_value || 0), 0),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
