type CourseStats = {
  enrollments: number
  totalSections: number
  averageCompletion: number
}

interface AnalyticsTabProps {
  stats: CourseStats[]
}

export function AnalyticsTab({ stats }: AnalyticsTabProps) {
  return (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Analytics Overview
      </h3>
      <p className="text-sm text-gray-500">
        Summary across all your courses.
      </p>
    </div>

    {stats.length === 0 ? (
      <p className="text-sm text-gray-500">
        No course analytics available yet.
      </p>
    ) : (
      <div className="space-y-4">
        {stats.map((course, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-sm text-gray-500">
              Course {index + 1}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.enrollments}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Sections</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.totalSections}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Average Completion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {course.averageCompletion}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
