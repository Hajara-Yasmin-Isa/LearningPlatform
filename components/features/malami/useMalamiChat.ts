'use client'

import { useCallback, useState } from 'react'
import { sendToMalami } from './malamiApi'
import type { ChatMessage, MalamiContext, MalamiError } from './types'

// Conversation state lives here, client-side only. Every turn goes through
// POST /api/malami with the full running history so the server can hold
// context (the route caps it to the last N turns itself).

let nextId = 0
const makeId = () => `m${++nextId}`

export function useMalamiChat(context?: MalamiContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<MalamiError | null>(null)

  // Sends `history` (which must end with a user turn). An empty assistant
  // message is added straight away and filled as frames arrive: tokens
  // append to it, a replace frame swaps its whole content.
  const deliver = useCallback(
    async (history: ChatMessage[]) => {
      const replyId = makeId()
      const setReply = (update: (current: string) => string) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, content: update(m.content) } : m)),
        )

      setMessages([...history, { id: replyId, role: 'assistant', content: '' }])
      setError(null)
      setPending(true)

      const result = await sendToMalami(history, context, {
        onToken: (chunk) => setReply((current) => current + chunk),
        onReplace: (content) => setReply(() => content),
      })

      if (result.ok) {
        setReply(() => result.reply)
      } else {
        // Drop the partial reply so the last turn is the user's and retry can re-send it.
        setMessages(history)
        setError(result.error)
      }
      setPending(false)
    },
    [context],
  )

  const send = useCallback(
    (text: string) => {
      const content = text.trim()
      if (!content || pending) return
      return deliver([...messages, { id: makeId(), role: 'user', content }])
    },
    [messages, pending, deliver],
  )

  // Re-sends the last user turn after a failure (503, network drop, error frame).
  const retry = useCallback(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'user' || pending) return
    return deliver(messages)
  }, [messages, pending, deliver])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    setPending(false)
  }, [])

  return { messages, pending, error, send, retry, reset }
}
