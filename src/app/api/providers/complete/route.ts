import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { missingRequiredDocs } from '@/lib/providerDocs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const supabase = createAdminClient()
    const { data: provider, error } = await supabase
      .from('providers')
      .select('company_name, approval_status, submitted_documents')
      .eq('application_token', token)
      .single()

    if (error || !provider) return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 })

    return NextResponse.json({ data: provider })
  } catch {
    return NextResponse.json({ error: 'Failed to load application.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const supabase = createAdminClient()
    const { data: provider, error: fetchErr } = await supabase
      .from('providers')
      .select('id, company_name, contact_person, email, submitted_documents')
      .eq('application_token', token)
      .single()

    if (fetchErr || !provider) return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 })

    const newDocIds: string[] = []
    const attachments: { filename: string; content: string }[] = []
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('doc_') && value instanceof File) {
        const docId = key.slice('doc_'.length)
        newDocIds.push(docId)
        const buffer = Buffer.from(await value.arrayBuffer())
        attachments.push({ filename: value.name, content: buffer.toString('base64') })
      }
    }

    if (newDocIds.length === 0) {
      return NextResponse.json({ error: 'Please upload at least one document.' }, { status: 400 })
    }

    const submittedDocuments = Array.from(new Set([...(provider.submitted_documents || []), ...newDocIds]))

    const { error: updateErr } = await supabase
      .from('providers')
      .update({ submitted_documents: submittedDocuments, updated_at: new Date().toISOString() })
      .eq('id', provider.id)

    if (updateErr) throw updateErr

    const missing = missingRequiredDocs(submittedDocuments)
    const adminEmail = process.env.ADMIN_EMAIL
    const resendKey = process.env.RESEND_API_KEY

    if (adminEmail && resendKey) {
      const html = `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0B1F3A; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600;">Provider Documents Received</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 13px;">Hiyoon Admin — ${provider.company_name}</p>
          </div>
          <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
            <p style="font-size: 13px; color: #0B1F3A; margin: 0 0 14px;">
              ${provider.company_name} uploaded ${newDocIds.length} document${newDocIds.length !== 1 ? 's' : ''} to their application.
            </p>
            ${missing.length > 0 ? `
            <div style="background: #FEF3C7; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
              <p style="font-size: 13px; color: #92400E; margin: 0;"><strong>Still missing:</strong> ${missing.map((d) => d.label).join(', ')}</p>
            </div>
            ` : `
            <div style="background: #E6F8F4; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
              <p style="font-size: 13px; color: #065F46; margin: 0;">All required documents have now been received. Ready for review.</p>
            </div>
            `}
            <div style="text-align: center; margin-top: 10px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://hiyoon.com'}/admin/dashboard" style="display: inline-block; background: #0B1F3A; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                Review in Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      `
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Hiyoon <alerts@hiyoon.com>',
          to: [adminEmail],
          subject: `Documents received: ${provider.company_name}`,
          html,
          attachments,
        }),
      })
      if (!res.ok) console.error('Failed to send documents-received email:', await res.text())
    }

    return NextResponse.json({ success: true, submitted_documents: submittedDocuments, docs_complete: missing.length === 0 })
  } catch (error) {
    console.error('Provider document completion error:', error)
    return NextResponse.json({ error: 'Failed to submit documents. Please try again.' }, { status: 500 })
  }
}
