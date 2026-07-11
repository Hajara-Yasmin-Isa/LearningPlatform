import { getCourseById, isUserEnrolled } from "@/lib/supabase/courses"
import { getLessonsByCourse } from "@/lib/supabase/lessons"
import { EnrollmentButton } from "@/components/features/courses/EnrollmentButton"
import { notFound } from 'next/navigation'
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const course = await getCourseById(id)
    return {
        title: course?.title ?? 'Course Detail'
    }
}

export default async function CourseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ message?: string }> }) {

    const { id } = await params

    const { message } = await searchParams

    const supabase = await createServerClient()

    const course = await getCourseById(id)

    const { data: { user } } = await supabase.auth.getUser()

    const userId = user?.id ?? null

    if (!course) {
        notFound()
    }

    let isEnrolled = false

    if (userId) {
        isEnrolled = await isUserEnrolled(userId, course.id)
    }

    const lessons = await getLessonsByCourse(id, supabase)

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            { message === "enroll-first" && (
    <p className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded mb-4">
        Please enroll in this course to access lessons.
    </p>
)}
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
            <h2 className = "text-xl font-semibold mt-8 mb-3">
                Course Lessons
            </h2>
            <ul className="space-y-2 mt-4">
                {lessons?.length === 0 && (
                    <li className="font-bold">No lessons available yet.</li>
                )}
                {lessons?.map((lesson, index) => (
                    isEnrolled ? (
                        <li key={lesson.id}>
                            <Link href={`/lessons/${lesson.id}`}
                               className="block border rounded-lg p-3 hover:bg-indigo-50 transition-colors"
                               >
                               Lesson {index + 1}: {lesson.title}
                            </Link>
                        </li>
                    ) : (
                        <li
                        key={lesson.id}
                        className="border rounded-lg p-3 flex items-center gap-3 text-gray-400" >
                            🔒 Lesson {index + 1}: {lesson.title}
            
                    </li>
                    )
                ))}
            </ul>

            {isEnrolled && lessons?.length > 0 && (
                <Link href={`/lessons/${lessons[0].id}`} className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                    Continue Learning →
                </Link>
            )}

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
