//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//404 not found
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({ params }: {params: {id: string}}) {
    // const course = await getCourseById(params.id)
    
    // if (!course) {
    //     notFound()
    // } 

    /* SAMPLE COURSE AND LESSONS DATA */

    const course = {
  id: 'test',
  title: 'Sample Course',
  description: 'This is a sample course description.',
  difficulty: 'Beginner',
  duration_minutes: 90,
  users: { name: 'Test Instructor' },
}

    const lessons = [
  { id: '1', title: 'Introduction', lesson_order: 1 },
  { id: '2', title: 'Basics', lesson_order: 2 },
  { id: '3', title: 'Advanced Concepts', lesson_order: 3 },
]
        
    return (
    <div>
        <h1 className="text-2x1 font-bold">{course.title}</h1>
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
                
            {lessons.map((lesson) => 
                <li key={lesson.id} className="border p-2 rounded-lg bg-slate-200">
                    {lesson.title}
                </li>
            )}
        </ul>
        </div>
        
    </div>
    
        )



}