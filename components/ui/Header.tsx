'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import BetaBadge from './BetaBadge'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
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

  // Close the "More" dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinkClass = 'text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm'

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand + Beta Badge */}
          <div className="flex items-center gap-3">
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
            </Link>
            <BetaBadge />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <span className="text-slate-400 text-sm">
                Hi, {user.user_metadata?.full_name ?? user.email?.split('@')[0]}!
              </span>
            )}

            <Link href="/courses" className={navLinkClass}>Courses</Link>

            {user && (
              <Link href="/dashboard" className={navLinkClass}>Dashboard</Link>
            )}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className={`${navLinkClass} flex items-center gap-1`}
              >
                More
                <span className="text-slate-400 text-xs">{moreOpen ? '▴' : '▾'}</span>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-8 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 text-slate-400 text-sm cursor-default">
                    <span>AI Instructor</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Soon</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 text-slate-400 text-sm cursor-default">
                    <span>Discussions</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Soon</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 text-slate-400 text-sm cursor-default">
                    <span>Exams</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Soon</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 text-slate-400 text-sm cursor-default">
                    <span>Inbox</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Soon</span>
                  </div>
                  <div className="mx-3 my-1.5 border-t border-slate-100" />
                  {user && (
                    <Link
                      href="/auth/profile"
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Settings
                    </Link>
                  )}
                  <Link
                    href="/help"
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Help
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              <>
                <button onClick={logout} className={navLinkClass}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={navLinkClass}>Log in</Link>
                <Link
                  href="/auth/signup"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-slate-700 text-xl px-1"
            aria-label="Open menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/50 bg-white shadow-sm">
          <nav className="flex flex-col p-4 space-y-3">
            {user && (
              <p className="text-slate-400 text-sm pb-1">
                Hi, {user.user_metadata?.full_name ?? user.email?.split('@')[0]}!
              </p>
            )}

            <Link href="/courses" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
              Courses
            </Link>

            {user && (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
                My Dashboard
              </Link>
            )}

            <div className="border-t border-slate-100 pt-2 mt-1 space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>AI Instructor</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Discussions</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Exams</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-sm">
                <span>Inbox</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Coming Soon</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-3">
              {user && (
                <Link href="/auth/profile" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                  Settings
                </Link>
              )}
              <Link href="/help" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                Help
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                Contact
              </Link>
            </div>

            {user && (
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={async () => { setMobileOpen(false); await logout() }}
                  className="text-left text-slate-700 hover:text-slate-900 text-sm font-medium"
                >
                  Log out
                </button>
              </div>
            )}

            {!user && (
              <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm text-center transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
