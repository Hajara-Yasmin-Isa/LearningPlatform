import { supabase as browserClient } from './client'

export async function getEnrolledStudents(instructorId: string, client: SupabaseClient = browserClient) {
    const { data, error } = await client
    .from('courses')
    .select('id')
    .eq('instructor_id', instructorId)
    if (error) throw new Error(error.message)
    const instructorCourseIds = data.map((course) => course.id)
    return instructorCourseIds
    }