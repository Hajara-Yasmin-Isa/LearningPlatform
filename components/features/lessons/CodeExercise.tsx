'use client'
import { Exercise } from '@/types/database'
import { useState } from 'react'

interface TestCaseResult {
  input: unknown[];   // the input values for the test case
  expected: unknown;   // the expected output value (what we want back)
  actual: unknown;   // what the student's code actually returned
  passed: boolean;   // do the outputs match? did it pass or fail?
}

interface RunCodeResult { 
    passed: boolean
    output: string | null
    error: string | null
    details?: TestCaseResult[] }

interface CodeExerciseProps {
  exercise: Exercise
  onComplete: () => void
}

export default function CodeExercise({ exercise, onComplete }: CodeExerciseProps) {
    // text area shows the student's code
    const [code, setCode] = useState('')
    // result section shows pass/fail, the output text, and error message
    const [result, setResult] = useState<RunCodeResult | null>(null)
    //  button shows "Run Code, Running" and enabled vs disabled
    const [isRunning, setIsRunning] = useState(false)
    const handleRun = async () => {
        setIsRunning(true)
        try {
            const res = await fetch('/api/run-code', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code}),
            })
            const data: RunCodeResult = await res.json()
            setResult(data)
            if (data.passed) {
                onComplete()
            }
        } catch {
            setResult({passed: false, output: null, error: "Server couldn't be reached. Please try again."})
        }
        setIsRunning(false)
    }
    return (
        <div>
            <p className="font-medium">{exercise.question}</p>
            <textarea className="font-mono w-full border rounded p-3" value={code} onChange={(e) => setCode(e.target.value)} />
            <button onClick={handleRun}>Run Code</button>

            {result && (
                <div>
                    {result.output && <pre>{result.output}</pre>}
                    {result.passed ? (
                        <p className="text-green-600">All tests passed!</p>
                    ) : (
                        <p className="text-red-600">{result.error ?? 'Tests failed. Try again.'}</p>

                    )}
                </div>
            )}
        </div>
    )
}