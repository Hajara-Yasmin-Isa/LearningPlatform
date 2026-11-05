'use client'

import { useState, type FormEvent, type KeyboardEvent } from 'react'

const MAX_LENGTH = 2000 // matches the per-message cap in /api/malami

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const canSend = !disabled && value.trim().length > 0

  const submit = () => {
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  // Enter sends, Shift+Enter adds a new line.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        rows={1}
        placeholder={disabled ? 'Malami is replying…' : 'Ask Malami a question'}
        aria-label="Message to Malami"
        className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="submit"
        disabled={!canSend}
        className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-medium text-white disabled:bg-gray-300"
      >
        Send
      </button>
    </form>
  )
}
