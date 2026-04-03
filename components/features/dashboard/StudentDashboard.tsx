'use client'

import { useState, useEffect } from "react"
import LessonCard  from "./LessonCard"
import StatsCard  from "./StatsCard"
import { supabase } from "@/lib/supabase/client"
import { getUserLessons, UserLesson } from "@/lib/supabase/queries"

export default function StudentDashboard() {
  const [lessons, setLessons] = useState<UserLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      // get the logged in user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const data = await getUserLessons(user.id)
      setLessons(data)
      setLoading(false)
    }

    fetchLessons()
  }, [])

  // calculate the stats from the fetched data
  const lessonsCompleted = lessons.filter((l) => l.completed === 1).length
  const activeLessons = lessons.filter((l) => l.completed === 0).length
  const overallProgress = lessons.length > 0
    ? Math.round((lessonsCompleted / lessons.length) * 100)
    : 0

  const stats = [
    { label: "Lessons Completed", value: String(lessonsCompleted) },
    { label: "Active Lessons", value: String(activeLessons) },
    { label: "Overall Progress", value: String(overallProgress) + '%' },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Student Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back!
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

      {/* Lessons */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Lessons
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading your lessons...</p>
        ) : lessons.length === 0 ? (
          <p className="text-sm text-gray-500">
            No lessons yet — browse the course catalog to get started.
          </p>
        ) : (
          /* Grid Tailwind uses grid-cols-#. Its size based so for small device 1, up to 3 on something big like web */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                completed={lesson.completed}
                total={lesson.total}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
