'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import StatsCard from "./StatsCard"
import { supabase } from "@/lib/supabase/client"
import { getEnrolledCoursesWithProgress } from "@/lib/supabase/courses"
import { EnrolledCourseWithProgress } from "@/types/database"

export default function StudentDashboard() {
  const [courses, setCourses] = useState<EnrolledCourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  
  useEffect(() => {
    async function fetchCourses() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }
      const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Student"
      setDisplayName(name)

      const data = await getEnrolledCoursesWithProgress(user.id)
      setCourses(data)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  const enrolledCourses = courses.length
  const sectionsCompleted = courses.reduce((sum, course) => sum + course.sectionsCompleted, 0) 
  const coursesFinished = courses.filter(course => course.sectionsCompleted >= course.totalSections).length

  const stats = [
    { label: "Enrolled Courses", value: String(enrolledCourses) },
    { label: "Sections Completed", value: String(sectionsCompleted) },
    { label: "Courses Finished", value: String(coursesFinished) },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Hi, {displayName}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's where you left off.
        </p>
      </div>

      {/* Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatsCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      {/* Lessons */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Courses
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <div className="space-y-2">
  <p className="text-sm text-gray-500">
    You haven't enrolled in any courses yet.
  </p>

  {/* TODO: Use lastAccessedLessonId when Backend Task 2 exposes it */}
  <Link
    href="/courses"
    className="text-indigo-600 hover:underline"
  >
    Browse courses →
  </Link>
</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
  const progress =
    course.totalSections > 0
      ? (course.sectionsCompleted / course.totalSections) * 100
      : 0

  return (
    <div
      key={course.course.id}
      className="bg-white border rounded-xl shadow-sm p-4"
    >
      <h3 className="font-semibold text-lg">
        {course.course.title}
      </h3>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div
          className="bg-indigo-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {course.sectionsCompleted}/{course.totalSections} sections
      </p>

      <Link
        href={`/courses/${course.course.id}`}
        className="inline-block mt-3 text-indigo-600 hover:underline"
      >
        Continue →
      </Link>
    </div>
        )
      })}
          </div>
        )}
      </section>

    </div>
  )
}