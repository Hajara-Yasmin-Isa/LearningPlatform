import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { ollamaChat, OllamaUnavailableError, type ChatMessage } from '@/lib/ai/ollamaClient'
import {
    buildSystemPrompt,
    capReply,
    isOffTopic,
    leaksAnswer,
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
                    userAnswer: typeof context.userAnswer === 'string' ? context.userAnswer.slice(0, MAX_MESSAGE_CHARS) : undefined,
                }
            }
        }

        const raw = await ollamaChat(
            [{ role: 'system', content: buildSystemPrompt(grounding) }, ...messages],
            { num_predict: MAX_REPLY_TOKENS, temperature: 0.4 },
        )

        // guide-don't-reveal contract
        if (grounding.exercise && leaksAnswer(raw, grounding.exercise.correctAnswer)) {
            return NextResponse.json({ reply: HINT_FALLBACK })
        }

        return NextResponse.json({ reply: capReply(raw) })

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
