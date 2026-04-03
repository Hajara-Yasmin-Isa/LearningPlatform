'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'

interface TextExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

export default function TextExercise({ exercise, onComplete }: TextExerciseProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  function handleSubmit() {
    if (!answer.trim() || submitted) return
    const correct = answer.trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) onComplete()
  }

  function handleRetry() {
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-900">{exercise.question}</p>

      <input
        type="text"
        value={answer}
        onChange={(e) => !submitted && setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
        placeholder="Type your answer..."
        readOnly={submitted}
        className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
          submitted
            ? isCorrect
              ? 'border-green-500 bg-green-50 text-green-800'
              : 'border-red-400 bg-red-50 text-red-800'
            : 'border-gray-300 focus:border-blue-500 bg-white'
        }`}
      />

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Submit
        </button>
      ) : isCorrect ? null : (
        <button
          onClick={handleRetry}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
