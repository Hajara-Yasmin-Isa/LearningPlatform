// Streamed chat against Cloudflare Workers AI (the production host chosen in
// docs/proposals/003-free-ai-hosting.md). Server-side only.
//
//   CLOUDFLARE_ACCOUNT_ID  32-character account id from the Workers AI dashboard page
//   CLOUDFLARE_API_TOKEN   a "Workers AI" API token (Read + Edit). Never commit it, never log it.
//   CLOUDFLARE_MODEL       optional; defaults to Llama 4 Scout, the provisional pick (B1.4)
//
// Cloudflare runs the open-weight model on its own hardware, so there is no server of ours
// to keep alive. Its privacy terms: inputs and outputs are not stored and not used for
// training. Our own transcripts live in Supabase (B2.3), not here.
//
// The free plan gives 10,000 Neurons a day and then refuses calls until 00:00 UTC. That
// arrives here as a non-2xx response and becomes a ModelUnavailableError like any other
// outage, so the learner sees the "Malami is unavailable" notice, never a broken page.

import type { ChatMessage, ChatOptions } from './ollamaClient'
import { ModelUnavailableError } from './modelErrors'

export const DEFAULT_CLOUDFLARE_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct'

// Vercel cuts the route at maxDuration (60 s), so waiting longer than that is pointless.
const STREAM_TIMEOUT_MS = 60_000

function config() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
    const token = process.env.CLOUDFLARE_API_TOKEN?.trim()
    if (!accountId || !token) {
        throw new ModelUnavailableError(
            'Cloudflare is not configured: set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN',
        )
    }
    const model = process.env.CLOUDFLARE_MODEL?.trim() || DEFAULT_CLOUDFLARE_MODEL
    // Overridable so tests can point at a fake server; never set in production.
    const base = process.env.CLOUDFLARE_API_BASE?.trim() || 'https://api.cloudflare.com/client/v4'
    return { url: `${base}/accounts/${accountId}/ai/run/${model}`, token, model }
}

// Cloudflare's error body is { errors: [{ code, message }] }. Only that message is kept:
// the request (and so the token) never goes into an error or a log line.
async function describeFailure(res: Response): Promise<string> {
    const text = await res.text().catch(() => '')
    try {
        const body = JSON.parse(text) as { errors?: { code?: number; message?: string }[] }
        const first = body.errors?.[0]
        if (first?.message) return `Cloudflare responded ${res.status}: ${first.message}${first.code ? ` (code ${first.code})` : ''}`
    } catch {
        // not JSON; fall through
    }
    return `Cloudflare responded ${res.status}`
}

// One parsed server-sent event. Workers AI streams `{ "response": "..." }`; some models use
// the OpenAI shape `{ "choices": [{ "delta": { "content": "..." } }] }`. Both are accepted.
function fragmentOf(event: unknown): string {
    if (!event || typeof event !== 'object') return ''
    const e = event as { response?: unknown; choices?: { delta?: { content?: unknown } }[] }
    if (typeof e.response === 'string') return e.response
    const delta = e.choices?.[0]?.delta?.content
    return typeof delta === 'string' ? delta : ''
}

// Same contract as ollamaChatStream: yields content fragments as they arrive, throws a
// ModelUnavailableError for any failure, and cancels the upstream request when the caller
// stops reading or aborts `signal`.
export async function* cloudflareChatStream(
    messages: ChatMessage[],
    options: ChatOptions & { signal?: AbortSignal } = {},
): AsyncGenerator<string> {
    const { url, token } = config()
    const { signal, num_predict, temperature } = options

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                stream: true,
                ...(num_predict !== undefined ? { max_tokens: num_predict } : {}),
                ...(temperature !== undefined ? { temperature } : {}),
            }),
            signal: signal ?? AbortSignal.timeout(STREAM_TIMEOUT_MS),
        })
    } catch (e) {
        throw new ModelUnavailableError(`Could not reach Cloudflare: ${(e as Error).message}`)
    }

    if (!res.ok) throw new ModelUnavailableError(await describeFailure(res))
    if (!res.body) throw new ModelUnavailableError('Cloudflare returned no response body')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
        while (true) {
            let chunk: ReadableStreamReadResult<Uint8Array>
            try {
                chunk = await reader.read()
            } catch (e) {
                throw new ModelUnavailableError(`Stream from Cloudflare ended early: ${(e as Error).message}`)
            }
            if (chunk.done) break

            buffer += decoder.decode(chunk.value, { stream: true })
            // Server-sent events: one `data: ...` line per event. Network chunks do not align
            // with line breaks, so a partial trailing line waits for the next read.
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed.startsWith('data:')) continue
                const payload = trimmed.slice(5).trim()
                if (payload === '[DONE]') return

                let event: unknown
                try {
                    event = JSON.parse(payload)
                } catch {
                    continue // a malformed event should not kill a stream that is otherwise fine
                }
                const fragment = fragmentOf(event)
                if (fragment) yield fragment
            }
        }
    } finally {
        await reader.cancel().catch(() => {})
    }
}
