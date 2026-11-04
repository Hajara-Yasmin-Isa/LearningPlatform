'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'
import MultipleChoiceExercise from './MultipleChoiceExercise'
import TextExercise from './TextExercise'
import CodeExercise from './CodeExercise';
import AskMalamiButton from './AskMalamiButton'

interface ExerciseBlockProps {
  exercise: Exercise
  onComplete: () => void
}

export default function ExerciseBlock({ exercise, onComplete }: ExerciseBlockProps) {
  const [completed, setCompleted] = useState(false)
  // The last answer that was graded wrong. Each exercise type grades differently and keeps
  // that detail to itself, so failure is reported up to here where the shared "ask Malami"
  // affordance lives. Null until the learner has actually got something wrong, which is
  // what keeps the affordance hidden before the first attempt.
  const [failedAnswer, setFailedAnswer] = useState<string | null>(null)

  function handleComplete() {
    setCompleted(true)
    setFailedAnswer(null)
    onComplete()
  }

  function handleFailedAttempt(userAnswer: string) {
    setFailedAnswer(userAnswer)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {completed && (
        <div className="flex items-center gap-2 mb-4 text-green-600 font-medium">
          <span className="text-lg">✓</span>
          <span>Daidai ne!</span>
        </div>
      )}

      {exercise.exercise_type === 'multiple_choice' && (
        <MultipleChoiceExercise
          exercise={exercise}
          onComplete={handleComplete}
          onFailedAttempt={handleFailedAttempt}
        />
      )}

      {exercise.exercise_type === 'text' && (
        <TextExercise
          exercise={exercise}
          onComplete={handleComplete}
          onFailedAttempt={handleFailedAttempt}
        />
      )}

      {exercise.exercise_type === 'code' && (
        <CodeExercise
          exercise={exercise}
          onComplete={handleComplete}
          onFailedAttempt={handleFailedAttempt}
        />
      )}

      {!completed && failedAnswer !== null && (
        <div className="mt-3">
          <AskMalamiButton exerciseId={exercise.id} userAnswer={failedAnswer} />
        </div>
      )}
    </div>
  )
}
