'use client'

import { useState } from "react"

interface FeedbackModalProps {
    userId: string
    onClose: () => void
}

//Waiting for backend task 3 to be available on dev to implement
export default function FeedbackModal({
    userId,
    onClose
}: FeedbackModalProps) {
    const [type, setType] = useState("Bug")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)

    if (submitted) {
        return (
            <div>
                Thank you!
            </div>
        )
    }

    return (
        <div>
            <select>
                <option>Bug</option>
                <option>Suggestion</option>
                <option>Other</option>
            </select>
            <textarea rows={4}/>
            <button>Submit</button>
        </div>
    )
}