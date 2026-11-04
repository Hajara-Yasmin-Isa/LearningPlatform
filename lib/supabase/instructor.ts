import { supabase as browserClient } from './client'
import { getEnrolledCoursesWithProgress } from './courses'
import { EnrolledCourseWithProgress } from '@/types/database'

type SupabaseClient = typeof browserClient

export interface EnrolledStudent {
  studentId: string
  name: string | undefined
  instructorCourses: EnrolledCourseWithProgress[]
}

export async function getEnrolledStudents(instructorId: string, client: SupabaseClient = browserClient): Promise<EnrolledStudent[]> {
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
    const studentProgress: EnrolledStudent[] = []
    
    // Loop through each unique student and get their enrolled courses with progress
    for (const studentId of uniqueEnrolledStudents) { 
        const student = users.find((user) => user.id === studentId)
        const courses = await getEnrolledCoursesWithProgress(studentId, client)
        const instructorCourses = courses.filter((item) => instructorCourseIds.includes(item.course.id))
        studentProgress.push({ studentId, name: student?.name, instructorCourses })
    }

    return studentProgress
    }

export async function getInstructorCourseStats(
    instructorId: string,
    client: SupabaseClient = browserClient
): Promise<{ courseId: string; enrollments: number; totalSections: number; averageCompletion: number }[]> {

    //Get courses where instructor_id field is equal to ours
    const { data: courses, error } = await client
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId)
    if (!courses) console.log("null")
    else if (courses.length == 0) console.log("your courses:", courses.length)
    console.log(courses)
    if (error) throw new Error(error.message)
    if (!courses || courses.length === 0) return []

    console.log("Finished grabbing enrollments.")

    //Instructor's Course IDs
    const instructorCourseIds = courses.map((course) => course.id)
    console.log('instructorCourseIds', { instructorCourseIds })

    //Get instructor's courses from enrollments table
    const { data: enrollments, error: enrollmentsError } = await client
        .from('enrollments')
        .select('course_id, user_id')
        .in('course_id', instructorCourseIds)
    console.log('Enrollment query:', {
        data: enrollments,
        error: enrollmentsError,
    })
    if (enrollmentsError) throw new Error(enrollmentsError.message)

    //Count enrollments for each course
    const enrollmentCounts = new Map<string, number>()

    for (const enrollment of enrollments ?? []) {
        const courseId = enrollment.course_id
        enrollmentCounts.set(
            courseId,
            (enrollmentCounts.get(courseId) ?? 0) + 1
        )
    }

    //Fetch lessons
    const { data: lessons, error: lessonsError } = await client
        .from('lessons')
        .select('id, course_id')
        .in('course_id', instructorCourseIds)

    if (lessonsError) throw new Error(lessonsError.message)

    const lessonIds = (lessons ?? []).map((lesson) => lesson.id)

    //Grab totalSections
    const { data: sections, error: sectionsError } = await client
        .from('sections')
        .select('id, lesson_id')
        .in('lesson_id', lessonIds)

    if (sectionsError) throw new Error(sectionsError.message)

    const lessonToCourse = new Map<string, string>()

    for (const lesson of lessons ?? []) {
        lessonToCourse.set(lesson.id, lesson.course_id)
    }

    const sectionCounts = new Map<string, number>()

    for (const section of sections ?? []) {
        const courseId = lessonToCourse.get(section.lesson_id)

        if (courseId) {
            sectionCounts.set(
                courseId,
                (sectionCounts.get(courseId) ?? 0) + 1
            )
        }
    }

    //Grab user progress
    const { data: progress, error: progressError } = await client
        .from('user_progress')
        .select('user_id, section_id, completed')
        .in('section_id', (sections ?? []).map((section) => section.id))

    if (progressError) throw new Error(progressError.message)

    //Average Completion Calculation
    return courses.map((course) => {
        //Filter to course
        const courseEnrollments = (enrollments ?? []).filter(
            (enrollment) => enrollment.course_id === course.id
        )

        //Count total sections on this course
        const totalSections = sectionCounts.get(course.id) ?? 0

        let totalCompletion = 0

        //Find progress per student
        for (const enrollment of courseEnrollments) {
            const studentProgress = (progress ?? []).filter(
                (p) => p.user_id === enrollment.user_id &&
                    p.completed === true
            )

            //Find how many sections the student has completed belonging to the course
            const completedSections = studentProgress.filter((p) =>
                (sections ?? []).some(
                    (section) =>
                        section.id === p.section_id &&
                        lessonToCourse.get(section.lesson_id) === course.id
                )
            ).length

            const studentCompletion = totalSections > 0
                ? (completedSections / totalSections) * 100
                : 0

            totalCompletion += studentCompletion
        }

        const averageCompletion = courseEnrollments.length > 0
            ? totalCompletion / courseEnrollments.length
            : 0

        return {
            courseId: course.id,
            enrollments: enrollmentCounts.get(course.id) ?? 0,
            totalSections,
            averageCompletion: Math.round(averageCompletion),
        }
    })
}