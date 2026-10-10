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
