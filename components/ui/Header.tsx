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
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
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
          <nav className="hidden md:flex items-center gap-6">

            {/* Welcome Message */}
            {user ? (
              <>
                <div className="hidden md:block text-slate-400 text-sm">Hi, {user.user_metadata?.full_name ?? user.email?.split('@')[0]}!</div>
              </>
            ) : (
              <>
              </>
            )}

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

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-700"
          >
            ☰
          </button>

        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-white/50 bg-white shadow-sm">
          <nav className="flex flex-col p-4 space-y-3">

            <Link
              href="/courses"
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900"
            >
              Courses
            </Link>

            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-slate-700 hover:text-slate-900"
              >
                My Dashboard
              </Link>
            )}

            <div className="flex items-center justify-between text-slate-400">
              <span>AI Tutor</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                Coming Soon
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Discussions</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                Coming Soon
              </span>
            </div>

            <Link
              href="/auth/profile"
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900"
            >
              Settings
            </Link>

            <Link
              href="/help"
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900"
            >
              Help
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-slate-700 hover:text-slate-900"
            >
              Contact
            </Link>

            {user && (
              <button
                onClick={async () => {
                  setMenuOpen(false)
                  await logout()
                }}
                className="text-left text-slate-700 hover:text-slate-900"
              >
                Log out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
