//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//404 not found
import { notFound } from 'next/navigation'

import { enrollInCourse } from "@/lib/supabase/courses"
import { supabase } from "@/lib/supabase/client"

export default async function CourseDetailPage({ params }: {params: {id: string}}) {
    const course = await getCourseById(params.id)
    const id = await params.id
    
    if (!course) {
        notFound()
    } 
    
    //This has to be fixed. I think the DB Lesson table does not have a column to refer to what course it is a lesson for.
    const { data: lessons, error} = await supabase
        .from("lessons")
        .select("*")
        .eq('id', id)
        .order("lesson_order", { ascending: true })

        if (error) {
            throw new Error(error.message)
        }

    /* SAMPLE COURSE AND LESSONS DATA */
    const isEnrolled = true
        
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
                {!isEnrolled ? (
                    <button className="bg-black text-white px-4 py-2 rounded">
                        Enroll
                    </button>
                ) : (
                    <a href={`/lessons/${lessons[0]?.id}`}>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">
                            Continue Learning
                        </button>
                    </a>
                )}
            </div>
        </div>
    
        )



}