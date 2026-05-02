//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//Import enrollment button. This is because the page is a server component so we can't use client stuff so we have to separate it.
import { EnrollButton } from "@/components/features/courses/EnrollmentButton"

//404 not found
import { notFound } from 'next/navigation'

import { supabase } from "@/lib/supabase/client"


export default async function CourseDetailPage({ params }: { params: { id: string } }) {
    const course = await getCourseById(params.id)
    const id = params.id
    console.log(id)

    if (!course) {
        notFound()
    }

    const { data } = await supabase .from("lessons").select("*")
    console.log(data)
    //This has to be fixed. I think the DB Lesson table does not have a column to refer to what course it is a lesson for.
    const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*")


    if (error) {
        throw new Error(error.message)
    }

    // UI Skeleton
    return (
        <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>

            <p className="text-sm">Instructor: {course.users?.name}</p>
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                {course.difficulty}
            </span>

            <p className="text-sm">
                Duration: {course.duration_minutes} minutes
            </p>
            <div className="border rounded-lg bg-slate-500">
                <ul className="px-2 py-2 mt-4 space-y-5">

                    {lessons?.map((lesson) =>
                        <li key={lesson.id} className="border p-2 rounded-lg bg-slate-200">
                            {lesson.title}
                        </li>
                    )}
                </ul>
            </div>

            <div className="mt-6">
                <EnrollButton
                    userId={null}          // temporary
                    courseId={course.id}
                    isEnrolled={false}     // temporary
                    firstLessonId={lessons?.[0]?.id} // 
                />
            </div>
        </div>

    )
}