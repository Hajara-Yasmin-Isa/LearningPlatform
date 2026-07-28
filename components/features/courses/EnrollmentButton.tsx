'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { enrollInCourse } from '@/lib/supabase/courses'

interface EnrollButtonProps {
    userId: string | null
    courseId: string
    courseTitle: string
    isEnrolled: boolean
    firstLessonId?: string
}

export function EnrollmentButton({
    userId,
    courseId,
    courseTitle,
    isEnrolled,
    firstLessonId,
}: EnrollButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Fire-and-forget: enrollment already succeeded, so email failures are
    // deliberately swallowed and never surfaced to the user
    const sendEnrollmentEmail = () => {
        supabase.auth.getUser()
            .then(({ data: { user } }) => {
                if (!user?.email) return
                return fetch('/api/email/enrollment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentEmail: user.email,
                        studentName: user.user_metadata?.full_name ?? '',
                        courseTitle,
                    }),
                })
            })
            .catch(() => {})
    }

    const handleEnroll = async () => {
        if (!userId) {
            router.push('/auth/login')
            return
        }

        try {
            setLoading(true)
            await enrollInCourse(userId, courseId)
            sendEnrollmentEmail()
            router.refresh()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div>
            {!isEnrolled ? (
                <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    {loading ? 'Ana rajista...' : 'Yi rajista'}
                </button>
            ) : (
                <a href={`/lessons/${firstLessonId}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded inline-block">
                        Ci gaba da koyo
                </a>
            )}
        </div>
    )
}
