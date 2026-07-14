'use client'

import Link from 'next/link'
import { enrollInCourse } from "@/lib/supabase/courses"
import { CourseWithInstructor } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

//Course Card props: CourseWithInstructor extends a Course class which has all the information whose members can be accessed
//by the . operator
interface CourseCardProps {
  course: CourseWithInstructor
  isEnrolled: boolean
  userId: string | null
}

export function CourseCard({ course, isEnrolled, userId }: CourseCardProps) {

  // Router (for redirect if not logged in)
  const router = useRouter()

  // Local state so UI updates without refresh
  const [enrolled, setEnrolled] = useState(isEnrolled)
  const [loading, setLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)

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
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setEnrollError(message.includes('Already enrolled') ? 'You are already enrolled.' : 'Something went wrong. Please try again.')
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

      {course.lessonCount > 0 && (
        <p className="hidden md:block text-slate-400 text-sm">
          {course.lessonCount} lessons
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
        Instructor: {course.users?.name}
      </p>

      {/* If course.duration_minutes exists then render*/}
      {course.duration_minutes && (
        <p className="text-xs text-gray-500">
          Duration: {course.duration_minutes} minutes
        </p>
      )}

      {/* Buttons */}
      {enrollError && (
        <p className="text-red-500 text-xs mt-1">{enrollError}</p>
      )}

      <div className="mt-auto">
        {enrolled ? ( // use LOCAL state, not prop
          <div className="flex justify-between items-center">
            <span className="text-green-600 text-sm font-medium">
              Enrolled
            </span>
            <Link href={`/courses/${course.id}`} className="text-sm text-blue-600">
              View Course
            </Link>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-md text-sm disabled:opacity-50"
          >
            {loading ? 'Enrolling...' : 'Enroll'}
          </button>
        )}
      </div>
    </div>
  )
}