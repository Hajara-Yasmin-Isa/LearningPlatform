import Link from 'next/link'
import type { MalamiError } from './types'

export default function ErrorNotice({
  error,
  onRetry,
}: {
  error: MalamiError
  onRetry: () => void
}) {
  if (error.kind === 'unauthorised') {
    return (
      <Notice>
        Your session has expired.{' '}
        <Link href="/auth/login" className="font-medium underline">
          Sign in again
        </Link>{' '}
        to keep chatting.
      </Notice>
    )
  }

  if (error.kind === 'rate_limited') {
    return (
      <Notice>
        You are sending messages a little too quickly. Give it a moment, then{' '}
        <RetryButton onRetry={onRetry} />.
      </Notice>
    )
  }

  if (error.kind === 'unavailable') {
    // Friendly 503 state: the model server is down or unreachable.
    return (
      <Notice>
        {/* TODO: copy */}
        Malami is taking a short break and cannot answer right now. Please{' '}
        <RetryButton onRetry={onRetry} /> in a minute.
      </Notice>
    )
  }

  return (
    <Notice>
      Something went wrong: {error.message}. <RetryButton onRetry={onRetry} />?
    </Notice>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {children}
    </div>
  )
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" onClick={onRetry} className="font-medium underline">
      try again
    </button>
  )
}
