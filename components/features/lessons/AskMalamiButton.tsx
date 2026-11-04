'use client'

import Link from 'next/link'
import { MALAMI_ENABLED } from '@/lib/featureFlags'

// The second door into the Malami pipeline: a learner who just got an exercise wrong hands
// that exact moment over, rather than retrying blind. Rendered beside retry, and only after
// a failed attempt — never before the learner has tried.

// The answer rides in the query string, which keeps the Malami page's existing searchParams
// contract and needs no shared client state. URLs are not unbounded though, and a code
// answer can be long, so it is trimmed here. A truncated answer still tells Malami what the
// learner was attempting, which is all the grounding needs.
const MAX_ANSWER_IN_URL = 600

interface AskMalamiButtonProps {
    exerciseId: string
    userAnswer: string
}

export default function AskMalamiButton({ exerciseId, userAnswer }: AskMalamiButtonProps) {
    // Flag off means the Malami page 404s, so the affordance must not exist either.
    if (!MALAMI_ENABLED) return null

    const params = new URLSearchParams({ exerciseId })
    const trimmed = userAnswer.trim()
    if (trimmed) params.set('userAnswer', trimmed.slice(0, MAX_ANSWER_IN_URL))

    return (
        <Link
            href={`/malami?${params.toString()}`}
            className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-5 py-2 text-blue-800 transition-colors hover:bg-blue-100"
        >
            {/* TODO: copy — Hausa wording from the team lead */}
            Tambayi Malami
        </Link>
    )
}
