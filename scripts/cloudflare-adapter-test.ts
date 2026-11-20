// Model-free test of the Cloudflare adapter against a fake Workers AI server.
//
//   npx tsx scripts/cloudflare-adapter-test.ts
//
// Needs no account and no network. Checks the parts that are easy to get subtly wrong:
// server-sent events split across network chunks, both response shapes, error messages
// that never contain the token, the free-plan daily limit, cancellation, and the provider
// switch. For a real call, set the Cloudflare values in .env.local and run
// `AI_PROVIDER=cloudflare npx tsx scripts/malami-leak-test.ts`.

import http from 'http'
import { chatStream, currentProvider, ModelUnavailableError } from '../lib/ai/modelClient'

const TOKEN = 'test-token-must-never-appear-in-errors'
const WORDS = ['Sannu ', 'da ', 'zuwa! ', 'Bari ', 'mu ', 'koyi ', 'madauki.']

type Mode = 'workers' | 'openai' | 'daily-limit' | 'slow'
let mode: Mode = 'workers'
let lastBody: Record<string, unknown> = {}
let lastAuth = ''
let closedEarly = false

const server = http.createServer((req, res) => {
    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', () => {
        lastBody = JSON.parse(raw || '{}')
        lastAuth = req.headers.authorization ?? ''

        if (mode === 'daily-limit') {
            res.writeHead(429, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, errors: [{ code: 4006, message: 'you have used up your daily free allocation of 10,000 neurons' }] }))
            return
        }

        res.writeHead(200, { 'Content-Type': 'text/event-stream' })
        const events = WORDS.map((w) => (mode === 'openai' ? { choices: [{ delta: { content: w } }] } : { response: w }))
        // Deliberately split the stream at awkward byte boundaries.
        const wire = events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n'
        let i = 0
        const step = mode === 'slow' ? 4 : 7
        const timer = setInterval(() => {
            if (i >= wire.length) { clearInterval(timer); res.end(); return }
            res.write(wire.slice(i, i + step)); i += step
        }, mode === 'slow' ? 30 : 2)
        // The response closing before the wire is written means the client hung up.
        res.on('close', () => { if (i < wire.length) { closedEarly = true; clearInterval(timer) } })
    })
})

async function collect(signal?: AbortSignal): Promise<string> {
    let text = ''
    for await (const f of chatStream([{ role: 'user', content: 'hi' }], { num_predict: 50, temperature: 0.4, signal })) text += f
    return text
}

async function expectUnavailable(): Promise<string> {
    try { await collect(); return 'NO ERROR' } catch (e) {
        return e instanceof ModelUnavailableError ? (e as Error).message : `wrong error type: ${(e as Error).name}`
    }
}

async function main() {
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
    const port = (server.address() as { port: number }).port
    let pass = true
    const check = (ok: boolean, label: string) => { console.log(`${ok ? 'PASS' : '*** FAIL ***'}  ${label}`); pass &&= ok }

    delete process.env.AI_PROVIDER
    check(currentProvider() === 'ollama', 'provider defaults to ollama when AI_PROVIDER is unset')

    process.env.AI_PROVIDER = 'cloudflare'
    delete process.env.CLOUDFLARE_ACCOUNT_ID
    delete process.env.CLOUDFLARE_API_TOKEN
    const notConfigured = await expectUnavailable()
    check(notConfigured.includes('not configured'), `missing values → clean unavailable error ("${notConfigured}")`)

    process.env.CLOUDFLARE_ACCOUNT_ID = 'abc123'
    process.env.CLOUDFLARE_API_TOKEN = TOKEN
    process.env.CLOUDFLARE_API_BASE = `http://127.0.0.1:${port}`

    mode = 'workers'
    const text = await collect()
    check(text === WORDS.join(''), `Workers AI event shape, chunks split mid-line → "${text}"`)
    check(lastAuth === `Bearer ${TOKEN}`, 'token sent as a bearer header')
    check(lastBody.stream === true && lastBody.max_tokens === 50 && lastBody.temperature === 0.4, 'stream, max_tokens and temperature sent')

    mode = 'openai'
    check((await collect()) === WORDS.join(''), 'OpenAI delta shape also parsed')

    mode = 'daily-limit'
    const limit = await expectUnavailable()
    check(limit.includes('429') && limit.includes('4006'), `free-plan daily limit → unavailable error ("${limit}")`)
    check(!limit.includes(TOKEN), 'error message does not contain the token')

    mode = 'slow'
    const abort = new AbortController()
    setTimeout(() => abort.abort(), 120)
    let threw = false
    try { await collect(abort.signal) } catch (e) { threw = e instanceof ModelUnavailableError }
    await new Promise((r) => setTimeout(r, 100))
    check(threw && closedEarly, 'abort mid-reply → stream stops and upstream request is closed')

    process.env.CLOUDFLARE_API_BASE = 'http://127.0.0.1:1'
    mode = 'workers'
    const down = await expectUnavailable()
    check(down.startsWith('Could not reach Cloudflare'), `unreachable host → unavailable error`)

    server.close()
    console.log(pass ? '\nALL PASS' : '\nFAILURES')
    process.exit(pass ? 0 : 1)
}

main()
