import type { ChatMessage } from './types'

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-gray-900 text-white'
            : 'rounded-bl-sm bg-gray-100 text-gray-900'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
