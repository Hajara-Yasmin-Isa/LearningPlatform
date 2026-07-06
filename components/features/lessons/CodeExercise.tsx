'use client'

import { useState } from 'react'
import { Exercise } from '@/types/database'
import type { RunCodeResult } from '@/learning-engine/code-runner/runCode'

interface CodeExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

export default function CodeExercise({ exercise, onComplete }: CodeExerciseProps) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<RunCodeResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data: RunCodeResult = await res.json()
      setResult(data)
      if (data.passed) {
        onComplete()
      }
    } catch {
      setResult({ passed: false, output: null, error: "Server couldn't be reached. Please try again." })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div>
      <p className="font-medium">{exercise.question}</p>
      <textarea
        className="font-mono w-full border rounded p-3 mt-2"
        rows={8}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="mt-2 bg-blue-300 text-blue-900 px-4 py-2 rounded hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? 'Running...' : 'Run Code'}
      </button>

      {result && (
        <div className="mt-3">
          {result.output && <pre className="text-sm bg-gray-50 p-3 rounded">{result.output}</pre>}
          {result.passed ? (
            <p className="text-green-600 mt-2">All tests passed!</p>
          ) : (
            <p className="text-red-600 mt-2">{result.error ?? 'Tests failed. Try again.'}</p>
          )}
        </div>
      )}
    </div>
  )
}
