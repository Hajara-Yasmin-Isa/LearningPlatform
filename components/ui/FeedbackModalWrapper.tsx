'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import FeedbackModal from "./FeedbackModal"
import { User } from "@supabase/supabase-js"

export default function FeedbackModalWrapper() {
    const [user, setUser] = useState<User | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const { data: { subscription } } = 
            supabase.auth.onAuthStateChange((_, session) => {
                setUser(session?.user ?? null)
            })

        return () => subscription.unsubscribe()
    }, [])

    //Only renders if logged in!
    if (!user) return null

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-2 shadow-lg text-sm font-semibold transition-colors"
            >
                💬 Ra'ayoyin jama'a
            </button>
                {open && (
                    <FeedbackModal
                        userId={user.id}
                        onClose={() => setOpen(false)}
                    />
                )}
        </>
    )
}
