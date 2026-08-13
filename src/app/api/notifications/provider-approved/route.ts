import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { provider, docsComplete, resumeUrl } = body as {
      provider: Record<string, any>
      docsComplete?: boolean
      resumeUrl?: string | null
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'Email not configured' }, { status: 500 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'
    const docsLink = resumeUrl || null
    const missingDocs = !docsComplete

    const html = `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B1F3A; padding: 28px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0 0 4px; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
            Hi<span style="color: #0E9F7E;">yoon</span>
          </h1>
          <p style="color: rgba(255,255,255,0.55); margin: 0; font-size: 13px;">Provider network</p>
        </div>

        <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px 24px;">

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; background: #E6F8F4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 12px;">✓</div>
            <h2 style="color: #0B1F3A; font-size: 20px; font-weight: 600; margin: 0 0 6px;">You're approved!</h2>
            <p style="color: #6B7B8D; font-size: 14px; line-height: 1.6; margin: 0;">
              Hi ${provider.contact_person || provider.company_name}, your application to join the Hiyoon provider network has been reviewed and approved. Welcome aboard.
            </p>
          </div>

          ${missingDocs && docsLink ? `
          <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <p style="font-size: 13px; color: #92400E; margin: 0 0 10px; font-weight: 500;">
              ⚠️ Action required: Complete your documents
            </p>
            <p style="font-size: 13px; color: #92400E; margin: 0 0 12px; line-height: 1.5;">
              Your application is missing some required compliance documents. You will start receiving leads once all required documents are on file. Upload them using your secure link below.
            </p>
            <a href="${docsLink}" style="display: inline-block; background: #92400E; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;">
              Upload missing documents
            </a>
          </div>
          ` : ''}

          <div style="background: #F8FAFB; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #0E9F7E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 14px;">How leads work</h3>
            <div style="space-y: 12px;">
              <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #0B1F3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0E9F7E; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">1</div>
                <div>
                  <p style="font-size: 13px; color: #0B1F3A; font-weight: 500; margin: 0 0 2px;">You receive a lead email</p>
                  <p style="font-size: 12px; color: #6B7B8D; margin: 0;">When a customer request matches your area and vehicle type, you get an email with the full route details.</p>
                </div>
              </div>
              <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                <div style="width: 24px; height: 24px; background: #0B1F3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0E9F7E; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">2</div>
                <div>
                  <p style="font-size: 13px; color: #0B1F3A; font-weight: 500; margin: 0 0 2px;">Submit your quote</p>
                  <p style="font-size: 12px; color: #6B7B8D; margin: 0;">Click the link in the email to submit your price, vehicle type, and availability directly. No phone calls needed.</p>
                </div>
              </div>
              <div style="display: flex; gap: 12px;">
                <div style="width: 24px; height: 24px; background: #0B1F3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0E9F7E; font-size: 12px; font-weight: 600; line-height: 24px; text-align: center;">3</div>
                <div>
                  <p style="font-size: 13px; color: #0B1F3A; font-weight: 500; margin: 0 0 2px;">Get confirmed</p>
                  <p style="font-size: 12px; color: #6B7B8D; margin: 0;">If the customer selects your quote, you receive a confirmation email with their contact information to finalize the route.</p>
                </div>
              </div>
            </div>
          </div>

          <div style="background: #F8FAFB; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;">
            <h3 style="color: #0E9F7E; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;">Your profile</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 6px 0; font-size: 12px; color: #6B7B8D; width: 40%;">Company</td>
                <td style="padding: 6px 0; font-size: 12px; color: #0B1F3A; font-weight: 500;">${provider.company_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 6px 0; font-size: 12px; color: #6B7B8D;">Service areas</td>
                <td style="padding: 6px 0; font-size: 12px; color: #0B1F3A;">${Array.isArray(provider.service_areas) ? provider.service_areas.join(', ') : provider.service_areas || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 12px; color: #6B7B8D;">Documents</td>
                <td style="padding: 6px 0; font-size: 12px; color: ${docsComplete ? '#0E9F7E' : '#D97706'}; font-weight: 500;">
                  ${docsComplete ? '✓ Complete' : '⚠️ Action required'}
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7B8D; font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
            Questions about how the platform works? Check out our <a href="${siteUrl}/providers/faq" style="color: #0E9F7E; text-decoration: none;">Provider FAQ</a> or reply to this email and we will get back to you within one business day.
          </p>

          <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">
            Hiyoon &mdash; hello@hiyoon.com &mdash; hiyoon.com
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
        to: [provider.email],
        reply_to: process.env.ADMIN_EMAIL,
        subject: `You're approved — welcome to the Hiyoon provider network`,
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
    console.error('Provider approval email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
