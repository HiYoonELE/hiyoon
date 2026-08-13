export async function sendResumeLinkEmail({
  provider,
  missingDocs,
  resumeUrl,
}: {
  provider: { company_name: string; contact_person?: string; email: string }
  missingDocs: string[]
  resumeUrl: string
}): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('Missing RESEND_API_KEY')
    return false
  }

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600;">Application received</h1>
        <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon — ${provider.company_name}</p>
      </div>
      <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        <p style="font-size: 14px; color: #0B1F3A; margin: 0 0 14px;">
          Thanks for applying, ${provider.contact_person || 'there'}! We're missing a few compliance documents before we can approve your account:
        </p>
        <p style="font-size: 14px; color: #0B1F3A; font-weight: 600; margin: 0 0 20px;">
          ${missingDocs.join(', ')}
        </p>
        <p style="font-size: 13px; color: #6B7B8D; margin: 0 0 20px;">
          No rush — use the link below whenever you have them ready. We won't review your application until we've received everything.
        </p>
        <div style="text-align: center;">
          <a href="${resumeUrl}" style="display: inline-block; background: #0E9F7E; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Finish my application
          </a>
        </div>
      </div>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Hiyoon <alerts@hiyoon.com>',
        to: [provider.email],
        subject: 'Finish your Hiyoon provider application',
        html,
      }),
    })

    if (!res.ok) {
      console.error('Failed to send provider resume-link email:', await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('Failed to send provider resume-link email:', err)
    return false
  }
}
