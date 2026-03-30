interface ClassCardProps {
  className: string
  studentCount: number
  activeStudentCount: number
}

export function ClassCard({ className, studentCount, activeStudentCount }: ClassCardProps) {
  const activePercentage = studentCount > 0 ? Math.round((activeStudentCount / studentCount) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
          Active
        </span>
      </div>

      <h3 className="text-base font-semibold text-gray-900 mb-3 leading-snug">{className}</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total students</span>
          <span className="font-medium text-gray-900">{studentCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Active now</span>
          <span className="font-medium text-green-600">{activeStudentCount}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Engagement</span>
          <span>{activePercentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${activePercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
