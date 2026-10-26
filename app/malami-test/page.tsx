'use client'

// Developer harness for B2.2 — demonstrates progressive rendering against /api/malami and
// shows time-to-first-token against total time.
//
// Not learner-facing and not linked from anywhere in the app, so the copy here is English
// rather than Hausa. The real Malamin AI chat is B2.1.
//
// The route requires a session, so sign in at /auth/login first or every request is a 401.

import { useRef, useState } from 'react'

type Frame =
    | { type: 'token'; value: string }
    | { type: 'replace'; value: string }
    | { type: 'error'; message: string }
    | { type: 'done' }

type Status = 'idle' | 'streaming' | 'done' | 'error'

export default function MalamiTestPage() {
    const [prompt, setPrompt] = useState('Explain what a loop is, simply.')
    const [exerciseId, setExerciseId] = useState('')
    const [userAnswer, setUserAnswer] = useState('')
    const [visible, setVisible] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [error, setError] = useState('')
    const [replaced, setReplaced] = useState(false)
    const [ttft, setTtft] = useState<number | null>(null)
    const [total, setTotal] = useState<number | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    async function send() {
        const controller = new AbortController()
        abortRef.current = controller

        setVisible('')
        setError('')
        setReplaced(false)
        setTtft(null)
        setTotal(null)
        setStatus('streaming')

        const started = performance.now()
        let firstAt: number | null = null

        try {
            const res = await fetch('/api/malami', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    context: exerciseId
                        ? { exerciseId, userAnswer: userAnswer || undefined }
                        : undefined,
                }),
                signal: controller.signal,
            })

            // Failures before the stream opens still arrive as ordinary JSON status codes.
            if (!res.ok || !res.body) {
                const body = await res.json().catch(() => ({}))
                setError(body.error ?? `HTTP ${res.status}`)
                setStatus('error')
                return
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Network chunks do not align with line breaks, so the trailing partial
                // line is carried over to the next read.
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? ''

                for (const line of lines) {
                    if (!line.trim()) continue

                    let frame: Frame
                    try {
                        frame = JSON.parse(line)
                    } catch {
                        continue
                    }

                    if (frame.type === 'token') {
                        if (firstAt === null) {
                            firstAt = performance.now()
                            setTtft(Math.round(firstAt - started))
                        }
                        setVisible((v) => v + frame.value)
                    }

                    // The leak guard fired: discard what was shown and swap in the
                    // fallback. This is why the wire format carries frames rather than
                    // plain text — text alone cannot express "forget what I just said".
                    if (frame.type === 'replace') {
                        if (firstAt === null) {
                            firstAt = performance.now()
                            setTtft(Math.round(firstAt - started))
                        }
                        setVisible(frame.value)
                        setReplaced(true)
                    }

                    if (frame.type === 'error') {
                        setError(frame.message)
                        setStatus('error')
                    }
                }
            }

            setTotal(Math.round(performance.now() - started))
            setStatus((s) => (s === 'error' ? s : 'done'))

        } catch (e) {
            if ((e as Error).name === 'AbortError') {
                setTotal(Math.round(performance.now() - started))
                setStatus('done')
                return
            }
            setError((e as Error).message)
            setStatus('error')
        }
    }

    const streaming = status === 'streaming'

    return (
        <main className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="text-2xl font-bold">Malami streaming harness</h1>
            <p className="mt-1 text-sm text-gray-600">
                B2.2 developer page. Requires a signed-in session.
            </p>

            <div className="mt-6 space-y-3">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 p-3 text-sm"
                    placeholder="Ask Malami something"
                />

                <details className="rounded border border-gray-200 p-3">
                    <summary className="cursor-pointer text-sm font-medium">
                        Exercise context (optional — exercises the leak guard)
                    </summary>
                    <div className="mt-3 space-y-2">
                        <input
                            value={exerciseId}
                            onChange={(e) => setExerciseId(e.target.value)}
                            className="w-full rounded border border-gray-300 p-2 text-sm"
                            placeholder="exerciseId (UUID from the exercises table)"
                        />
                        <input
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-full rounded border border-gray-300 p-2 text-sm"
                            placeholder="the learner's current answer (optional)"
                        />
                    </div>
                </details>

                <div className="flex gap-2">
                    <button
                        onClick={send}
                        disabled={streaming || !prompt.trim()}
                        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                    >
                        {streaming ? 'Streaming…' : 'Send'}
                    </button>
                    <button
                        onClick={() => abortRef.current?.abort()}
                        disabled={!streaming}
                        className="rounded border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                    >
                        Stop
                    </button>
                </div>
            </div>

            {(ttft !== null || total !== null) && (
                <div className="mt-6 flex gap-6 text-sm">
                    <span>
                        <span className="text-gray-500">time to first token</span>{' '}
                        <strong>{ttft ?? '—'} ms</strong>
                    </span>
                    <span>
                        <span className="text-gray-500">total</span>{' '}
                        <strong>{total ?? '—'} ms</strong>
                    </span>
                </div>
            )}

            {replaced && (
                <p className="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
                    Leak guard fired — the generated reply was discarded and replaced.
                </p>
            )}

            {error && (
                <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-900">{error}</p>
            )}

            {visible && (
                <div className="mt-4 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">
                    {visible}
                    {streaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
                </div>
            )}
        </main>
    )
}
