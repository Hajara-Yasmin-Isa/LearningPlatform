// Demo + measurement script for B2.2 — streams replies from the Malami pipeline and
// reports time-to-first-token against time-to-full-reply.
//
//   npx tsx scripts/malami-stream-demo.ts
//
// TTFT is the number the streaming work is for: total generation time is unchanged by
// streaming, so the case for it rests on how soon the learner sees something.
//
// Run against the same host the app uses:
//   OLLAMA_BASE_URL=http://localhost:11434 OLLAMA_MODEL=llama3.2:3b npx tsx scripts/malami-stream-demo.ts

import { ollamaChatStream, OllamaUnavailableError, type ChatMessage } from '../lib/ai/ollamaClient'
import { buildSystemPrompt, MAX_REPLY_TOKENS, type Grounding } from '../lib/ai/malamiPrompt'

const PROMPTS: { label: string; grounding: Grounding; messages: ChatMessage[] }[] = [
    {
        label: 'plain chat',
        grounding: {},
        messages: [{ role: 'user', content: 'What is a loop in programming?' }],
    },
    {
        label: 'hint mode',
        grounding: {
            exercise: {
                question: 'Write a function called add that returns the sum of two numbers.',
                exerciseType: 'code',
                options: null,
                correctAnswer: 'function add(a, b) { return a + b; }',
                functionName: 'add',
                testCases: [{ input: [2, 3], expected: 5 }],
                userAnswer: 'function add(a, b) { return a - b; }',
            },
        },
        messages: [{ role: 'user', content: 'My function is not passing. What am I doing wrong?' }],
    },
]

interface Measurement {
    label: string
    ttftMs: number
    totalMs: number
    chars: number
    fragments: number
}

async function measure(
    label: string,
    grounding: Grounding,
    messages: ChatMessage[],
): Promise<Measurement> {
    const started = Date.now()
    let ttftMs = -1
    let text = ''
    let fragments = 0

    const stream = ollamaChatStream(
        [{ role: 'system', content: buildSystemPrompt(grounding) }, ...messages],
        { num_predict: MAX_REPLY_TOKENS, temperature: 0.4 },
    )

    for await (const fragment of stream) {
        if (ttftMs < 0) ttftMs = Date.now() - started
        text += fragment
        fragments++
        process.stdout.write(fragment)
    }

    return { label, ttftMs, totalMs: Date.now() - started, chars: text.length, fragments }
}

async function main() {
    console.log(`host:  ${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}`)
    console.log(`model: ${process.env.OLLAMA_MODEL ?? 'llama3.2 (client default)'}\n`)

    const results: Measurement[] = []

    for (const { label, grounding, messages } of PROMPTS) {
        console.log(`${'='.repeat(60)}\n${label.toUpperCase()}\n${'='.repeat(60)}`)
        console.log(`> ${messages[messages.length - 1].content}\n`)
        results.push(await measure(label, grounding, messages))
        console.log('\n')
    }

    console.log('='.repeat(60))
    console.log('TTFT vs TIME-TO-FULL')
    console.log('='.repeat(60))
    console.log('case            TTFT      full      saved     chars  fragments')
    for (const r of results) {
        const saved = `${Math.round((1 - r.ttftMs / r.totalMs) * 100)}%`
        console.log(
            `${r.label.padEnd(15)} ${(r.ttftMs + 'ms').padEnd(9)} ${(r.totalMs + 'ms').padEnd(9)} ` +
            `${saved.padEnd(9)} ${String(r.chars).padEnd(6)} ${r.fragments}`,
        )
    }
    console.log('\n"saved" = how much of the wait the learner no longer stares at a blank screen for.')
}

main().catch((e) => {
    if (e instanceof OllamaUnavailableError) {
        console.error(`\nModel server unreachable: ${e.message}`)
        console.error('Is Ollama running? Check OLLAMA_BASE_URL and OLLAMA_MODEL.')
        process.exit(1)
    }
    throw e
})
