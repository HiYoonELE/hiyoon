import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, request } = body

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('Missing RESEND_API_KEY')
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
    const offerPageUrl = `${siteUrl}/offers/${request.offer_token}`

    const isAsap = request.urgency === 'ASAP'
    const hours = isAsap ? 24 : 48
    const deadline = new Date(Date.now() + hours * 60 * 60 * 1000)
    const deadlineStr = deadline.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })

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
            Your request has been received
          </h2>
          <p style="color: #6B7B8D; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${customer.name}, we received your transportation request and are matching it with local providers in your area. Quotes will appear on your personal offer page as they come in.
          </p>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Reference number</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 600;">${request.reference_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Route</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} &rarr; ${request.dropoff_address}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Category</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.category}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Schedule</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.trip_type} &middot; ${request.days_needed || 'TBD'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Offers close</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${deadlineStr}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7B8D; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
            As providers respond, their quotes will appear on your personal offer page below. Check back anytime — new offers update in real time.
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
        subject: `Your request is in — ${request.reference_number}`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Customer confirmation email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
