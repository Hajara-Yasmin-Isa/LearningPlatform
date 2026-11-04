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

function buildContext(params: SearchParams): MalamiContext | undefined {
  const single = (v: string | string[] | undefined) =>
    typeof v === 'string' && v.length > 0 ? v : undefined

  const lessonId = single(params.lessonId)
  const exerciseId = single(params.exerciseId)
  // Only meaningful alongside an exercise — the route reads it inside that branch, and on
  // its own it is an unattached string. Carried through so a learner arriving from a failed
  // attempt gets a hint aimed at what they actually wrote.
  const userAnswer = exerciseId ? single(params.userAnswer) : undefined

  if (!lessonId && !exerciseId) return undefined
  return { lessonId, exerciseId, userAnswer }
}
