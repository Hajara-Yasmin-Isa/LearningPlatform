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

    if (!user) return null

    return (
        
    )
}