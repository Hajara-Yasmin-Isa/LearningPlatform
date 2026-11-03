import type { MalamiContext } from './types'

// Shows the learner what Malami has been told they are studying. The route
// fetches the real lesson/exercise content server-side from these ids; the
// chip only reflects that an id was passed.
export default function ContextChip({ context }: { context: MalamiContext }) {
  // TODO: copy — lead to decide the wording (and whether to show the lesson title)
  const label = context.exerciseId
    ? 'Helping with your exercise'
    : context.lessonId
      ? 'Helping with your lesson'
      : null

  if (!label) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
      {label}
    </span>
  )
}
