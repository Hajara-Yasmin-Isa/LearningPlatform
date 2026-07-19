'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface HamburgerMenuProps {
    user: User | null
}

export default function HamburgerMenu({
    user,
}: HamburgerMenuProps) {
    const [mobileOpen, setMobileOpen] = useState(false)

    const router = useRouter()

    const logout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (

        <>
            <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden text-slate-700 text-xl px-1"
                aria-label="Open menu"
            >
                {mobileOpen ? '✕' : '☰'}
            </button>


            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/50 bg-white shadow-sm">
                    <nav className="flex flex-col p-4 space-y-3">
                        {user && (
                            <p className="text-slate-400 text-sm pb-1">
                                Sannu, {user.user_metadata?.full_name ?? user.email?.split('@')[0]}!
                            </p>
                        )}

                        <Link href="/courses" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
                            Ajujuwa
                        </Link>

                        {user && (
                            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
                                Dashboard na
                            </Link>
                        )}

                        <div className="border-t border-slate-100 pt-2 mt-1 space-y-3">
                            <div className="flex items-center justify-between text-slate-400 text-sm">
                                <span>Malamin AI</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Zuwa nan tafe</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 text-sm">
                                <span>Tattaunawa</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Zuwa nan tafe</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 text-sm">
                                <span>Jarabawa</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Zuwa nan tafe</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400 text-sm">
                                <span>Saƙonni</span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Zuwa nan tafe</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-2 space-y-3">
                            {user && (
                                <Link href="/auth/profile" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                                    Shafin Bayananka
                                </Link>
                            )}
                            {user && (
                                <Link href="/auth/settings" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                                    Saiti
                                </Link>
                            )}
                            <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                                Game da Mu
                            </Link>
                            <Link href="/help" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                                Taimako
                            </Link>
                            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-slate-700 hover:text-slate-900 text-sm font-medium">
                                Tuntuɓe mu
                            </Link>
                        </div>

                        {user && (
                            <div className="border-t border-slate-100 pt-2">
                                <button
                                    onClick={async () => { setMobileOpen(false); await logout() }}
                                    className="text-left text-slate-700 hover:text-slate-900 text-sm font-medium"
                                >
                                    Fita
                                </button>
                            </div>
                        )}

                        {!user && (
                            <div className="border-t border-slate-100 pt-2 flex flex-col gap-2">
                                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-slate-700 hover:text-slate-900 text-sm font-medium">
                                    Shiga
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    onClick={() => setMobileOpen(false)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm text-center transition-colors"
                                >
                                    Fara Yanzu
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </>
    )

}

