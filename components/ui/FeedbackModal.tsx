'use client'

import { useState } from "react"
import { submitBetaFeedback } from "@/lib/supabase/feedback"
import { FeedbackType } from "@/lib/supabase/feedback"

interface FeedbackModalProps {
    userId: string
    onClose: () => void
}

//Waiting for backend task 3 to be available on dev to implement
export default function FeedbackModal({
    userId,
    onClose
}: FeedbackModalProps) {
    const [type, setType] = useState<FeedbackType>("bug")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)

    if (submitted) {
        submitBetaFeedback(userId, message, type, window.location.pathname)
        setSubmitted(true)
        return (
            <div>
                Thank you!
            </div>
        )
    }

    return (
        <div>
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border p-2 w-full"
            >
                <option>Bug</option>
                <option>Suggestion</option>
                <option>Other</option>
            </select>
            <textarea rows={4}/>
            <button>Submit</button>
        </div>
    )
}