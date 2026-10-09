'use client'

import { useState, useEffect } from 'react'
import { Exercise } from '@/types/database'

interface MatchingExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

export default function MatchingExercise({ exercise, onComplete }: MatchingExerciseProps) {
  // correct_answer is stored as a JSON string of { term: definition } pairs
  const correctPairs = parsePairs(exercise.correct_answer)
  const terms = Object.keys(correctPairs)

  const [definitions, setDefinitions] = useState<string[]>([])
  const [pairs, setPairs] = useState<Record<string, string>>({})
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [selectedDefinition, setSelectedDefinition] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // shuffle after mount rather than during render: this component is still
  // server-rendered first, and a random order on the server wouldn't match the
  // client's order, which React reports as a hydration mismatch
  useEffect(() => {
    setDefinitions(shuffle(Object.values(correctPairs)))
  }, [exercise.id])

  if (terms.length === 0) {
    return <p className="text-gray-500">This matching exercise has no pairs set up yet.</p>
  }

  const allPaired = terms.every((term) => pairs[term])
  const allCorrect = terms.every((term) => pairs[term] === correctPairs[term])

  function makePair(term: string, definition: string) {
    setPairs((prev) => {
      const next = { ...prev }
      // a definition can only belong to one term, so take it off any other term first
      for (const key of Object.keys(next)) {
        if (next[key] === definition) delete next[key]
      }
      next[term] = definition
      return next
    })
    setSelectedTerm(null)
    setSelectedDefinition(null)
  }

  function selectTerm(term: string) {
    if (submitted) return
    if (selectedTerm === term) return setSelectedTerm(null)   // clicking again deselects
    if (selectedDefinition) return makePair(term, selectedDefinition)
    setSelectedTerm(term)
  }

  function selectDefinition(definition: string) {
    if (submitted) return
    if (selectedDefinition === definition) return setSelectedDefinition(null)
    if (selectedTerm) return makePair(selectedTerm, definition)
    setSelectedDefinition(definition)
  }

  function handleSubmit() {
    setSubmitted(true)
    if (allCorrect) onComplete()
  }

  function handleReset() {
    setPairs({})
    setSelectedTerm(null)
    setSelectedDefinition(null)
    setSubmitted(false)
  }

  return (
    <div>
      <p className="font-medium">{exercise.question}</p>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="space-y-2">
          {terms.map((term) => {
            const paired = pairs[term]
            const isCorrect = paired === correctPairs[term]

            return (
              <button
                key={term}
                onClick={() => selectTerm(term)}
                disabled={submitted}
                className={`w-full text-left border rounded p-3 transition-colors ${
                  selectedTerm === term ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                <span className="font-medium">{term}</span>
                {paired && (
                  <span className="block text-sm text-gray-600 mt-1">
                    → {paired}
                    {submitted && (
                      <span className={isCorrect ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="space-y-2">
          {definitions.map((definition) => {
            const used = Object.values(pairs).includes(definition)

            return (
              <button
                key={definition}
                onClick={() => selectDefinition(definition)}
                disabled={submitted}
                className={`w-full text-left border rounded p-3 transition-colors ${
                  selectedDefinition === definition
                    ? 'bg-blue-100 border-blue-400'
                    : used
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-white hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                {definition}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allPaired || submitted}
        className="mt-3 bg-blue-300 text-blue-900 px-4 py-2 rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit
      </button>

      {submitted && (
        <div className="mt-3">
          {allCorrect ? (
            <p className="text-green-600">All pairs correct!</p>
          ) : (
            <>
              <p className="text-red-600">Some pairs aren&apos;t right. Check the ✗ marks and try again.</p>
              <button
                onClick={handleReset}
                className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * correct_answer comes from the database as a string, so it may be missing or malformed.
 * Returning {} lets the component render a message instead of crashing.
 */
function parsePairs(raw: string | null): Record<string, string> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/** Fisher-Yates shuffle so the definitions don't line up with their terms */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}