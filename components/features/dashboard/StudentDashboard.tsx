'use client'

import { useState, useEffect } from "react"
import LessonCard from "./LessonCard"
import StatsCard from "./StatsCard"
import { supabase } from "@/lib/supabase/client"
import { getUserLessons } from "@/lib/supabase/queries"
import { UserLesson } from "@/types/database"

export default function StudentDashboard() {
  const [lessons, setLessons] = useState<UserLesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLessons() {
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

  const lessonsCompleted = lessons.filter((l) => l.completed === true).length
  const activeLessons = lessons.filter((l) => l.completed === false).length
  const overallProgress = lessons.length > 0
    ? Math.round((lessonsCompleted / lessons.length) * 100)
    : 0

  const stats = [
    { label: "Lessons Completed", value: String(lessonsCompleted) },
    { label: "Active Lessons", value: String(activeLessons) },
    { label: "Overall Progress", value: `${overallProgress}%` },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                completed={lesson.completed ? 1 : 0}
                total={lesson.total}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
