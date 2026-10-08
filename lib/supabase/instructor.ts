
import { supabase as browserClient } from './client'

type SupabaseClient = typeof browserClient

export async function getEnrolledStudents(instructorId: string, client: SupabaseClient = browserClient) {
    const { data, error } = await client
    .from('courses')
    .select('id')
    .eq('instructor_id', instructorId)
    if (error) throw new Error(error.message)
    const instructorCourseIds = data.map((course) => course.id)
    
    const {data: enrollments, error: enrollmentsError} = await client
    .from('enrollments')
    .select('user_id, course_id')
    .in('course_id', instructorCourseIds)
    if (enrollmentsError) throw new Error(enrollmentsError.message)
    
    return instructorCourseIds
    }