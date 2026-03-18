type StatsCardProps = {
  label: string
  value: string
}

//Exports stats card
export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-2xl font-semibold text-gray-900 mt-1">
        {value}
      </p>

    </div>
  )
}