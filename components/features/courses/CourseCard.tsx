'use client'

import Link from 'next/link'
import { enrollInCourse } from "@/lib/supabase/courses"
import { CourseWithInstructor } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEnrolledCoursesWithProgress } from '@/lib/supabase/courses'

//Course Card props: CourseWithInstructor extends a Course class which has all the information whose members can be accessed
//by the . operator
interface CourseCardProps {
  course: CourseWithInstructor
  isEnrolled: boolean
  userId: string | null
  
  progress?: {
    completed: number
    total: number
  }
}

export function CourseCard({ course, isEnrolled, userId }: CourseCardProps) {

  // Router (for redirect if not logged in)
  const router = useRouter()

  // Local state so UI updates without refresh
  const [enrolled, setEnrolled] = useState(isEnrolled)
  const [loading, setLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

  // A course with no lessons yet has no content to actually take
  const comingSoon = course.lessonCount === 0

  // Difficulty Colors
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-orange-100 text-orange-700',
  }

  // Handle enroll button click
  const handleEnroll = async () => {
    // If user not logged in → redirect
    if (!userId) {
      router.push('/auth/login')
      return
    }

    try {
      setLoading(true)
      setEnrollError(null)
      await enrollInCourse(userId, course.id)
      setEnrolled(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wani kuskure ya faru.'
      setEnrollError(message.includes('Already enrolled') ? 'An riga an yi rajista.' : 'Wani kuskure ya faru. Sake gwadawa.')
    } finally {
      setLoading(false)
    }
  }

  // UI Skeleton
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-3">
      <img
        src={course.thumbnail_url || '/courseImagePlaceholder.png'}
        alt={course.title}
        className="w-full h-40 object-cover rounded-md"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{course.title}</h2>
      </div>

      {comingSoon ? (
        <p className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-400">
          Zuwa nan tafe
        </p>
      ) : (
        <p className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-400 text-sm">
          {course.lessonCount === 1 ? `Darasi ${course.lessonCount}` : `Darrusa ${course.lessonCount}`}
        </p>
      )}
      <p className={`text-xs px-2 py-1 rounded ${difficultyColors[course.difficulty as keyof typeof difficultyColors]
        }`}
      >
        {course.difficulty}
      </p>

      <p className="text-sm text-gray-600 line-clamp-2">
        {course.description}
      </p>

      <p className="text-sm">
        Maalami: {course.users?.name}
      </p>

      {/* If course.duration_minutes exists then render*/}
      {course.duration_minutes && (
        <p className="text-xs text-gray-500">
          Tsawon lokaci: mintuna {course.duration_minutes}
        </p>
      )}

      {/* Buttons */}
      {enrollError && (
        <p className="text-red-500 text-xs mt-1">{enrollError}</p>
      )}

      <div className="mt-auto">
        {comingSoon ? (
          <button
            disabled
            className="w-full bg-slate-100 text-slate-400 py-2 rounded-md text-sm cursor-not-allowed"
          >
            Zuwa nan tafe
          </button>
        ) : enrolled ? ( // use LOCAL state, not prop
          <div className="flex justify-between items-center">
            <span className="text-green-600 text-sm font-medium">
              An yi rajista
            </span>
            <Link href={`/courses/${course.id}`} className="text-sm text-blue-600">
              Duba aji
            </Link>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? 'Ana rajista...' : 'Yi rajista'}
          </button>
        )}
      </div>
    </div>
  )
}