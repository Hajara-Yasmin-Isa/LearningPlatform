'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'
import MultipleChoiceExercise from './MultipleChoiceExercise'
import TextExercise from './TextExercise'
import CodeExercise from './CodeExercise';

interface ExerciseBlockProps {
  exercise: Exercise
  onComplete: () => void
}

export default function ExerciseBlock({ exercise, onComplete }: ExerciseBlockProps) {
  const [completed, setCompleted] = useState(false)

  function handleComplete() {
    setCompleted(true)
    onComplete()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {completed && (
        <div className="flex items-center gap-2 mb-4 text-green-600 font-medium">
          <span className="text-lg">✓</span>
          <span>Correct!</span>
        </div>
      )}

      {exercise.exercise_type === 'multiple_choice' && (
        <MultipleChoiceExercise exercise={exercise} onComplete={handleComplete} />
      )}

      {exercise.exercise_type === 'text' && (
        <TextExercise exercise={exercise} onComplete={handleComplete} />
      )}

      {exercise.exercise_type === 'code' && (
        <CodeExercise exercise={exercise} onComplete={handleComplete} />
      )}
    </div>
  )
}
