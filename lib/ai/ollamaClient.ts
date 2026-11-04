// Thin typed client for Ollama's /api/chat endpoint.
// Server-side only. Host is a config change: OLLAMA_BASE_URL (dev / VM / prod).

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
    role: ChatRole
    content: string
}

export interface ChatOptions {
    model?: string
    // max tokens to generate — Ollama's name for it
    num_predict?: number
    temperature?: number
}

// Thrown for anything that means "the model server didn't give us a reply":
// connection refused, timeout, non-2xx. The route maps this to a 503.
export class OllamaUnavailableError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'OllamaUnavailableError'
    }
}

// B1.2 owns the model choice — swap the default when it lands
const DEFAULT_MODEL = 'llama3.2'
const TIMEOUT_MS = 60_000

// read per call so a config change doesn't need a restart
const baseUrl = () => process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'

export async function ollamaChat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const { model = process.env.OLLAMA_MODEL ?? DEFAULT_MODEL, ...modelOptions } = options
    const BASE_URL = baseUrl()

    let res: Response
    try {
        res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream: false, options: modelOptions }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        })
    } catch (e) {
        throw new OllamaUnavailableError(`Could not reach Ollama at ${BASE_URL}: ${(e as Error).message}`)
    }

    if (!res.ok) {
        throw new OllamaUnavailableError(`Ollama responded ${res.status}`)
    }

    const data = await res.json()
    return data.message?.content ?? ''
}

// Streamed generation. Capped more generously than the one-shot call: 400 tokens on a
// CPU-only VM can run well past a minute, and killing a stream that is actively producing
// tokens is worse than letting it finish.
const STREAM_TIMEOUT_MS = 180_000

// Yields content fragments as the model produces them. Ollama replies with NDJSON — one
// JSON object per line — but network chunks do not align with line breaks, so a partial
// trailing line is carried over to the next read.
//
// Passing `signal` replaces the default timeout, so the caller owns cancellation when it
// provides one. Abandoning the generator cancels the upstream request, which stops Ollama
// generating rather than leaving it to finish into a dropped connection.
export async function* ollamaChatStream(
    messages: ChatMessage[],
    options: ChatOptions & { signal?: AbortSignal } = {},
): AsyncGenerator<string> {
    const { model = process.env.OLLAMA_MODEL ?? DEFAULT_MODEL, signal, ...modelOptions } = options
    const BASE_URL = baseUrl()

    let res: Response
    try {
        res = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages, stream: true, options: modelOptions }),
            signal: signal ?? AbortSignal.timeout(STREAM_TIMEOUT_MS),
        })
    } catch (e) {
        throw new OllamaUnavailableError(`Could not reach Ollama at ${BASE_URL}: ${(e as Error).message}`)
    }

    if (!res.ok) {
        throw new OllamaUnavailableError(`Ollama responded ${res.status}`)
    }
    if (!res.body) {
        throw new OllamaUnavailableError('Ollama returned no response body')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
        while (true) {
            // A server that dies mid-stream fails here rather than at the fetch above, so
            // it needs mapping too — otherwise a dropped connection surfaces as a generic
            // failure and the learner is told the wrong thing.
            let chunk: ReadableStreamReadResult<Uint8Array>
            try {
                chunk = await reader.read()
            } catch (e) {
                throw new OllamaUnavailableError(`Stream from ${BASE_URL} ended early: ${(e as Error).message}`)
            }

            const { done, value } = chunk
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue

                let parsed: { message?: { content?: string }; done?: boolean; error?: string }
                try {
                    parsed = JSON.parse(trimmed)
                } catch {
                    // a malformed line should not kill a stream that is otherwise fine
                    continue
                }

                if (parsed.error) {
                    throw new OllamaUnavailableError(`Ollama error: ${parsed.error}`)
                }

                if (parsed.message?.content) {
                    yield parsed.message.content
                }
                if (parsed.done) return
            }
        }
    } finally {
        await reader.cancel().catch(() => {})
    }
}
