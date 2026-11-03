'use client'

import { useEffect, useRef } from 'react'
import ChatInput from './ChatInput'
import ContextChip from './ContextChip'
import ErrorNotice from './ErrorNotice'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import WelcomeState from './WelcomeState'
import { useMalamiChat } from './useMalamiChat'
import type { MalamiContext } from './types'

export default function MalamiChat({ context }: { context?: MalamiContext }) {
  const { messages, pending, error, send, retry } = useMalamiChat(context)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Keep the newest turn in view as the conversation grows.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

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
