'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'

interface MultipleChoiceExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

export default function MultipleChoiceExercise({ exercise, onComplete }: MultipleChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const options = exercise.options ?? []

  function handleSubmit() {
    if (!selected || submitted) return
    const correct = selected === exercise.correct_answer
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) onComplete()
  }

  function handleRetry() {
    setSelected(null)
    setSubmitted(false)
    setIsCorrect(false)
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-900">{exercise.question}</p>

      <div className="space-y-2">
        {options.map((option) => {
          let buttonStyle = 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          if (selected === option) {
            buttonStyle = submitted
              ? isCorrect
                ? 'border-green-500 bg-green-50 text-green-800'
                : 'border-red-400 bg-red-50 text-red-800'
              : 'border-blue-500 bg-blue-50 text-blue-800'
          }

          return (
            <button
              key={option}
              onClick={() => !submitted && setSelected(option)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${buttonStyle} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      ) : isCorrect ? null : (
        <button
          onClick={handleRetry}
          className="mt-2 px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
