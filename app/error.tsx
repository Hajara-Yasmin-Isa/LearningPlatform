'use client'

import Link from 'next/link'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-6xl font-bold text-slate-200 mb-4">!</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
      <p className="text-slate-500 mb-8 max-w-sm">
        An unexpected error occurred. Try again or return to courses.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          Try again
        </button>
        <Link
          href="/courses"
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-sm transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  )
}
