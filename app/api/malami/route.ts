import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { ollamaChat, OllamaUnavailableError, type ChatMessage } from '@/lib/ai/ollamaClient'
import {
    buildModelMessages,
    capReply,
    isOffTopic,
    leaksAnswer,
    EMPTY_REPLY_FALLBACK,
    HINT_FALLBACK,
    MAX_HISTORY,
    MAX_MESSAGE_CHARS,
    MAX_REPLY_TOKENS,
    OFF_TOPIC_REDIRECT,
    type Grounding,
} from '@/lib/ai/malamiPrompt'

// POST /api/malami
// body: { messages: ChatMessage[], context?: { lessonId?, exerciseId?, userAnswer? } }
// reply: { reply: string }
//
// One pipeline, multiple entry points: a plain chat is messages only;
// an exercise hint is the same call with context.exerciseId set.

// How long the host may let one call run. The Ollama client waits up to 60 s for a reply
// (TIMEOUT_MS in lib/ai/ollamaClient.ts); without this line the platform's own default
// applies instead, and Vercel's has been as low as 10 s. A slow but healthy model would
// then surface as a gateway timeout, not as our clean 503. Keep the two numbers together.
export const maxDuration = 60

interface MalamiContext {
    lessonId?: string
    exerciseId?: string
    userAnswer?: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!rateLimit(`malami:${user.id}`, 20, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
        }

        // A body that is not JSON, or not an object, is the caller's mistake, so it gets a
        // 400 that says so. Left to the catch block below it would become a 500, which
        // tells the caller nothing and wakes up whoever watches the error logs for no reason.
        let body: { messages?: unknown; context?: unknown }
        try {
            body = await request.json()
        } catch {
            return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
        }
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Body must be a JSON object' }, { status: 400 })
        }

        const context = parseContext(body.context)
        if (!context) {
            return NextResponse.json({ error: 'context.lessonId and context.exerciseId must be UUIDs' }, { status: 400 })
        }

        const messages = sanitizeMessages(body.messages)
        if (!messages) {
            return NextResponse.json({ error: 'messages must be a non-empty array ending with a user turn' }, { status: 400 })
        }

        // topic boundary in code (prompt handles the rest)
        const latest = messages[messages.length - 1].content
        if (isOffTopic(latest)) {
            return NextResponse.json({ reply: OFF_TOPIC_REDIRECT })
        }

        // grounding: fetched server-side, never trusted from the client
        const grounding: Grounding = {}

        if (context.lessonId) {
            const { data: lesson } = await supabase
                .from('lessons')
                .select('title, sections(title, content, section_order)')
                .eq('id', context.lessonId)
                .order('section_order', { referencedTable: 'sections', ascending: true })
                .single()
            if (lesson) grounding.lesson = { title: lesson.title, sections: lesson.sections }
        }

        if (context.exerciseId) {
            const { data: exercise } = await supabase
                .from('exercises')
                .select('question, exercise_type, options, correct_answer, function_name, test_cases')
                .eq('id', context.exerciseId)
                .single()
            if (exercise) {
                grounding.exercise = {
                    question: exercise.question,
                    exerciseType: exercise.exercise_type,
                    options: exercise.options,
                    correctAnswer: exercise.correct_answer,
                    functionName: exercise.function_name,
                    testCases: exercise.test_cases,
                }
            }
        }

        // The learner's answer is passed separately so it lands in their own turn, not in
        // the system prompt. See buildModelMessages() for why that matters.
        const raw = await ollamaChat(
            buildModelMessages(grounding, messages, context.userAnswer),
            { num_predict: MAX_REPLY_TOKENS, temperature: 0.4 },
        )

        if (raw.trim() === '') {
            return NextResponse.json({ reply: EMPTY_REPLY_FALLBACK })
        }

        // guide-don't-reveal contract. The question is passed too, so an answer the learner
        // can already read in the question is not treated as a leak when the model restates it.
        if (grounding.exercise && leaksAnswer(raw, grounding.exercise.correctAnswer, grounding.exercise.question)) {
            return NextResponse.json({ reply: HINT_FALLBACK })
        }

        return NextResponse.json({ reply: capReply(raw) })

    } catch (e) {
        if (e instanceof OllamaUnavailableError) {
            // Expected failure mode (model server down or slow): worth a line in the log so
            // an outage is visible, but not an error-level one.
            console.warn('[api/malami] model server unavailable:', e.message)
            return NextResponse.json(
                { error: 'Malami is unavailable right now. Please try again shortly.' }, { status: 503 }
            )
        }
        // Everything else is a bug or an infrastructure fault. The client gets a generic
        // message on purpose (no internals leak), so the log line is the only place the
        // real cause is recorded. A silent 500 is the hardest kind to debug in production.
        console.error('[api/malami] request failed:', e)
        return NextResponse.json(
            { error: 'Request failed' }, { status: 500 }
        )
    }
}

// Accepts a missing context, or an object whose ids (if present) look like UUIDs.
// Returns null for anything else. Without this check a non-UUID id makes Postgres reject
// the query, Supabase returns an error instead of a row, and the grounding is silently
// skipped: the learner gets a plain chat reply and nobody learns why hint mode "didn't work".
function parseContext(input: unknown): MalamiContext | null {
    if (input === undefined || input === null) return {}
    if (typeof input !== 'object') return null

    const { lessonId, exerciseId, userAnswer } = input as Record<string, unknown>
    const id = (value: unknown): string | null | undefined => {
        if (value === undefined || value === null || value === '') return undefined
        return typeof value === 'string' && UUID.test(value) ? value : null
    }

    const lesson = id(lessonId)
    const exercise = id(exerciseId)
    if (lesson === null || exercise === null) return null

    return {
        lessonId: lesson,
        exerciseId: exercise,
        userAnswer: typeof userAnswer === 'string' ? userAnswer.slice(0, MAX_MESSAGE_CHARS) : undefined,
    }
}

// Keeps only well-formed user/assistant turns, trims each to MAX_MESSAGE_CHARS,
// and keeps the last MAX_HISTORY. Returns null if there's nothing usable.
function sanitizeMessages(input: unknown): ChatMessage[] | null {
    if (!Array.isArray(input)) return null

    const messages = input
        .filter((m): m is ChatMessage =>
            m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== ''
        )
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
        .slice(-MAX_HISTORY)

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') return null
    return messages
}
