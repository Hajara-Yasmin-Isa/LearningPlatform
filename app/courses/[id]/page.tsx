import { getCourseById, isUserEnrolled } from "@/lib/supabase/courses"
import { getLessonsByCourse } from "@/lib/supabase/lessons"
import { EnrollmentButton } from "@/components/features/courses/EnrollmentButton"
import { notFound } from 'next/navigation'
import { createServerClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const course = await getCourseById(id)
    return {
        title: course?.title ?? 'Course Detail'
    }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params

    const course = await getCourseById(id)

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    if (!course) {
        notFound()
    }

    let isEnrolled = false
    if (userId) {
        isEnrolled = await isUserEnrolled(userId, course.id)
    }

    let lessons = []
    let lessonError: string | null = null
    try {
        lessons = await getLessonsByCourse(id)
    } catch (err) {
        lessonError = err instanceof Error ? err.message : 'Failed to load lessons'
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600 mt-2 text-base leading-relaxed">{course.description}</p>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
                <span className="text-sm">
                    Instructor: {course.users?.name ?? 'Unknown'}
                </span>
                <span
                    className={`text-xs px-2 py-1 rounded ${
                        course.difficulty === 'Beginner'
                            ? 'bg-green-100 text-green-700'
                            : course.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                    }`}
                >
                    {course.difficulty}
                </span>
                <span className="text-sm">
                    Duration: {course.duration_minutes} minutes
                </span>
            </div>

            <ul className="space-y-2 mt-4">
                {lessonError && (
                    <li className="text-red-500">{lessonError}</li>
                )}
                {!lessonError && lessons.length === 0 && (
                    <li className="font-bold">No lessons available yet.</li>
                )}
                {lessons.map((lesson, index) => (
                    <li
                        key={lesson.id}
                        className="border rounded-lg p-3 flex items-center gap-3"
                    >
                        Lesson {index + 1}: {lesson.title}
                    </li>
                ))}
            </ul>

            <div className="mt-8">
                <EnrollmentButton
                    userId={userId}
                    courseId={course.id}
                    isEnrolled={isEnrolled}
                    firstLessonId={lessons?.[0]?.id}
                />
            </div>
        </div>
    )
}
