import type { ChatMessage, MalamiContext, MalamiError } from './types'

// The only place the page talks to the server. No AI logic lives here, just
// the HTTP call to our own route and the decoding of its reply.
//
// Streaming shape agreed with B2.2: NDJSON, one frame per line.
//   { type: 'token',   content } — append to the message being shown
//   { type: 'replace', content } — discard what is shown and show this instead
//                                  (fires when the answer-leak guard trips mid-reply)
//   { type: 'error',   message } — stop; show a friendly error
//   { type: 'done' }             — reply complete
// Until B2.2 merges, the route still returns plain JSON { reply }; that is
// handled too, so the page works against either.

type Frame =
  | { type: 'token'; content: string }
  | { type: 'replace'; content: string }
  | { type: 'error'; message?: string }
  | { type: 'done' }

export interface StreamHandlers {
  onToken: (content: string) => void
  onReplace: (content: string) => void
}

export type SendResult =
  | { ok: true; reply: string }
  | { ok: false; error: MalamiError }

export async function sendToMalami(
  messages: ChatMessage[],
  context: MalamiContext | undefined,
  handlers: StreamHandlers,
): Promise<SendResult> {
  const body = {
    messages: messages.map(({ role, content }) => ({ role, content })),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  }

  let res: Response
  try {
    res = await fetch('/api/malami', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: { kind: 'unavailable' } }
  }

  if (res.status === 401) return { ok: false, error: { kind: 'unauthorised' } }
  if (res.status === 429) return { ok: false, error: { kind: 'rate_limited' } }
  if (res.status === 503) return { ok: false, error: { kind: 'unavailable' } }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message =
      typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`
    return { ok: false, error: { kind: 'unknown', message } }
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/x-ndjson') && res.body) {
    return readStream(res.body, handlers)
  }

  // Non-streaming fallback (B1.3 as it is on dev today).
  const data = await res.json().catch(() => null)
  if (typeof data?.reply !== 'string') {
    return { ok: false, error: { kind: 'unknown', message: 'Empty reply from server' } }
  }
  handlers.onReplace(data.reply)
  return { ok: true, reply: data.reply }
}

async function readStream(
  stream: ReadableStream<Uint8Array>,
  handlers: StreamHandlers,
): Promise<SendResult> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // keep any partial last line for the next chunk

      for (const line of lines) {
        if (!line.trim()) continue
        const frame = JSON.parse(line) as Frame

        if (frame.type === 'token') {
          reply += frame.content
          handlers.onToken(frame.content)
        } else if (frame.type === 'replace') {
          reply = frame.content
          handlers.onReplace(frame.content)
        } else if (frame.type === 'error') {
          return {
            ok: false,
            error: { kind: 'unknown', message: frame.message ?? 'Malami could not finish' },
          }
        } else if (frame.type === 'done') {
          return { ok: true, reply }
        }
      }
    }
  } catch {
    return { ok: false, error: { kind: 'unavailable' } }
  }

  // Stream ended without a done frame: treat what we have as the reply.
  return { ok: true, reply }
}
