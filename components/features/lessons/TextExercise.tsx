'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'
import { gradeShortAnswer, isSelfCheckAnswer } from '@/lib/content/answerGrading'

interface TextExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

// Short answers are graded automatically with Hausa-aware normalization
// (hooked letters, apostrophes, punctuation and spacing are forgiven).
// Essay-style answers are shown the book's model answer to compare against,
// and the learner confirms — the same self-check the printed book asks for.
export default function TextExercise({ exercise, onComplete }: TextExerciseProps) {
  const selfCheck = isSelfCheckAnswer(exercise.correct_answer)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  function handleSubmit() {
    if (!answer.trim() || submitted) return
    if (selfCheck) {
      setSubmitted(true)
      return
    }
    const correct = gradeShortAnswer(answer, exercise.correct_answer)
    setIsCorrect(correct)
    setSubmitted(true)
    if (correct) onComplete()
  }

  function handleConfirmSelfCheck() {
    setIsCorrect(true)
    onComplete()
  }

  function handleRetry() {
    if (!selfCheck) setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)
  }

  const inputStyle = `w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
    submitted
      ? isCorrect || selfCheck
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-red-400 bg-red-50 text-red-800'
      : 'border-gray-300 focus:border-blue-500 bg-white'
  }`

  return (
    <div className="space-y-3">
      <p className="font-medium text-gray-900">{exercise.question}</p>

      {selfCheck ? (
        <textarea
          value={answer}
          onChange={(e) => !submitted && setAnswer(e.target.value)}
          placeholder="Rubuta amsarka a nan..."
          readOnly={submitted}
          rows={3}
          className={inputStyle}
        />
      ) : (
        <input
          type="text"
          value={answer}
          onChange={(e) => !submitted && setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && handleSubmit()}
          placeholder="Rubuta amsarka a nan..."
          readOnly={submitted}
          className={inputStyle}
        />
      )}

      {selfCheck && submitted && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">Amsar littafi:</p>
          <p className="text-gray-800">{exercise.correct_answer}</p>
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          {selfCheck ? 'Duba amsar littafi' : 'Aika amsa'}
        </button>
      ) : isCorrect ? null : selfCheck ? (
        <div className="flex gap-2">
          <button
            onClick={handleConfirmSelfCheck}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Na samu daidai ✓
          </button>
          <button
            onClick={handleRetry}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Zan sake gwadawa
          </button>
        </div>
      ) : (
        <button
          onClick={handleRetry}
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Sake gwadawa
        </button>
      )}
    </div>
  )
}
