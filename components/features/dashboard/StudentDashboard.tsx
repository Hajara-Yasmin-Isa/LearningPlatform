'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import StatsCard from "./StatsCard"
import LoadingScreen from "@/components/ui/LoadingScreen"
import { supabase } from "@/lib/supabase/client"
import { getEnrolledCoursesWithProgress } from "@/lib/supabase/courses"
import { EnrolledCourseWithProgress } from "@/types/database"

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? '')

      try {
        const data = await getEnrolledCoursesWithProgress(user.id)
        setEnrolledCourses(data)
      } catch (err) {
        console.error('[StudentDashboard]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingScreen />

  const totalSections = enrolledCourses.reduce((sum, c) => sum + c.totalSections, 0)
  const totalCompleted = enrolledCourses.reduce((sum, c) => sum + c.sectionsCompleted, 0)
  const overallProgress = totalSections > 0 ? Math.round((totalCompleted / totalSections) * 100) : 0

  const stats = [
    { label: "Courses Enrolled", value: String(enrolledCourses.length) },
    { label: "Sections Completed", value: String(totalCompleted) },
    { label: "Overall Progress", value: `${overallProgress}%` },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Fara koyo{userName ? `, ${userName}` : ''}!
        </h1>
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

      {/* Enrolled courses */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-xl">
            <p className="text-gray-500 text-sm mb-3">You haven&apos;t enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map(({ course, sectionsCompleted, totalSections }) => {
              const percent = totalSections > 0 ? Math.round((sectionsCompleted / totalSections) * 100) : 0
              return (
                <Link key={course.id} href={`/courses/${course.id}`} className="block group">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md hover:border-yellow-200 transition-all">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-yellow-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {sectionsCompleted} / {totalSections} sections completed
                    </p>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">{percent}%</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

    </div>
  )
}
