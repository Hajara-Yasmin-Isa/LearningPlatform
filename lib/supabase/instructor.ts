import { supabase as browserClient } from './client'
import { getEnrolledCoursesWithProgress } from './courses'

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
    
    // Get unique student IDs from the enrollments
    const enrolledStudents = enrollments.map((enrollment) => enrollment.user_id)  
    const uniqueEnrolledStudents = [...new Set(enrolledStudents)]

    // Get user details for the unique student IDs
    const { data: users, error: usersError } = await client
      .from('users')
      .select('id, name')
      .in('id', uniqueEnrolledStudents)
    if (usersError) throw new Error(usersError.message)

    // Get progress for each student in the instructor's courses
    const studentProgress = []
    
    // Loop through each unique student and get their enrolled courses with progress
    for (const studentId of uniqueEnrolledStudents) { 
        const student = users.find((user) => user.id === studentId)
        const courses = await getEnrolledCoursesWithProgress(studentId, client)
        const instructorCourses = courses.filter((item) => instructorCourseIds.includes(item.course.id))
        studentProgress.push({ studentId, name: student?.name, instructorCourses })
    }

    return studentProgress
    }