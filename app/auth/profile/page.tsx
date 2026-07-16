'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import LoadingScreen from '@/components/ui/LoadingScreen'
import ProfileAvatar from '@/components/features/profile/ProfileAvatar'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
type Level = typeof LEVELS[number] | ''

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [level, setLevel] = useState<Level>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setName(user.user_metadata?.full_name ?? '')
      setLevel(user.user_metadata?.level ?? '')
      setLoading(false)
    })
  }, [router])

  const handleAvatarUpload = async (file: File) => {
    if (!user) return
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) { setError(uploadError.message); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    })
    if (updateError) { setError(updateError.message); return }
    setUser(data.user)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), level: level || null },
    })
    setSaving(false)
    if (error) { setError(error.message); return }
    setUser(data.user)
    setSaved(true)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-[80vh] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Profile</h1>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">

          {/* Avatar */}
          <ProfileAvatar
            url={user?.user_metadata?.avatar_url}
            name={user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
            onUpload={handleAvatarUpload}
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false) }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
              placeholder="Your name"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value as Level); setSaved(false) }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition bg-white"
            >
              <option value="">Select your level</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-slate-100 rounded-lg px-3 py-2.5 text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">
              Email is tied to your account and cannot be changed.
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
