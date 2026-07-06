'use client'

import ExerciseBlock from './ExerciseBlock'
import { Exercise, Section } from '@/types/database'
import { useState } from 'react'
import Link from 'next/link'



interface SectionWithExercises extends Section {
    exercises: Exercise[]
}

interface LessonSectionsProps {
    sections: SectionWithExercises[]
    courseId: string
}


export default function LessonSections({ courseId, sections }: LessonSectionsProps) {
    const [activeSectionIndex, setActiveSectionIndex] = useState(0)
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
    const [isComplete, setIsComplete] = useState(false)

    if (sections.length === 0) return <p className="text-gray-500 mt-8">No sections yet.</p>

    const currentSection = sections[activeSectionIndex]
    const isLastSection = activeSectionIndex === sections.length - 1
    

    const isSectionComplete =
        currentSection.exercises.length === 0 ||
        currentSection.exercises.every(ex =>
            completedExercises.has(ex.id)
        )

        

    const handleExerciseComplete = (exerciseId: string) => {
        setCompletedExercises(prev => {
            const next = new Set(prev)
            next.add(exerciseId)
            return next
        })
    }

    function handleNext() {
        if (!isSectionComplete) return

        if (isLastSection) {
            setIsComplete(true)
            return
        }

        setActiveSectionIndex((i) => i + 1)
    }


    function handlePrevious() {
        setActiveSectionIndex((i) => Math.max(0, i - 1))
    }

    if (isComplete) {
        return (
            <p>
                Lesson complete! Back to{" "}
                <Link href={`/courses/${courseId}`}>course</Link>
            </p>
        )
    }

    

    //UI Skeleton
    return (

        <div className="mt-8 space-y-10">

            <div key={currentSection.id}>
                <p className="space-y-4">Section {activeSectionIndex + 1} of {sections.length}</p>
                <h2 className="text-xl font-semibold mb-2">{currentSection.title}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{currentSection.content}</p>

                <div className="space-y-4">
                    {currentSection.exercises.map((exercise) => (
                        <ExerciseBlock
                            key={exercise.id}
                            exercise={exercise}
                            onComplete={() => handleExerciseComplete(exercise.id)}
                        />
                    ))}

                </div>
                <div className="flex justify-between mt-6">
                    <button
                        onClick={handlePrevious}
                        disabled={activeSectionIndex === 0}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-40 hover:bg-gray-300 transition-colors"
                    >
                        ← Previous
                    </button>


                    <button
                        onClick={handleNext}
                        disabled={!isSectionComplete}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
                    >
                        {isLastSection ? 'Finish Lesson' : 'Next Section →'}
                    </button>
                </div>
            </div>

        </div>


    )

}
