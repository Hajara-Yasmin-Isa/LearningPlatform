'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth/translateAuthError'

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
      setError(translateAuthError(error.message))
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
          <h1 className="text-2xl font-bold text-slate-900">Sake Saita Password</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Shigar da imel ɗinka za mu aika maka hanyar sake saitawa
          </p>
        </div>

        {sent ? (
          <div className="glass-strong rounded-2xl shadow-md p-8 space-y-3 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Duba Imel Ɗinka</h2>
            <p className="text-slate-600 text-sm">
              Mun aika maka hanyar sake saita password zuwa <strong>{email}</strong>. Danna ta domin zaɓar sabuwar password.
            </p>
            <p className="text-slate-400 text-xs pt-2">
              Ba ka samu ba? Duba akwatin spam ko a{' '}
              <button
                onClick={() => setSent(false)}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                sake gwadawa
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
                Adireshin Imel
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="sunanka@example.com"
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
              {loading ? 'Ana turawa...' : 'Aika hanyar sake saitawa'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Ka tuna da ita?{' '}
          <Link href="/auth/login" className="text-yellow-600 font-semibold hover:text-yellow-700">
            Koma Shiga
          </Link>
        </p>

      </div>
    </div>
  )
}
