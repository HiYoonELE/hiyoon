import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('providers')
      .update({
        approval_status: body.approval_status,
        admin_notes: body.admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    const [{ count: quoteCount }, { count: leadCount }, { count: bookingCount }] = await Promise.all([
      supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('provider_id', params.id),
      supabase.from('lead_matches').select('id', { count: 'exact', head: true }).eq('provider_id', params.id),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('provider_id', params.id),
    ])

    if ((quoteCount || 0) > 0 || (leadCount || 0) > 0 || (bookingCount || 0) > 0) {
      return NextResponse.json(
        { error: 'This provider has leads, quotes, or a booking attached. Remove those first.' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('providers').delete().eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}
