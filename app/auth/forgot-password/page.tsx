'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Littafin Fasaha logo"
            width={56}
            height={56}
            className="rounded-full mx-auto mb-4 shadow-md"
          />
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="glass-strong rounded-2xl shadow-md p-8 space-y-3 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
            <p className="text-slate-600 text-sm">
              We sent a password reset link to <strong>{email}</strong>. Click it to choose a new password.
            </p>
            <p className="text-slate-400 text-xs pt-2">
              Didn&apos;t get it? Check your spam folder or{' '}
              <button
                onClick={() => setSent(false)}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass-strong rounded-2xl shadow-md p-8 space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/70 bg-white/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition backdrop-blur-sm"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-500 hover:bg-yellow-600 py-2.5 text-white font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Remembered it?{' '}
          <Link href="/auth/login" className="text-yellow-600 font-semibold hover:text-yellow-700">
            Back to log in
          </Link>
        </p>

      </div>
    </div>
  )
}
