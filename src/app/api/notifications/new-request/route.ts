import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, request, matchedProviders } = body

    const adminEmail = process.env.ADMIN_EMAIL
    const resendKey = process.env.RESEND_API_KEY

    if (!adminEmail || !resendKey) {
      console.error('Missing ADMIN_EMAIL or RESEND_API_KEY')
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'

    const requirements = [
      request.wheelchair_accessible && 'Wheelchair accessible',
      request.car_seat_needed && 'Car seat / booster',
      request.medical_monitoring && 'Medical monitoring',
      request.aide_needed && 'Aide or attendant',
      request.private_only && 'Private vehicle only',
      request.background_checked && 'Background-checked driver',
      request.multilingual_driver && 'Multilingual driver',
    ].filter(Boolean).join(', ') || 'None'

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">New Transportation Request</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon Admin — ${request.reference_number}</p>
        </div>

        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          ${matchedProviders > 0 ? `
          <div style="background: #E6F8F4; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #065F46; margin: 0;">
              Automatically sent to ${matchedProviders} matching provider${matchedProviders !== 1 ? 's' : ''}.
            </p>
          </div>
          ` : `
          <div style="background: #FEF3C7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #92400E; margin: 0;">
              No approved providers matched this category/area automatically. Send leads manually from the dashboard.
            </p>
          </div>
          `}
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Customer</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${customer.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Email</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${customer.email}</td>
            </tr>
            ${customer.phone ? `
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Phone</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${customer.phone}</td>
            </tr>
            ` : ''}
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Category</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.category}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Route</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} → ${request.dropoff_address}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Passengers</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.passenger_count}${request.passenger_age_grade ? ` (${request.passenger_age_grade})` : ''}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Schedule</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.trip_type} — ${request.days_needed || 'TBD'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Budget</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.budget_range || 'Not specified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Urgency</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.urgency || 'Not specified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Requirements</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${requirements}</td>
            </tr>
            ${request.special_notes ? `
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; vertical-align: top;">Notes</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.special_notes}</td>
            </tr>
            ` : ''}
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${siteUrl}/admin/dashboard" style="display: inline-block; background: #0B1F3A; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Review in Admin Dashboard
            </a>
          </div>

          <p style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 20px;">
            Hiyoon Admin Alerts &mdash; ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hiyoon <alerts@hiyoon.com>',
        to: [adminEmail],
        subject: `New request: ${request.category} — ${request.reference_number}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('New request notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
