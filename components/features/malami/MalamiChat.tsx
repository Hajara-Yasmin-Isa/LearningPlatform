'use client'

import { useEffect, useRef } from 'react'
import ChatInput from './ChatInput'
import ContextChip from './ContextChip'
import ErrorNotice from './ErrorNotice'
import ExerciseContextPanel, { type ExerciseSummary } from './ExerciseContextPanel'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import WelcomeState from './WelcomeState'
import { useMalamiChat } from './useMalamiChat'
import type { MalamiContext } from './types'

// Opens the conversation for a learner arriving from a failed exercise, so the first thing
// they see is a hint rather than an empty box they have to find words for. Sent as their
// turn because it is their request — they asked for help by coming here.
// TODO: copy — Hausa wording from the team lead
const EXERCISE_OPENING = 'I got this exercise wrong. Can you help me understand it?'

export default function MalamiChat({
  context,
  exercise,
}: {
  context?: MalamiContext
  exercise?: ExerciseSummary
}) {
  const { messages, pending, error, send, retry } = useMalamiChat(context)
  const bottomRef = useRef<HTMLDivElement>(null)
  const autoStarted = useRef(false)

  // Keep the newest turn in view as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  // Entering with exercise context means the learner came from a failed attempt, so the
  // conversation starts itself. The ref guard matters: effects run twice in development
  // under StrictMode, and without it the learner would open on two identical turns.
  useEffect(() => {
    if (autoStarted.current || !context?.exerciseId) return
    autoStarted.current = true
    send(EXERCISE_OPENING)
  }, [context, send])

  const hasConversation = messages.length > 0
  // While waiting, the reply bubble exists but is empty; show the dots until
  // the first token arrives, then the bubble itself grows.
  const last = messages[messages.length - 1]
  const awaitingFirstToken = pending && last?.role === 'assistant' && last.content === ''

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Malamin AI</h1>
          <p className="text-xs text-gray-500">Your computing teacher</p>
        </div>
        {context && <ContextChip context={context} />}
      </header>

      {exercise && <ExerciseContextPanel exercise={exercise} />}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {hasConversation ? (
          <div className="flex flex-col gap-3">
            {messages.map((m) =>
              m.content === '' ? null : <MessageBubble key={m.id} message={m} />,
            )}
            {awaitingFirstToken && <TypingIndicator />}
            {error && <ErrorNotice error={error} onRetry={retry} />}
            <div ref={bottomRef} />
          </div>
        ) : (
          <WelcomeState onSuggestion={send} />
        )}
      </div>

      <div className="border-t border-gray-200 px-5 py-3">
        <ChatInput onSend={send} disabled={pending} />
      </div>
    </div>
  )
}
