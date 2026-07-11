'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import StatsCard from "./StatsCard"
import { supabase } from "@/lib/supabase/client"
import { getEnrolledCoursesWithProgress } from "@/lib/supabase/courses"
import { EnrolledCourseWithProgress } from "@/types/database"

export default function StudentDashboard() {
  const [courses, setCourses] = useState<EnrolledCourseWithProgress[]>([])
  const [displayName, setDisplayName] = useState<string>("")
  const [loading, setLoading] = useState(true)

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

  const coursesEnrolled = courses.length
  const sectionsCompleted = courses.reduce((acc, course) => acc + course.sectionsCompleted, 0)
  const coursesFinished = courses.filter(course => course.sectionsCompleted >= course.totalSections).length

  const stats = [
    { label: "Courses Enrolled", value: String(coursesEnrolled) },
    { label: "Sections Completed", value: String(sectionsCompleted) },
    { label: "Courses Finished", value: String(coursesFinished) },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
    Hi, {displayName}! 👋
    </h1>
    <p className="text-base text-gray-500 mt-1">
    Here's where you left off.
    </p>
  </div>

      {/* Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Progress
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
      </section>

      {/* Courses */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Courses
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading your courses...</p>
        ) : courses.length === 0 ? (
  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
    <p className="text-gray-600 mb-3">
      You haven't enrolled in any courses yet.
    </p>
    <Link href="/courses" className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center transition-colors">
      Browse courses →
    </Link>
  </div>
) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const progress = course.totalSections > 0
              ? (course.sectionsCompleted / course.totalSections) * 100
              : 0
              // TODO: When Backend Task 2 merges,
              // use course.lastAccessedLessonId (or whatever the final field is)
              // to link directly to the last lesson.
              const destinationUrl = `/courses/${course.course.id}`
              return (
                <div
                  key={course.course.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between hover:border-gray-300 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {course.course.title}
                    </h3>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {course.sectionsCompleted}/{course.totalSections} sections
                    </p>
                  </div>

                  {/* Continue Learning Link requested by your Trello Card */}
                  <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
                    <Link 
                      href={destinationUrl} 
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}