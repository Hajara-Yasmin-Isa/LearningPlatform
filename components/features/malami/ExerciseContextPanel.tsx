// Keeps the exercise in front of the learner while they talk about it.
//
// Malami opens in its own page, so without this the learner is arguing about a question
// they can no longer read — and cannot tell when the model has wandered off it, which is
// exactly when they most need to notice.
//
// Deliberately never shows the correct answer. The page fetches only the question and the
// options, so the answer is not in the payload to leak by accident.

export interface ExerciseSummary {
    question: string
    options: string[] | null
    userAnswer?: string
}

export default function ExerciseContextPanel({ exercise }: { exercise: ExerciseSummary }) {
    return (
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            {/* TODO: copy — Hausa wording from the team lead */}
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                The exercise
            </p>
            <p className="mt-1 text-sm text-gray-900">{exercise.question}</p>

            {exercise.options && exercise.options.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {exercise.options.map((option) => (
                        <li
                            key={option}
                            className={`rounded-full border px-2.5 py-0.5 text-xs ${
                                option === exercise.userAnswer
                                    ? 'border-red-300 bg-red-50 text-red-800'
                                    : 'border-gray-300 bg-white text-gray-600'
                            }`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}

            {exercise.userAnswer && (
                <p className="mt-2 text-xs text-gray-600">
                    {/* TODO: copy */}
                    You answered:{' '}
                    <span className="font-medium text-gray-900">{exercise.userAnswer}</span>
                </p>
            )}
        </div>
    )
}
