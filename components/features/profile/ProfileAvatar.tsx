'use client'

import { useRef } from 'react'
import Image from 'next/image'

interface Props {
  url?: string
  name: string
  onUpload: (file: File) => Promise<void>
}

export default function ProfileAvatar({ url, name, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        aria-label="Change profile photo"
      >
        <div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-100 flex items-center justify-center border-2 border-slate-100 shadow-sm">
          {url ? (
            <Image
              src={url}
              alt={name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-2xl font-bold text-yellow-600">{initials}</span>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-semibold">Change</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
      >
        Change photo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
