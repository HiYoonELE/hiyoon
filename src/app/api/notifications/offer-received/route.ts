import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, request, provider, price, price_period, vehicle_type } = body

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('Missing RESEND_API_KEY')
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
    const offerPageUrl = `${siteUrl}/offers/${request.offer_token}`

    const periodLabel = price_period === 'weekly' ? 'week' : price_period === 'per_trip' ? 'trip' : 'month'
    const formattedPrice = price != null ? `$${parseFloat(price).toLocaleString()}/${periodLabel}` : null

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 4px; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
            Hi<span style="color: #0E9F7E;">yoon</span>
          </h1>
          <p style="color: rgba(255,255,255,0.55); margin: 0; font-size: 13px;">School transportation marketplace</p>
        </div>

        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px;">
          <h2 style="color: #0B1F3A; font-size: 18px; font-weight: 600; margin: 0 0 8px;">
            You have a new offer
          </h2>
          <p style="color: #6B7B8D; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${customer.name}, ${provider.company_name} just submitted a quote for your transportation request. Review it and your other offers on your personal offer page.
          </p>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Reference number</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 600;">${request.reference_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Provider</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${provider.company_name}</td>
              </tr>
              ${formattedPrice ? `
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Quoted price</td>
                <td style="padding: 8px 0; font-size: 14px; color: #0E9F7E; font-weight: 600;">${formattedPrice}</td>
              </tr>
              ` : ''}
              ${vehicle_type ? `
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Vehicle</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${vehicle_type}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <p style="color: #6B7B8D; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
            Compare this against any other offers on your offer page, then select the provider that works best for your family.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${offerPageUrl}" style="display: inline-block; background: #0E9F7E; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
              View My Offers
            </a>
          </div>

          <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 16px 0 0;">
            Bookmark this link — it's your personal offer page.<br/>
            Questions? Reply to this email and we'll help.
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
        from: 'Hiyoon <hello@hiyoon.com>',
        to: [customer.email],
        reply_to: process.env.ADMIN_EMAIL,
        subject: `New offer from ${provider.company_name} — ${request.reference_number}`,
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
    console.error('Offer received email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
