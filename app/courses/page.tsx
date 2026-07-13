'use client'

import { useEffect, useState } from 'react'
import { getAllPublishedCourses, getUserEnrollments, searchCourses } from '@/lib/supabase/courses'
import { CourseGrid } from '@/components/features/courses/CourseGrid'
import { CourseWithInstructor, Enrollment } from '@/types/database'
import { supabase } from '@/lib/supabase/client' // Fixed import
import { CourseCard } from '@/components/features/courses/CourseCard'

export default function CoursesPage() {
  // State
  const [courses, setCourses] = useState<CourseWithInstructor[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [difficulty, setDifficulty] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // Fetch all courses
        // TODO: Incorporate Backend Task 3
        const coursesData = await getAllPublishedCourses()
        setCourses(coursesData)

        // Fetch enrollments if logged in
        if (uid) {
          const enrollmentsData = await getUserEnrollments(uid)
          setEnrollments(enrollmentsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Search useEffect
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const results = await searchCourses(
          searchQuery,
          difficulty || null
        )

        setCourses(results)
      } catch (err) {
        console.log(err)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, difficulty])

  // Loading state
  if (loading) {
    return <p className="text-center mt-10">Loading courses...</p>
  }

  // Error state
  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-black text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  // Main UI
  const myCourses = courses.filter(course =>
    enrollments.some(e => e.course_id === course.id)
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Courses</h1>
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            className="mb-6 rounded-xl border border-white/70 bg-white/50 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition backdrop-blur-sm"
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border border-white/70 bg-white/50 px-4 h-[46px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-sm"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
          </select>

        </div>
      </div>

      {userId !== null && enrollments.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
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

      <h2 className="text-xl font-semibold mb-4 mt-10">All Courses</h2>
      {courses.length === 0 && searchQuery.trim() !== "" ? (
        <p className="text-gray-500">
          No classes found matching your search.
        </p>
      ) : (

      <CourseGrid
        courses={courses}
        enrollments={enrollments}
        userId={userId}
      />
      )}
    </div>
  )
}