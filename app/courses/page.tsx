'use client'

import { useEffect, useState } from 'react'
import { CourseWithInstructor, Enrollment } from '@/types/database'
import { supabase } from '@/lib/supabase/client' // Fixed import
import { CourseCard } from '@/components/features/courses/CourseCard'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { getUserEnrollments, getEnrolledCoursesWithProgress } from '@/lib/supabase/courses'
import CourseSearch from '@/components/features/courses/CourseSearch'

export default function CoursesPage() {
  // State
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [userId, setUserId] = useState<string | null>(null)  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)   
  const [myCourses, setMyCourses] = useState<CourseWithInstructor[]>([])

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const uid = user?.id ?? null
        setUserId(uid)

        // Fetch enrollments if logged in
        if (uid) {
          const enrollmentsData = await getUserEnrollments(uid)
          setEnrollments(enrollmentsData)
          const enrolledCourses = await getEnrolledCoursesWithProgress(uid)
          setMyCourses(enrolledCourses.map(course => course.course as CourseWithInstructor))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Loading state
  if (loading) return <LoadingScreen />

  // Error state
  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Sake gwadawa
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Ajujuwa</h1>
        <div className="mb-6 flex flex-col gap-4 md:flex-row">

        </div>
      </div>

      {userId !== null && enrollments.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Ajujuwana</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={true}
                userId={userId}
              />
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-10">Dukkan Ajujuwa</h2>
      <CourseSearch
        enrollments={enrollments}
        userId={userId}
/>
    </div>
  )
}