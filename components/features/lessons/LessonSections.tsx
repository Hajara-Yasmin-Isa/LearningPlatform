'use client'

import ExerciseBlock from './ExerciseBlock'
import { Exercise, Section } from '@/types/database'
import { useState } from 'react'



interface SectionWithExercises extends Section {
    exercises: Exercise[]
}

interface LessonSectionsProps {
    sections: SectionWithExercises[]
}


export default function LessonSections({ sections }: LessonSectionsProps) {
    const [activeSectionIndex, setActiveSectionIndex] = useState(0)
    const currentSection = sections[activeSectionIndex]
    const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())

    const handleSectionComplete = () => {
        setCompletedSections((prev) => {
            const next = new Set(prev)
            next.add(activeSectionIndex)
            return next
        })
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
                            onComplete={() => { handleSectionComplete }}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}
