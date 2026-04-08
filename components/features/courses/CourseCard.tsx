import { enrollInCourse } from "@/lib/supabase/courses"
import { CourseWithInstructor } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

      // Call Supabase function
      await enrollInCourse(userId, course.id)

      // Update UI instantly
      setEnrolled(true)
    } catch (err: any) {
      // Handles "already enrolled" and other errors
      if (err.message.includes('Already enrolled')) {
        alert('You are already enrolled in this course.')
          } else {
        alert('Something went wrong. Please try again.')
        }
    } finally {
      setLoading(false)
    }
  }

  // UI Skeleton
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-3">
      <img
        src={course.thumbnail_url || '/placeholder.png'}
        alt={course.title}
        className="w-full h-40 object-cover rounded-md"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{course.title}</h2>
        <span
          className={`text-xs px-2 py-1 rounded ${
            difficultyColors[course.difficulty as keyof typeof difficultyColors]
          }`}
        >
          {course.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2">
        {course.description}
      </p>

      <p className="text-sm">
        Instructor: {course.users?.name}
      </p>

      {/* If course.duration_minutes exists then render*/}
      {course.duration_minutes && (
        <p className="text-xs text-gray-500">
          Duration (minutes): {course.duration_minutes}
        </p>
      )}

      {/* Buttons */}
      <div className="mt-auto">
        {enrolled ? ( // use LOCAL state, not prop
          <div className="flex justify-between items-center">
            <span className="text-green-600 text-sm font-medium">
              Enrolled
            </span>
            <button className="text-sm text-blue-600">
              View Course
            </button>
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