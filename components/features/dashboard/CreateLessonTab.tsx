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
          <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200" />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Assign to Class</label>
          <div className="w-full h-10 bg-gray-100 rounded-lg border border-gray-200" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Lesson Description</label>
        <div className="w-full h-24 bg-gray-100 rounded-lg border border-gray-200" />
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

      <div className="border-t border-gray-100 pt-4 flex gap-3">
        <div className="h-10 w-28 bg-blue-600 rounded-lg opacity-80" />
        <div className="h-10 w-24 bg-gray-100 rounded-lg border border-gray-200" />
      </div>
    </div>
  )
}
