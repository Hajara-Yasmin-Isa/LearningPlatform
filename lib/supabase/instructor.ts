import { supabase as browserClient } from './client'

type SupabaseClient = typeof browserClient

export async function getEnrolledStudents(instructorId: string, client: SupabaseClient = browserClient) {
    // Get all courses taught by the instructor
    const { data, error } = await client
    .from('courses')
    .select('id')
    .eq('instructor_id', instructorId)
    if (error) throw new Error(error.message)
    const instructorCourseIds = data.map((course) => course.id)
    
    // Get all enrollments for those courses
    const {data: enrollments, error: enrollmentsError} = await client
    .from('enrollments')
    .select('user_id, course_id')
    .in('course_id', instructorCourseIds)
    if (enrollmentsError) throw new Error(enrollmentsError.message)
    
    // get unique student IDs from the enrollments
    const enrolledStudents = enrollments.map((enrollment) => enrollment.user_id)  
    const uniqueEnrolledStudents = [...new Set(enrolledStudents)]



    return instructorCourseIds
    }