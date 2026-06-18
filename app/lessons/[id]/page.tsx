'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  getLessonWithSections,
  getUserProgress,
  markSectionComplete,
  LessonWithSections,
} from '@/lib/supabase/lessons'
import ExerciseBlock from '@/components/features/lessons/ExerciseBlock'

export default function LessonPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [lesson, setLesson] = useState<LessonWithSections | null>(null)
  const [completedSectionIds, setCompletedSectionIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUserId(user.id)

        const [lessonData, progressData] = await Promise.all([
          getLessonWithSections(id),
          getUserProgress(user.id, id),
        ])

        if (!lessonData) {
          setError('Lesson not found.')
          setLoading(false)
          return
        }

        setLesson(lessonData)
        setCompletedSectionIds(
          new Set(
            progressData
              .filter((p) => p.completed && p.section_id)
              .map((p) => p.section_id as string)
          )
        )
      } catch {
        setError('Something went wrong loading this lesson.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, router])

  async function handleMarkComplete(sectionId: string) {
    if (!userId || !lesson) return
    try {
      await markSectionComplete(userId, lesson.id, sectionId)
      setCompletedSectionIds((prev) => new Set([...prev, sectionId]))
    } catch {
      // user can retry — no UI change on failure
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading lesson...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{lesson.title}</h1>

      <div className="space-y-10">
        {lesson.sections.map((section) => {
          const isCompleted = completedSectionIds.has(section.id)

          return (
            <div
              key={section.id}
              className={`rounded-2xl border p-6 ${
                isCompleted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <span>✓</span> Completed
                  </span>
                )}
              </div>

              {section.content && (
                <p className="text-gray-700 mb-6 leading-relaxed">{section.content}</p>
              )}

              {section.exercises.length > 0 && (
                <div className="space-y-4 mb-6">
                  {section.exercises.map((exercise) => (
                    <ExerciseBlock
                      key={exercise.id}
                      exercise={exercise}
                      onComplete={() => {}}
                    />
                  ))}
                </div>
              )}

              {!isCompleted && (
                <button
                  onClick={() => handleMarkComplete(section.id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Mark as complete
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
