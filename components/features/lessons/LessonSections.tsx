'use client'

import ExerciseBlock from './ExerciseBlock'
import { Exercise, Section, Lesson } from '@/types/database'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUserProgress, markSectionComplete, getLessonsByCourse, checkAndMarkLessonComplete } from '@/lib/supabase/lessons'



interface SectionWithExercises extends Section {
    exercises: Exercise[]
}

interface LessonSectionsProps {
    sections: SectionWithExercises[]
    courseId: string
    userId: string | null
    lessonId: string
    lessonOrder: number
}


export default function LessonSections({ courseId, sections, userId, lessonId, lessonOrder }: LessonSectionsProps) {
    const [activeSectionIndex, setActiveSectionIndex] = useState(0)
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
    const [isComplete, setIsComplete] = useState(false)
    const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
    const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return
        getUserProgress(userId, lessonId)
            .then((rows) => {
                const done = new Set(
                    rows
                        .filter((row) => row.completed && row.section_id !== null)
                        .map((row) => row.section_id as string)
                )
                setCompletedSections(done)
                // Resume at the first section the student hasn't completed yet
                const firstIncomplete = sections.findIndex((s) => !done.has(s.id))
                if (firstIncomplete > 0) setActiveSectionIndex(firstIncomplete)
            })
            .catch(console.error)
    }, [userId, lessonId])

    if (sections.length === 0) return <p className="text-gray-500 mt-8">No sections yet.</p>

    const currentSection = sections[activeSectionIndex]
    const isLastSection = activeSectionIndex === sections.length - 1

    const isSectionComplete =
        currentSection.exercises.length === 0 ||
        currentSection.exercises.every(ex => completedExercises.has(ex.id))

    const handleExerciseComplete = (exerciseId: string) => {
        setCompletedExercises(prev => {
            const next = new Set(prev)
            next.add(exerciseId)
            return next
        })
    }

    async function saveSectionComplete(sectionId: string) {
        if (!userId || completedSections.has(sectionId)) return
        await markSectionComplete(userId, lessonId, sectionId)
        setCompletedSections((prev) => new Set(prev).add(sectionId))
    }

    async function handleNext() {
        if (!isSectionComplete) return
        setSaveError(null)
        try {
            await saveSectionComplete(currentSection.id)

            if (isLastSection) {
                if (userId) await checkAndMarkLessonComplete(userId, lessonId)
                const lessons = await getLessonsByCourse(courseId)
                const next = lessons.find((l) => l.lesson_order === lessonOrder + 1) ?? null
                setNextLesson(next)
                setIsComplete(true)
                return
            }

            setActiveSectionIndex((i) => i + 1)
        } catch (err) {
            setSaveError('Failed to save progress. Please try again.')
            console.error(err)
        }
    }

    function handlePrevious() {
        setActiveSectionIndex((i) => Math.max(0, i - 1))
    }

    if (isComplete) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 mt-10 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-green-800 font-semibold text-xl">Lesson complete!</p>
                <p className="text-green-700 text-sm mt-1 mb-6">Great work. Keep going.</p>
                {nextLesson ? (
                    <Link
                        href={`/lessons/${nextLesson.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                    >
                        Next Lesson: {nextLesson.title} →
                    </Link>
                ) : (
                    <div>
                        <p className="text-green-700 font-medium mb-3">You've finished all the lessons in this course!</p>
                        <Link
                            href="/dashboard"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                        >
                            Back to Dashboard →
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    //UI Skeleton
    return (
        <div className="mt-8 space-y-10">
            <div key={currentSection.id}>
                <p className="space-y-4">Section {activeSectionIndex + 1} of {sections.length}</p>
                <h2 className="text-xl font-semibold mb-2">
                    {currentSection.title}
                    {completedSections.has(currentSection.id) && (
                        <span className="text-green-500 ml-2 text-lg">✓</span>
                    )}
                </h2>
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
                {saveError && (
                    <p className="text-red-500 text-sm mt-2">{saveError}</p>
                )}
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
