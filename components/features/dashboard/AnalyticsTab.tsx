const STAT_CARDS = [
  { label: 'Avg. Completion Rate', value: '78%', change: '+4%', up: true },
  { label: 'Lessons Completed', value: '134', change: '+12', up: true },
  { label: 'Avg. Quiz Score', value: '83%', change: '-2%', up: false },
  { label: 'Active This Week', value: '61', change: '+8', up: true },
]

const TOP_LESSONS = [
  { title: 'Intro to Variables', completions: 48, score: 91 },
  { title: 'Control Flow Basics', completions: 42, score: 86 },
  { title: 'Functions & Scope', completions: 37, score: 80 },
  { title: 'Lists and Loops', completions: 34, score: 77 },
]

export function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Analytics Overview</h3>
        <p className="text-sm text-gray-500">Summary across all your classes for the past 30 days.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className={`text-xs font-medium mt-1 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
              {stat.change} vs last month
            </p>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Performing Lessons</h4>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lesson</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Completions</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {TOP_LESSONS.map((lesson) => (
                <tr key={lesson.title}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{lesson.title}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{lesson.completions}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-green-700 font-semibold">{lesson.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Engagement Over Time (placeholder chart)</p>
        <div className="flex items-end gap-1.5 h-20">
          {[40, 55, 50, 70, 65, 80, 78].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-400 rounded-sm opacity-70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
