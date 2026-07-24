interface ProgressBarProps {
    completed: number
    total: number
    className?: string
}

export default function ProgressBar({ completed, total, className }: ProgressBarProps) {

    if (total === 0) { return <p className="text-gray-500 mt-8">Babu sashe tukuna</p> }

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100) 

    return (
        <div className={className}>
            <p className="text-xs text-gray-500 mb-1">
                {total === 0
                    ? "Babu sashe tukuna"
                    : `Sashen ${completed} cikin ${total} an kammala`}
            </p>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}