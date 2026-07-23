'use client'

import { useState, useEffect } from 'react'
import { CourseWithInstructor, Enrollment } from '@/types/database'
import { searchCourses } from '@/lib/supabase/courses'
import { CourseGrid } from '@/components/features/courses/CourseGrid'

interface CourseSearchProps {
  enrollments: Enrollment[]
  userId: string | null
}

export default function CourseSearch({
  enrollments,
  userId,
}: CourseSearchProps) {
  const [courses, setCourses] = useState<CourseWithInstructor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setError(null)
        const results = await searchCourses(searchQuery, difficulty || null)
        setCourses(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.')
      }
    }

    fetchCourses()
  }, [searchQuery, difficulty])

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border px-4 py-2"
        />

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border px-4 py-2"
        >
          <option value="">All</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {courses.length === 0 ? (
        <p>No courses found</p>
      ) : (
        <CourseGrid
          courses={courses}
          enrollments={enrollments}
          userId={userId}
        />
      )}
    </>
  )
}