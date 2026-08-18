import { createAdminClient } from '@/lib/supabase/server'

export async function sendLeadsToProviders({
  requestId,
  providerIds,
}: {
  requestId: string
  providerIds: string[]
}): Promise<
  | { results: { provider_id: string; company: string; success: boolean }[]; reopened: boolean }
  | { error: string }
> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return { error: 'Email not configured' }
  }

  const supabase = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'

  // Fetch the request
  const { data: request, error: reqErr } = await supabase
    .from('transportation_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (reqErr || !request) {
    return { error: 'Request not found' }
  }

  // If the offer window already closed, sending leads again reopens it —
  // otherwise newly-contacted providers would hit a "no longer accepting
  // quotes" error before they could even submit.
  const windowExpired = !!request.offers_close_at && new Date(request.offers_close_at) < new Date()
  const hoursOpen = request.urgency === 'ASAP' ? 24 : 48
  const newOffersCloseAt = windowExpired
    ? new Date(Date.now() + hoursOpen * 60 * 60 * 1000).toISOString()
    : request.offers_close_at

  // Fetch providers
  const { data: providers, error: provErr } = await supabase
    .from('providers')
    .select('*')
    .in('id', providerIds)
    .eq('approval_status', 'approved')

  if (provErr || !providers?.length) {
    return { error: 'No approved providers found' }
  }

  const requirements = [
    request.wheelchair_accessible && 'Wheelchair accessible',
    request.car_seat_needed && 'Car seat / booster',
    request.medical_monitoring && 'Medical monitoring',
    request.aide_needed && 'Aide or attendant',
    request.private_only && 'Private vehicle only',
    request.background_checked && 'Background-checked driver',
    request.multilingual_driver && 'Multilingual driver',
  ].filter(Boolean).join(', ') || 'None'

  const results: { provider_id: string; company: string; success: boolean }[] = []

  for (const provider of providers) {
    // Create or update lead match and get the quote token
    const { data: match, error: matchErr } = await supabase
      .from('lead_matches')
      .upsert({
        request_id: requestId,
        provider_id: provider.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      }, { onConflict: 'request_id,provider_id' })
      .select()
      .single()

    if (matchErr || !match) {
      results.push({ provider_id: provider.id, company: provider.company_name, success: false })
      continue
    }

    // Build the quote submission link for this provider
    const quoteLink = `${siteUrl}/quote/${match.id}?token=${match.quote_token}`

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">New Transportation Lead</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 14px;">Hiyoon — matched for ${provider.company_name}</p>
        </div>

        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <p style="font-size: 15px; color: #0B1F3A; margin: 0 0 20px;">
            Hi ${provider.contact_person}, a new transportation request has been matched to your service area.
          </p>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h3 style="font-size: 12px; color: #0E9F7E; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Category</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${request.category}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Route</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} → ${request.dropoff_address}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Passengers</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.passenger_count}${request.passenger_age_grade ? ` (${request.passenger_age_grade})` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Schedule</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.trip_type} — ${request.days_needed || 'TBD'}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">School arrival</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_time || 'Flexible'}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Afternoon pickup</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.return_time || 'Morning only'}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Start date</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.start_date || 'ASAP'}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Budget</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.budget_range || 'Not specified'}</td></tr>
              <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Requirements</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${requirements}</td></tr>
              ${request.special_notes ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; vertical-align: top;">Notes</td><td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.special_notes}</td></tr>` : ''}
            </table>
          </div>

          <div style="background: #E6F8F4; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #065F46; margin: 0;">
              <strong>Offer window:</strong> The customer is collecting quotes for the next ${request.urgency === 'ASAP' ? '24' : '48'} hours. Submit your quote before it closes to be considered.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${quoteLink}" style="display: inline-block; background: #0E9F7E; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
              Submit Your Quote
            </a>
          </div>

          <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 16px;">
            Reference: ${request.reference_number} — Hiyoon
          </p>
        </div>
      </div>
    `

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Hiyoon <leads@hiyoon.com>',
        to: [provider.email],
        reply_to: process.env.ADMIN_EMAIL,
        subject: `New transportation lead: ${request.category} — ${request.pickup_address}`,
        html,
      }),
    })

    results.push({ provider_id: provider.id, company: provider.company_name, success: emailRes.ok })
  }

  // Update request status (and reopen the offer window if it had closed)
  await supabase
    .from('transportation_requests')
    .update({
      status: 'sent_to_providers',
      offers_close_at: newOffersCloseAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  return { results, reopened: windowExpired }
}
