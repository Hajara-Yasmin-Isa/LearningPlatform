import { getCourseById, isUserEnrolled } from "@/lib/supabase/courses"
import { getLessonsByCourse, getUserProgressForCourse } from "@/lib/supabase/lessons"
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
        isEnrolled = await isUserEnrolled(userId, course.id, supabase)
    }

    const lessons = await getLessonsByCourse(id, supabase)

    const completedLessonIds = new Set(
        userId ? await getUserProgressForCourse(userId, id, supabase) : []
    )

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {message === "enroll-first" && (
                <p className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded mb-4">
                    Don samun darasi, da fatan ka yi rajista a wannan aji.
                </p>
            )}
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600 mt-2 text-base leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
                <span className="text-sm">
                    Maalami: {course.users?.name ?? 'Ba a sani ba'}
                </span>
                <span
                    className={`text-xs px-2 py-1 rounded ${course.difficulty === 'Beginner'
                        ? 'bg-green-100 text-green-700'
                        : course.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                >
                    {course.difficulty}
                </span>
                <span className="text-sm">
                    Tsawon lokaci: mintuna {course.duration_minutes}
                </span>
            </div>
            {!isEnrolled && (
                <p className="mt-4 text-sm text-gray-500">Yi rajista don samun darrusa</p>
            )}

            <ul className="space-y-2 mt-4">
                {lessons?.length === 0 && (
                    <li className="font-bold">Babu darrusa a yanzu.</li>
                )}
                {lessons?.map((lesson, index) => (

                    <li
                        key={lesson.id}
                        className="border rounded-lg p-3 flex items-center gap-3"
                    >

                        { isEnrolled ? (
                            <Link href={`/lessons/${lesson.id}`} className="flex items-center gap-2">
                                {completedLessonIds.has(lesson.id) && (
                                    <span className="text-green-600 font-bold">✓</span>
                                )}
                                Darasi na {index + 1}: {lesson.title}
                            </Link>
                        ) : (
                            <span className="flex items-center gap-2">
                                {completedLessonIds.has(lesson.id) && (
                                    <span className="text-green-600 font-bold">✓</span>
                                )}
                                Darasi na {index + 1}: {lesson.title}
                            </span>
                        )}
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
