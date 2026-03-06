'use client'

import LessonCard  from "./LessonCard"
import StatsCard  from "./StatsCard"

//DUMMY data that is mapped onto LessonCard.tsx component
const DUMMY_LESSONS = [
  { title: 'Spanish Basics', completed: 3, total: 5 },
  { title: 'Grammar Foundations', completed: 2, total: 4 },
  { title: 'Conversation Practice', completed: 1, total: 6 },
  { title: 'Listening Exercises', completed: 4, total: 8 },
]

//Dummy stats mapped onto StatsCard.tsx component.
const STATS = [
  { label: 'Lessons Completed', value: '5' },
  { label: 'Active Lessons', value: '4' },
  { label: 'Overall Progress', value: '48%' },
]

export default function StudentDashboard() {
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
          {STATS.map((stat) => (
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

        {/* Grid Tailwind uses grid-cols-#. Its size based so for small device 1, up to 3 on something big like web */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DUMMY_LESSONS.map((lesson) => (
            <LessonCard
              key={lesson.title}
              title={lesson.title}
              completed={lesson.completed}
              total={lesson.total}
            />
          ))}
        </div>
      </section>

    </div>
  )
}