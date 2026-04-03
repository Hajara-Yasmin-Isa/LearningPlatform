'use client'

import { useState } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage("Mun karɓi adireshin imel ɗinka. Za mu sanar da kai lokacin ƙaddamarwa.")
      setEmail('')
    } else {
      setStatus('error')
      if (res.status === 409) {
        setMessage("Ka riga ka yi rajista da wannan imel ɗin.")
      } else {
        setMessage("An samu matsala — Sake gwadawa.")
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {status === 'success' ? (
        <div className="glass rounded-xl px-6 py-4 text-center shadow-sm">
          <p className="text-green-700 font-semibold">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="Shigar da adireshin imel ɗinka"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl glass border border-white/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors shadow-md whitespace-nowrap"
          >
            {status === 'loading' ? 'Ana shiga...' : 'Tura'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-2 text-center">{message}</p>
      )}
    </div>
  )
}
