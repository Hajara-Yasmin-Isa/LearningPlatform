//Import the course ID 
import { getCourseById } from "@/lib/supabase/courses"

//404 not found
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({ params }: {params: {id: string}}) {
    const course = await getCourseById(params.id)
    
    if (!course) {
        notFound()
    } 
        
        
    return <div>{course?.title}</div>


}