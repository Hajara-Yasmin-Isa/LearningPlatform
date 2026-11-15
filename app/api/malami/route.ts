import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { ollamaChatStream, OllamaUnavailableError, type ChatMessage } from '@/lib/ai/ollamaClient'
import { guardedStream, type Frame } from '@/lib/ai/streamGuard'
import {
    buildModelMessages,
    isOffTopic,
    MAX_HISTORY,
    MAX_MESSAGE_CHARS,
    MAX_REPLY_TOKENS,
    OFF_TOPIC_REDIRECT,
    type ExerciseGrounding,
    type Grounding,
} from '@/lib/ai/malamiPrompt'

// POST /api/malami
// body: { messages: ChatMessage[], context?: { lessonId?, exerciseId?, userAnswer? } }
// reply: every 200 is NDJSON, one frame per line (the frames are defined in
//        lib/ai/streamGuard.ts); anything that fails before the stream opens is an
//        ordinary non-200 with a JSON { error } body.
//
// One pipeline, multiple entry points: a plain chat is messages only;
// an exercise hint is the same call with context.exerciseId set.

// How long the host may let one call run. Without this line the platform's own default
// applies instead, and Vercel's has been as low as 10 s, which would cut a healthy reply
// off mid-stream. The Ollama client itself allows a streamed reply up to 180 s
// (STREAM_TIMEOUT_MS in lib/ai/ollamaClient.ts). A reply still generating when the host's
// limit hits ends without a `done` frame, which the chat page treats as the end of the
// reply, so the learner keeps what had arrived. Raise the two numbers together.
export const maxDuration = 60

interface MalamiContext {
    lessonId?: string
    exerciseId?: string
    userAnswer?: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const NDJSON_HEADERS = {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
}

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

        // topic boundary in code (prompt handles the rest). A canned reply that never reaches
        // the model still travels in the same frame format as a generated one, so the client
        // never has to guess which of two shapes it is parsing.
        const latest = messages[messages.length - 1].content
        if (isOffTopic(latest)) {
            return frameResponse([{ type: 'token', content: OFF_TOPIC_REDIRECT }, { type: 'done' }])
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
        return await streamReply(
            buildModelMessages(grounding, messages, context.userAnswer),
            grounding.exercise,
        )

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

// A fixed set of frames sent as one body, for replies that never reach the model.
function frameResponse(frames: Frame[]): Response {
    return new Response(frames.map((f) => JSON.stringify(f) + '\n').join(''), { headers: NDJSON_HEADERS })
}

// Wire format is NDJSON, one frame per line. lib/ai/streamGuard.ts owns the frames and the
// guide-don't-reveal enforcement; this function owns transport only: HTTP headers, client
// disconnects, and turning a thrown error into an in-band frame.
//
// The first frame is awaited before any status code is committed. The request to the model
// server is only made on that first read, so a server that is down still surfaces here as
// a thrown OllamaUnavailableError and becomes the ordinary 503 above, which the chat page
// shows as its "Malami is unavailable" notice with a retry. Once the stream is open the 200
// has already gone out, so anything that fails after that has to travel as an error frame.
// Waiting for the first frame costs nothing visible: the page shows a typing indicator
// until the first token arrives either way.
async function streamReply(messages: ChatMessage[], exercise?: ExerciseGrounding): Promise<Response> {
    const abort = new AbortController()
    const source = ollamaChatStream(messages, {
        num_predict: MAX_REPLY_TOKENS,
        temperature: 0.4,
        signal: abort.signal,
    })
    const frames = guardedStream(source, exercise?.correctAnswer, exercise?.question)
    const first = await frames.next()

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (frame: Frame) =>
                controller.enqueue(encoder.encode(JSON.stringify(frame) + '\n'))

            try {
                if (!first.done) send(first.value)
                for await (const frame of frames) send(frame)
            } catch (e) {
                // The learner left mid-reply: the stream is already closed and there is
                // nobody to tell.
                if (abort.signal.aborted) return
                if (e instanceof OllamaUnavailableError) {
                    console.warn('[api/malami] model server dropped mid-stream:', e.message)
                } else {
                    console.error('[api/malami] stream failed:', e)
                }
                send({
                    type: 'error',
                    message: e instanceof OllamaUnavailableError
                        ? 'Malami is unavailable right now. Please try again shortly.'
                        : 'Request failed',
                })
            } finally {
                if (!abort.signal.aborted) controller.close()
            }
        },

        // the learner navigated away or stopped the reply — abandon generation rather than
        // let the model keep producing into a connection nobody is reading
        cancel() {
            abort.abort()
        },
    })

    return new Response(stream, { headers: NDJSON_HEADERS })
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
