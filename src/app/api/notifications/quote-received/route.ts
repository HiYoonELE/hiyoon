import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { match, price, price_period, vehicle_type, notes } = body

    const resendKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL
    if (!resendKey || !adminEmail) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })

    const provider = match.provider as Record<string, string>
    const request = match.request as Record<string, string>
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600;">New Quote Received</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon Admin</p>
        </div>
        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Provider</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${provider.company_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Request</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.reference_number}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Route</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} → ${request.dropoff_address}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Quoted price</td>
              <td style="padding: 10px 0; font-size: 14px; color: #0E9F7E; font-weight: 600;">$${parseFloat(price).toLocaleString()}/${price_period || 'month'}</td>
            </tr>
            ${vehicle_type ? `<tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Vehicle</td><td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${vehicle_type}</td></tr>` : ''}
            ${notes ? `<tr><td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; vertical-align: top;">Notes</td><td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${notes}</td></tr>` : ''}
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${siteUrl}/admin/dashboard" style="display: inline-block; background: #0B1F3A; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">View in Dashboard</a>
          </div>
        </div>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Hiyoon <alerts@hiyoon.com>',
        to: [adminEmail],
        subject: `New quote from ${provider.company_name} — ${request.reference_number}`,
        html,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
