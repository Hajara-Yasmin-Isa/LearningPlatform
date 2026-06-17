'use client'

import ExerciseBlock from './ExerciseBlock'
import { Exercise, Section } from '@/types/database'

interface SectionWithExercises extends Section {
    exercises: Exercise[]
}

interface LessonSectionsProps {
    sections: SectionWithExercises[]
}

export default function LessonSections({ sections }: LessonSectionsProps) {
    return (
        <div className="mt-8 space-y-10">
            {sections.map((section) => (
                <div key={section.id}>
                    <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>

                    <div className="space-y-4">
                        {section.exercises.map((exercise) => (
                            <ExerciseBlock
                                key={exercise.id}
                                exercise={exercise}
                                onComplete={() => {}}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
