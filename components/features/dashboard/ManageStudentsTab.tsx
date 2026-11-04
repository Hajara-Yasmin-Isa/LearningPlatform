'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getEnrolledStudents, EnrolledStudent } from '@/lib/supabase/instructor'

export function ManageStudentsTab() {
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await getEnrolledStudents(user.id)
        setStudents(data)
      } catch (err) {
        console.error('[ManageStudentsTab]', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p className="text-sm text-gray-500">TODO: copy</p>

  const rows = students.flatMap((student) =>
    student.instructorCourses.map((item) => ({
      studentId: student.studentId,
      name: student.name ?? 'TODO: copy',
      courseId: item.course.id,
      courseTitle: item.course.title,
      completed: item.sectionsCompleted,
      total: item.totalSections,
    }))
  )

  const courseIds = [...new Set(rows.map((row) => row.courseId))]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Students</h3>
        <p className="text-sm text-gray-500">View progress and status for all enrolled students.</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">TODO: copy</p>
      ) : (
        courseIds.map((courseId) => {
          const courseRows = rows.filter((row) => row.courseId === courseId)
          return (
            <div key={courseId} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">{courseRows[0].courseTitle}</h4>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sections completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {courseRows.map((row) => (
                      <tr key={row.studentId}>
                        <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-gray-700">{row.completed} / {row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}