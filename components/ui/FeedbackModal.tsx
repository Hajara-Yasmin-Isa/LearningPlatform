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

    const handleSubmit = async () => {
        submitBetaFeedback(
            userId,
            message,
            type,
            window.location.pathname
        )

        setSubmitted(true)
    }

    return (
        <div>
            <div>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="border p-2 w-full"
                >
                    <option value="bug">Bug</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="other">Other</option>
                </select>
                <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border p-2 w-full"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Submit
                </button>
            </div>
        </div>
    )
}