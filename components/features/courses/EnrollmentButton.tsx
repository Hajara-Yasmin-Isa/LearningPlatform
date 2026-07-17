'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { enrollInCourse } from '@/lib/supabase/courses'

interface EnrollButtonProps {
    userId: string | null
    courseId: string
    isEnrolled: boolean
    firstLessonId?: string
}

export function EnrollmentButton({
    userId,
    courseId,
    isEnrolled,
    firstLessonId,
}: EnrollButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleEnroll = async () => {
        if (!userId) {
            router.push('/auth/login')
            return
        }

        try {
            setLoading(true)
            await enrollInCourse(userId, courseId)
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
