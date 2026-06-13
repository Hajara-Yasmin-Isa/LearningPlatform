//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//Import enrollment button. This is because the page is a server component so we can't use client stuff so we have to separate it.
import { EnrollmentButton } from "@/components/features/courses/EnrollmentButton"

//404 not found
import { notFound } from 'next/navigation'

//Fixing PR39: No longer importing supabase, instead creating supabase server client
import { createServerClient } from "@/lib/supabase/server"

//Check user enrolled for enroll button
import { isUserEnrolled } from "@/lib/supabase/courses"

import { getLessonsByCourse } from "@/lib/supabase/lessons"
import { Lesson } from "@/types/database"


export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {

    //fixing PR39: Changed from params: { id: string } to promise, params: Promise<{ id: string }>

    //Grab course ID
    const { id } = await params
    const course = await getCourseById(id)

    //Create supabase client
    const supabase = createServerClient()

    //Grab user from supabase
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id ?? null

    //NextJS notFound() page if course does not exist
    if (!course) {
        notFound()
    }

    //Code block to check if user is enrolled
    let isEnrolled = false

    if (userId) {
        isEnrolled = await isUserEnrolled(userId, course.id)
    }
    
    //Safe way to see if Lessons do not exist. Creates lessonError which is passed into the return JSX 
    let lessons: Lesson[] = []
    let lessonError: string | null = null

    try {
        lessons = await getLessonsByCourse(id)
    } catch (err) {
        lessonError =
            err instanceof Error ? err.message : "Failed to load lessons"
    }

    // UI Skeleton
    return (
        <div>
            <h1 className="flex text-2xl font-bold py-10 justify-center">{course.title}</h1>
            <p className="text-gray-600 py-4 bg-white px-5">{course.description}</p>

            <p className="text-sm py-4">Instructor: {course.users?.name}</p>
            <span className="text-xs px-2 py-4 rounded bg-green-100 text-green-700">
                {course.difficulty}
            </span>

            <p className="text-sm py-4">
                Duration: {course.duration_minutes} minutes
            </p>
            <div className="border rounded-lg bg-slate-500">
                <ul className="px-2 py-2 mt-4 space-y-5">
                    {/*Show userfacing error instead of crashing page if lesson did not load*/}
                    {lessonError && (
                        <p className="text-red-500">{lessonError}</p>
                    )}
                    {/*If lessons length is 0, fall back UI*/}
                    {lessons?.length === 0 && (
                        <p className="font-bold">No lessons available yet.</p>
                    )}
                    {lessons?.map((lesson) =>
                        <li key={lesson.id} className="border p-2 rounded-lg bg-slate-200">
                            {lesson.title}
                        </li>
                    )}
                </ul>
            </div>

            <div className="mt-6">
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