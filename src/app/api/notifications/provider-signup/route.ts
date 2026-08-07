import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { provider } = body

    const adminEmail = process.env.ADMIN_EMAIL
    const resendKey = process.env.RESEND_API_KEY

    if (!adminEmail || !resendKey) {
      console.error('Missing ADMIN_EMAIL or RESEND_API_KEY')
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const categoriesServed = Array.isArray(provider.categories_served)
      ? provider.categories_served.join(', ')
      : provider.categories_served || 'Not specified'

    const vehicleTypes = Array.isArray(provider.vehicle_types)
      ? provider.vehicle_types.join(', ')
      : provider.vehicle_types || 'Not specified'

    const serviceAreas = Array.isArray(provider.service_areas)
      ? provider.service_areas.join(', ')
      : provider.service_areas || 'Not specified'

    const capabilities = [
      provider.wheelchair_accessible && 'Wheelchair accessible',
      provider.car_seats_available && 'Car seats available',
      provider.recurring_routes && 'Recurring routes',
      provider.one_time_trips && 'One-time trips',
      provider.background_checked && 'Background-checked drivers',
      provider.licensed_insured && 'Licensed & insured',
    ].filter(Boolean).join(', ') || 'None specified'

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">New Provider Application</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon Admin — action required</p>
        </div>

        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Company</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${provider.company_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Contact</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${provider.contact_person}${provider.title ? `, ${provider.title}` : ''}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Email</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${provider.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Phone</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${provider.phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Service areas</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${serviceAreas}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Categories</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${categoriesServed}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Vehicles</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${vehicleTypes}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Fleet size</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${provider.vehicle_count || 'Not specified'} vehicles, max ${provider.max_passenger_capacity || '?'} passengers</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Capabilities</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${capabilities}</td>
            </tr>
            ${provider.description ? `
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; vertical-align: top;">Description</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${provider.description}</td>
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
        subject: `New provider application: ${provider.company_name}`,
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
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
