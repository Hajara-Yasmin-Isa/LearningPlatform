'use client'

import { useEffect, useRef, useState } from 'react'

export type CalloutKind = 'tip' | 'note' | 'check'

const CALLOUT_META: Record<CalloutKind, { icon: string; label: string; button: string; card: string }> = {
  tip: {
    icon: '💡',
    label: 'Bayani',
    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
    card: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
  note: {
    icon: '📓',
    label: 'Shawarar Marubuciya',
    button: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    card: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  check: {
    icon: '📍',
    label: 'Ka Tsaya Ka Yi Tunani',
    button: 'bg-rose-100 hover:bg-rose-200 text-rose-700',
    card: 'bg-rose-50 border-rose-200 text-rose-900',
  },
}

interface CalloutIconProps {
  kind: CalloutKind
  text: string
}

export default function CalloutIcon({ kind, text }: CalloutIconProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const meta = CALLOUT_META[kind]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <span className="relative inline-block align-middle mx-1" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={meta.label}
        aria-expanded={open}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm leading-none transition-colors ${meta.button}`}
      >
        {meta.icon}
      </button>

      {open && (
        <div
          role="tooltip"
          className={`absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-64 sm:w-80 rounded-xl border p-4 shadow-lg text-sm leading-relaxed ${meta.card}`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-70">
            {meta.label}
          </p>
          <p>{text}</p>
        </div>
      )}
    </span>
  )
}
