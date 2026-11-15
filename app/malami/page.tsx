import { notFound, redirect } from 'next/navigation'
import MalamiChat from '@/components/features/malami/MalamiChat'
import type { MalamiContext } from '@/components/features/malami/types'
import { MALAMI_ENABLED } from '@/lib/featureFlags'
import { createServerClient } from '@/lib/supabase/server'

type SearchParams = Record<string, string | string[] | undefined>

export default async function MalamiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Flag off: the page does not exist, so there is zero visible change.
  if (!MALAMI_ENABLED) notFound()

  // Auth gate: no anonymous chat (the route also enforces this).
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/malami')

  // Optional lesson context when entering from a lesson, e.g. /malami?lessonId=…
  const params = await searchParams
  const context = buildContext(params)

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <MalamiChat context={context} />
    </main>
  )
}

// Only a well-formed id is passed on. The route answers anything else with a 400, so a
// page that forwarded a mangled id from a copied link would show an error on every message,
// with a retry that can never succeed. Dropping the id keeps the chat usable, just without
// context.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function buildContext(params: SearchParams): MalamiContext | undefined {
  const id = (v: string | string[] | undefined) =>
    typeof v === 'string' && UUID.test(v) ? v : undefined

  const lessonId = id(params.lessonId)
  const exerciseId = id(params.exerciseId)

  if (!lessonId && !exerciseId) return undefined
  return { lessonId, exerciseId }
}
