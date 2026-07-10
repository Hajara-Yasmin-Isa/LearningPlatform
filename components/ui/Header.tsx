'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import BetaBadge from './BetaBadge'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_,  session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Littafin Fasaha logo"
              width={40}
              height={40}
              className="rounded-full object-contain"
            />
            <div className="leading-tight">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Littafin Fasaha
              </span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest">
                Computing in Hausa
              </span>
            </div>

          {/* Beta Badge */}
          <BetaBadge></BetaBadge>

          </Link>



          {/* Nav */}
          <nav className="flex items-center gap-6">
            <Link
              href="/courses"
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
            >
              Courses
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
