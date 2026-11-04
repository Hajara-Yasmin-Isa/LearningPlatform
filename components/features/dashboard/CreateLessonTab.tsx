const EXAMPLE_SECTIONS = [
  {
    title: 'What is a variable?',
    content: 'A variable is a named box that stores a value your program can use later.',
  },
  {
    title: 'Naming your variables',
    content: 'Good names describe what the value means, like studentCount instead of x.',
  },
]

export function CreateLessonTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Create a New Lesson</h3>
        <p className="text-sm text-gray-500">Fill in the details below to draft and publish a lesson.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Lesson Title</label>
          <input className="w-full h-10 bg-white rounded-lg border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter lesson title"
            type="text"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Assign to Class</label>
          <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Lesson Description</label>
        <textarea className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          rows={4}
          placeholder="Enter lesson title"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Sections</label>
        {EXAMPLE_SECTIONS.map((section, index) => (
          <div
            key={section.title}
            className="p-4 space-y-3 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Section {index + 1}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Section title"
              className="w-full h-10 bg-white rounded-lg border border-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <textarea
              rows={4}
              placeholder="Section content"
              className="w-full bg-white rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          className="px-2 py-1 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Add Section
        </button>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Content Type</label>
        <div className="flex gap-3">
          {['Video', 'Reading', 'Quiz', 'Interactive'].map((type) => (
            <span
              key={type}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-gray-50 cursor-default"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
        <button
          type="button"
          disabled
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Save lesson
        </button>
        <p className="text-sm text-gray-500">Saving arrives next sprint</p>
      </div>
    </div>
  )
}