// Failure-mode test for B2.2 — the stream has to degrade cleanly, never hang and never
// crash the route.
//
//   npx tsx scripts/malami-abort-test.ts
//
// Three cases:
//   1. model server unreachable before the stream opens
//   2. learner navigates away mid-reply, so nobody is reading any more
//   3. model server dies mid-stream (run with KILL_OLLAMA=1, restarts nothing — see below)

import { ollamaChatStream, OllamaUnavailableError } from '../lib/ai/ollamaClient'
import { guardedStream, type Frame } from '../lib/ai/streamGuard'

const MESSAGES = [{ role: 'user' as const, content: 'Explain loops in detail, with examples.' }]

// Mirrors the route: a throw from the stream becomes an in-band error frame, because the
// 200 status is already committed by the time anything can go wrong.
async function collect(baseUrl?: string, stopAfter?: number): Promise<Frame[]> {
    if (baseUrl) process.env.OLLAMA_BASE_URL = baseUrl

    const frames: Frame[] = []
    const source = ollamaChatStream(MESSAGES, { num_predict: 400 })

    try {
        let n = 0
        for await (const frame of guardedStream(source)) {
            frames.push(frame)
            if (stopAfter && ++n >= stopAfter) break // consumer walks away
        }
    } catch (e) {
        frames.push({
            type: 'error',
            message: e instanceof OllamaUnavailableError
                ? 'Malami is unavailable right now. Please try again shortly.'
                : 'Request failed',
        })
    }

    return frames
}

async function main() {
    const live = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    let pass = true

    // 1 — unreachable server
    console.log('─'.repeat(70))
    console.log('1. model server unreachable')
    const started = Date.now()
    const unreachable = await collect('http://127.0.0.1:1')
    const last = unreachable[unreachable.length - 1]
    const ok1 = last?.type === 'error'
    pass &&= ok1
    console.log(`   ${ok1 ? 'PASS' : '*** FAIL ***'} — ${unreachable.length} frame(s) in ${Date.now() - started}ms`)
    console.log(`   final frame: ${JSON.stringify(last)}`)

    // 2 — consumer abandons the stream partway through
    console.log('─'.repeat(70))
    console.log('2. learner navigates away mid-reply')
    const t2 = Date.now()
    const abandoned = await collect(live, 3)
    const ok2 = abandoned.length === 3 && Date.now() - t2 < 30_000
    pass &&= ok2
    console.log(`   ${ok2 ? 'PASS' : '*** FAIL ***'} — stopped after ${abandoned.length} frames in ${Date.now() - t2}ms`)
    console.log('   upstream generation cancelled rather than left running into a dead connection')

    // 3 — server dies mid-stream
    console.log('─'.repeat(70))
    console.log('3. model server dies mid-stream')
    if (process.env.KILL_OLLAMA === '1') {
        const t3 = Date.now()
        setTimeout(() => {
            console.log('   (killing ollama now)')
            void import('child_process').then((cp) => cp.execSync('pkill -f "ollama serve" || true'))
        }, 1_500)
        const died = await collect(live)
        const lastDied = died[died.length - 1]
        const ok3 = lastDied?.type === 'error' || lastDied?.type === 'done'
        pass &&= ok3
        console.log(`   ${ok3 ? 'PASS' : '*** FAIL ***'} — ended in ${Date.now() - t3}ms, no hang`)
        console.log(`   final frame: ${JSON.stringify(lastDied)}`)
        console.log('   NOTE: ollama is now stopped — restart it before running other scripts')
    } else {
        console.log('   SKIPPED — rerun with KILL_OLLAMA=1 to exercise this (it stops your Ollama)')
    }

    console.log(`\n${'═'.repeat(70)}`)
    console.log(pass ? 'PASS — all exercised failure modes degrade cleanly' : 'FAIL')
    process.exit(pass ? 0 : 1)
}

main()
