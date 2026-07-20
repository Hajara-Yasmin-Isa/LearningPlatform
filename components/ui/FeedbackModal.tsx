'use client'

import { useState } from 'react'
import { submitBetaFeedback, FeedbackType } from '@/lib/supabase/feedback'

interface FeedbackModalProps {
  userId: string
  onClose: () => void
}

const TYPES: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'bug',        label: '🐛 Matsalar Furogiram (Bug)', description: 'Wani abu ne ba ya aiki daidai' },
  { value: 'suggestion', label: '💡 Shawara',                  description: 'Wani ra\'ayi don inganta abubuwa' },
  { value: 'other',      label: '💬 Wani Labari Na Dabam',     description: 'Wani ra\'ayi don inganta abubuwa' },
]

export default function FeedbackModal({ userId, onClose }: FeedbackModalProps) {
  const [type, setType]           = useState<FeedbackType>('bug')
  const [message, setMessage]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitError(null)
    try {
      setSubmitting(true)
      await submitBetaFeedback(userId, message, type, window.location.pathname)
      setSubmitted(true)
    } catch {
      setSubmitError('Kuskure ya faru. Sake gwadawa.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg leading-none transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-3xl">🙏</p>
            <h2 className="text-lg font-bold text-slate-900">Mun gode!</h2>
            <p className="text-sm text-slate-500">
              An karɓi ra'ayinka. An tura shi ga ƙungiyarmu don taimaka mana mu inganta Littafin Fasaha.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              An gama
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">

            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ba da Ra'ayinka</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Kana amfani da sigar beta — ra'ayinka yana taimakonmu wajen inganta komai.
              </p>
            </div>

            {/* Type selector */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Ba da ra'ayinka, me kake son gani?</p>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map(({ value, label, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    title={description}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      type === value
                        ? 'bg-yellow-500 border-yellow-500 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-yellow-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {TYPES.find(t => t.value === type)?.description}
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Saƙonka
              </label>
              <textarea
                rows={4}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'Bayyana abin da ya faru da kuma abin da kake tsammanin gani'
                    : type === 'suggestion'
                    ? 'Bayyana ra\'ayoyinka, me kake son gani?'
                    : 'Saƙonka'
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition resize-none"
              />
            </div>

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Soke
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !message.trim()}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {submitting ? 'Ana aika...' : 'Tura Ra\'ayi'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
