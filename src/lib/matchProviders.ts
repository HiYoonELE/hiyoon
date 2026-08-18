import { createAdminClient } from '@/lib/supabase/server'

interface MatchableProvider {
  id: string
  categories_served: string[] | null
  service_areas: string[] | null
}

interface MatchableRequest {
  category: string
  pickup_city?: string | null
  dropoff_city?: string | null
  pickup_zip?: string | null
  dropoff_zip?: string | null
}

// Finds approved providers whose categories_served includes the request's
// category and whose service_areas overlaps the pickup/dropoff city or zip.
export async function findMatchingProviderIds(request: MatchableRequest): Promise<string[]> {
  const supabase = createAdminClient()
  const { data: providers } = await supabase
    .from('providers')
    .select('id, categories_served, service_areas')
    .eq('approval_status', 'approved')

  const list = (providers || []) as MatchableProvider[]
  if (list.length === 0) return []

  const targets = [request.pickup_city, request.dropoff_city, request.pickup_zip, request.dropoff_zip]
    .filter((t): t is string => Boolean(t))
    .map((t) => t.trim().toLowerCase())

  if (targets.length === 0) return []

  return list
    .filter((p) => {
      const categories = p.categories_served || []
      if (!categories.includes(request.category)) return false

      const areas = (p.service_areas || []).map((a) => a.trim().toLowerCase())
      return areas.some((area) => targets.some((t) => t === area || t.includes(area) || area.includes(t)))
    })
    .map((p) => p.id)
}
