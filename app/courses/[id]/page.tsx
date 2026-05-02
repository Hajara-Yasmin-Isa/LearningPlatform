//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//Import enrollment button. This is because the page is a server component so we can't use client stuff so we have to separate it.
import { EnrollmentButton } from "@/components/features/courses/EnrollmentButton"

//404 not found
import { notFound } from 'next/navigation'

import { supabase } from "@/lib/supabase/client"

//Check user enrolled for enroll button
import { isUserEnrolled } from "@/lib/supabase/courses"


export default async function CourseDetailPage({ params }: { params: { id: string } }) {

    /*Grabbing information*/

    //Grab course ID
    const course = await getCourseById(params.id)
    const id = params.id
    console.log(id)

    //Grab User ID
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id ?? null

    if (!course) {
        notFound()
    }

    let isEnrolled = false

    if (userId) {
        isEnrolled = await isUserEnrolled(userId, course.id)
    }

    //Console log test to see if the lessons are queried. Should be removed.
    const { data } = await supabase .from("lessons").select("*")
    console.log(data)

    //This has to be fixed. I think the DB Lesson table does not have a column to refer to what course it is a lesson for.
    //UPDATE: The column was added called "course_id" (I believe thats what its called)
    //This is the SQL query to pull lessons
    const { data: lessons, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("lesson_order", { ascending: true })


    if (error) {
        throw new Error(error.message)
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