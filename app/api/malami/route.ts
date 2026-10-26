import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { ollamaChatStream, OllamaUnavailableError, type ChatMessage } from '@/lib/ai/ollamaClient'
import { guardedStream, type Frame } from '@/lib/ai/streamGuard'
import {
    buildSystemPrompt,
    isOffTopic,
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

interface MalamiContext {
    lessonId?: string
    exerciseId?: string
    userAnswer?: string
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

        const body = await request.json()
        const context: MalamiContext = body.context ?? {}
        const messages = sanitizeMessages(body.messages)

        if (!messages) {
            return NextResponse.json({ error: 'messages must be a non-empty array ending with a user turn' }, { status: 400 })
        }

        // topic boundary in code (prompt handles the rest); exercise/lesson context counts as on topic
        const latest = messages[messages.length - 1].content
        const onTopicAlready = messages.length > 1 || !!context.exerciseId || !!context.lessonId
        if (isOffTopic(latest, onTopicAlready)) {
            return frameResponse([{ type: 'token', value: OFF_TOPIC_REDIRECT }, { type: 'done' }])
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
                    userAnswer: typeof context.userAnswer === 'string' ? context.userAnswer.slice(0, MAX_MESSAGE_CHARS) : undefined,
                }
            }
        }

        return streamReply(
            [{ role: 'system', content: buildSystemPrompt(grounding) }, ...messages],
            grounding.exercise?.correctAnswer,
        )

    } catch (e) {
        if (e instanceof OllamaUnavailableError) {
            return NextResponse.json(
                { error: 'Malami is unavailable right now. Please try again shortly.' }, { status: 503 }
            )
        }
        return NextResponse.json(
            { error: 'Request failed' }, { status: 500 }
        )
    }
}

// Everything that can fail cleanly — auth, rate limit, validation, grounding — runs before
// the first byte is sent and still returns ordinary JSON status codes. Once the stream is
// open the status is already 200, so a failure after that has to travel in-band as an
// error frame.
//
// A canned reply that never reaches the model still has to arrive in the same frame format
// as a generated one. Any 200 from this route is NDJSON frames; a client should never have
// to guess which of two shapes it is parsing. Failures before the stream opens are the
// exception, and those are non-200 with a JSON { error } body.
function frameResponse(frames: Frame[]): Response {
    return new Response(frames.map((f) => JSON.stringify(f) + '\n').join(''), {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    })
}

// Wire format is NDJSON, one frame per line — see lib/ai/streamGuard.ts for the frames and
// for the guide-don't-reveal enforcement. This function owns transport only: HTTP headers,
// client disconnects, and turning a thrown error into an in-band frame.
function streamReply(messages: ChatMessage[], correctAnswer?: string): Response {
    const encoder = new TextEncoder()
    const abort = new AbortController()

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (frame: Frame) =>
                controller.enqueue(encoder.encode(JSON.stringify(frame) + '\n'))

            const source = ollamaChatStream(messages, {
                num_predict: MAX_REPLY_TOKENS,
                temperature: 0.4,
                signal: abort.signal,
            })

            try {
                for await (const frame of guardedStream(source, correctAnswer)) {
                    send(frame)
                }
            } catch (e) {
                send({
                    type: 'error',
                    message: e instanceof OllamaUnavailableError
                        ? 'Malami is unavailable right now. Please try again shortly.'
                        : 'Request failed',
                })
            } finally {
                controller.close()
            }
        },

        // the learner navigated away or stopped the reply — abandon generation rather than
        // let the model keep producing into a connection nobody is reading
        cancel() {
            abort.abort()
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        },
    })
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
