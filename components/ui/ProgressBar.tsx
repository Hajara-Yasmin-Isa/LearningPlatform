interface ProgressBarProps {
    completed: number
    total: number
    className?: string
}

export default function ProgressBar({ completed, total, className }: ProgressBarProps) {
    if (total === 0) {}
}