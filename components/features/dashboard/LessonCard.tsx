type LessonCardProps = {
  title: string
  completed: number
  total: number
}

//Exports Lesson Card
export default function LessonCard({ title, completed, total }: LessonCardProps) {
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

      <h3 className="font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mb-3">
        {completed} / {total} completed
      </p>

      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full"
          style={{ width: `${percent}%` }}
        />
      </div>

    </div>
  )
}