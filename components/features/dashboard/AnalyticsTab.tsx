import LoadingScreen from '@/components/ui/LoadingScreen'
import type { InstructorCourseStats } from '@/types/database'
import type { LoadStatus } from './dashboardTypes'

// Review notes (A1.4): this tab is presentational. The parent loads the data once
// and passes it down with a status, so the tab can tell "still loading" from
// "loaded, nothing there" from "failed". The first version started with an empty
// array and no status, so it showed the empty-state text while the fetch was still
// running and also whenever the fetch had failed.

interface AnalyticsTabProps {
  stats: InstructorCourseStats[]
  status: LoadStatus
}

export function AnalyticsTab({ stats, status }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Analytics Overview</h3>
        <p className="text-sm text-gray-500">Summary across all your courses.</p>
      </div>

      {status === 'loading' && <LoadingScreen />}

      {status === 'error' && (
        <p className="text-sm text-red-600">Could not load analytics. Refresh the page to try again.</p>
      )}

      {status === 'ready' && stats.length === 0 && (
        <p className="text-sm text-gray-500">No course analytics available yet.</p>
      )}

      {status === 'ready' && stats.length > 0 && (
        <div className="space-y-4">
          {/* Keyed by course id, not array index: a stable key keeps each card's DOM
              tied to its course if the order ever changes between fetches. */}
          {stats.map((course) => (
            <div key={course.courseId} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-gray-900">{course.title}</p>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900">{course.enrollments}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sections</p>
                  <p className="text-2xl font-bold text-gray-900">{course.totalSections}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{course.averageCompletion}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
