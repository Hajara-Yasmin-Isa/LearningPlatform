const STUDENTS = [
  { name: 'Alice Nguyen', class: 'Python Fundamentals', progress: 88, status: 'On track' },
  { name: 'Ben Carter', class: 'Web Dev 101', progress: 62, status: 'Needs attention' },
  { name: 'Clara Smith', class: 'Python Fundamentals', progress: 95, status: 'On track' },
  { name: 'David Park', class: 'Data Structures', progress: 45, status: 'At risk' },
  { name: 'Eva Martinez', class: 'Web Dev 101', progress: 78, status: 'On track' },
  { name: 'Frank Lee', class: 'Data Structures', progress: 70, status: 'On track' },
]

const STATUS_STYLES: Record<string, string> = {
  'On track': 'bg-green-100 text-green-700',
  'Needs attention': 'bg-yellow-100 text-yellow-700',
  'At risk': 'bg-red-100 text-red-600',
}

export function ManageStudentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Students</h3>
          <p className="text-sm text-gray-500">View progress and status for all enrolled students.</p>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-gray-100 rounded-lg border border-gray-200" />
          <div className="h-9 w-24 bg-blue-600 rounded-lg opacity-80" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All Classes', 'Python Fundamentals', 'Web Dev 101', 'Data Structures'].map((filter, i) => (
          <span
            key={filter}
            className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-default ${
              i === 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {filter}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Class</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {STUDENTS.map((student) => (
              <tr key={student.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                      {student.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{student.class}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-gray-700 text-xs font-medium">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[student.status]}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-blue-600 text-xs font-medium cursor-default hover:underline">
                    View
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
