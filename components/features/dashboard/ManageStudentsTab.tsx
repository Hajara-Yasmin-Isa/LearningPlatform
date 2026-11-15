import LoadingScreen from '@/components/ui/LoadingScreen'
import type { EnrolledStudent } from '@/types/database'
import type { LoadStatus } from './dashboardTypes'

// Review notes (A1.3): this tab no longer fetches anything. The first version
// resolved the user and ran the whole student query chain inside this component,
// which meant the chain re-ran every time the instructor switched tabs (the tab
// is unmounted and remounted by the parent). The parent now loads once and passes
// the result down; this file only groups and renders.

interface ManageStudentsTabProps {
  students: EnrolledStudent[]
  status: LoadStatus
}

export function ManageStudentsTab({ students, status }: ManageStudentsTabProps) {
  // One row per (student, course), then grouped by course for display.
  // A1.3: display name and progress only — no emails.
  const rows = students.flatMap((student) =>
    student.courses.map((course) => ({
      studentId: student.studentId,
      name: student.name ?? 'Unnamed student',
      ...course,
    }))
  )
  const byCourse = new Map<string, typeof rows>()
  for (const row of rows) {
    const list = byCourse.get(row.courseId) ?? []
    list.push(row)
    byCourse.set(row.courseId, list)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Students</h3>
        <p className="text-sm text-gray-500">View progress and status for all enrolled students.</p>
      </div>

      {status === 'loading' && <LoadingScreen />}

      {status === 'error' && (
        <p className="text-sm text-red-600">Could not load students. Refresh the page to try again.</p>
      )}

      {/* Empty-state copy is owned by the card ("TODO: copy" is the placeholder convention). */}
      {status === 'ready' && rows.length === 0 && <p className="text-sm text-gray-500">TODO: copy</p>}

      {status === 'ready' &&
        [...byCourse.entries()].map(([courseId, courseRows]) => (
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
                    // A student appears once per course, so the key needs both ids.
                    <tr key={`${row.studentId}-${row.courseId}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.sectionsCompleted} / {row.totalSections}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  )
}
