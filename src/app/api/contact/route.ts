import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.ADMIN_EMAIL

    if (!resendKey || !adminEmail) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600;">New Contact Form Message</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon — hiyoon.com/contact</p>
        </div>
        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; width: 30%;">From</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A; font-weight: 500;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Email</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${email}</td>
            </tr>
            ${subject ? `
            <tr style="border-bottom: 1px solid #F1F5F9;">
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D;">Subject</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A;">${subject}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #6B7B8D; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; font-size: 13px; color: #0B1F3A; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          <div style="text-align: center;">
            <a href="mailto:${email}?subject=Re: ${subject || 'Your Hiyoon message'}"
              style="display: inline-block; background: #0B1F3A; color: #fff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">
              Reply to ${name}
            </a>
          </div>
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
        to: [adminEmail],
        reply_to: email,
        subject: `Contact form: ${subject || 'New message'} — from ${name}`,
        html,
      }),
    })

    if (!res.ok) throw new Error('Failed to send email')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
