import { supabase as browserClient } from './client'

type SupabaseClient = typeof browserClient

// export async function getEnrolledStudents(instructorId: string, client: SupabaseClient = browserClient) {
//     const { data, error } = await client
//         .from('courses')
//         .select('id')
//         .eq('instructor_id', instructorId)
//     if (error) throw new Error(error.message)
//     const instructorCourseIds = data.map((course) => course.id)

//     const { data: enrollments, error: enrollmentsError } = await client
//         .from('enrollments')
//         .select('user_id, course_id')
//         .in('course_id', instructorCourseIds)
//     if (enrollmentsError) throw new Error(enrollmentsError.message)

//     return instructorCourseIds
// }

export async function getInstructorCourseStats(
    instructorId: string,
    client: SupabaseClient = browserClient
): Promise<{ courseId: string; enrollments: number; totalSections: number; averageCompletion: number }[]> {

    //Grab enrollments 
    console.log("Grabbing enrollments...")
    const { data: courses, error } = await client
        .from('courses')
        .select('id')
        .eq('instructor_id', instructorId)
    if (!courses) console.log("null")
    else if (courses.length == 0) console.log("your courses:", courses.length)
    if (error) throw new Error(error.message)
    if (!courses || courses.length === 0) return []

    console.log("Finished grabbing enrollments.")

    //Instructor's Course IDs
    const instructorCourseIds = courses.map((course) => course.id)

    //Get instructor's courses
    const { data: enrollments, error: enrollmentsError } = await client
        .from('enrollments')
        .select('course_id')
        .in('course_id', instructorCourseIds)

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

    return courses.map((course) => ({
        courseId: course.id,
        enrollments: enrollmentCounts.get(course.id) ?? 0,
        totalSections: sectionCounts.get(course.id) ?? 0,
        averageCompletion: 0,
    }))
}