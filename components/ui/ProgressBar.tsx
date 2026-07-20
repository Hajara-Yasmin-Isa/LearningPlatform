interface ProgressBarProps {
    completed: number
    total: number
    className?: string
}

export default function ProgressBar({ completed, total, className }: ProgressBarProps) {

    if (total === 0) { return <p className="text-gray-500 mt-8">Babu sashe tukuna</p>} 

    const percentage = total === 0 ? 0 : Math.round(completed/total)
    
    return (
        <>
        ██████░░░░░
        </>
    )
}