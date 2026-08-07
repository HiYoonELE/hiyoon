import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { request, quote, customer, provider } = body

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })

    const price = quote.quoted_price
      ? `$${quote.quoted_price.toLocaleString()}/${quote.quoted_price_period || 'month'}`
      : 'As quoted'

    const customerHtml = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 4px; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Hi<span style="color: #0E9F7E;">yoon</span></h1>
          <p style="color: rgba(255,255,255,0.55); margin: 0; font-size: 13px;">You're all set</p>
        </div>
        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; background: #E6F8F4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 12px;">✓</div>
            <h2 style="color: #0B1F3A; font-size: 20px; font-weight: 600; margin: 0 0 6px;">Provider confirmed!</h2>
            <p style="color: #6B7B8D; font-size: 14px; margin: 0;">Hi ${customer.name}, you've selected your transportation provider. They'll reach out shortly to confirm route details and your start date.</p>
          </div>

          <div style="background: #E6F8F4; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #0E9F7E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px;">Your provider</h3>
            <div style="font-size: 16px; font-weight: 600; color: #0B1F3A; margin-bottom: 4px;">${provider.company_name}</div>
            ${provider.phone ? `<div style="font-size: 13px; color: #6B7B8D; margin-bottom: 2px;">📞 ${provider.phone}</div>` : ''}
            ${provider.email ? `<div style="font-size: 13px; color: #6B7B8D; margin-bottom: 2px;">✉️ ${provider.email}</div>` : ''}
            ${provider.website ? `<div style="font-size: 13px; color: #6B7B8D;">🌐 ${provider.website}</div>` : ''}
          </div>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Reference</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 600;">${request.reference_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Route</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} &rarr; ${request.dropoff_address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Monthly rate</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0E9F7E; font-weight: 600;">${price}</td>
              </tr>
            </table>
          </div>

          <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">
            Questions? Reply to this email and we'll help. — Hiyoon Team
          </p>
        </div>
      </div>
    `

    const providerHtml = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 4px; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Hi<span style="color: #0E9F7E;">yoon</span></h1>
          <p style="color: rgba(255,255,255,0.55); margin: 0; font-size: 13px;">You've been selected</p>
        </div>
        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px;">
          <h2 style="color: #0B1F3A; font-size: 20px; font-weight: 600; margin: 0 0 8px;">🎉 Your quote was accepted</h2>
          <p style="color: #6B7B8D; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${provider.contact_person || provider.company_name}, a customer has selected your quote. Please reach out to them as soon as possible to confirm route details and get started.
          </p>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <h3 style="color: #0E9F7E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px;">Request details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D; width: 40%;">Reference</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A; font-weight: 600;">${request.reference_number}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Route</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.pickup_address} &rarr; ${request.dropoff_address}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Schedule</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${request.trip_type} &middot; ${request.days_needed || 'TBD'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Your quoted rate</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0E9F7E; font-weight: 600;">${price}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #6B7B8D;">Customer name</td>
                <td style="padding: 8px 0; font-size: 13px; color: #0B1F3A;">${customer.name}</td>
              </tr>
            </table>
          </div>

          <div style="background: #E6F8F4; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #065F46; margin: 0; font-weight: 500;">
              Next step: Reach out to the customer to confirm route details, discuss start date, and finalize the arrangement.
            </p>
          </div>

          <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">
            Hiyoon &mdash; ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    `

    await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hiyoon <hello@hiyoon.com>',
          to: [customer.email],
          reply_to: process.env.ADMIN_EMAIL,
          subject: `You're confirmed — ${provider.company_name} will be in touch soon`,
          html: customerHtml,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hiyoon <hello@hiyoon.com>',
          to: [provider.email],
          reply_to: process.env.ADMIN_EMAIL,
          subject: `Your quote was accepted — ${request.reference_number}`,
          html: providerHtml,
        }),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Booking confirmation email error:', error)
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 })
  }
}
