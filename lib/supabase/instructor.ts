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
    console.log('instructorCourseIds', {instructorCourseIds})

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

    console.log(progress)

    return courses.map((course) => ({
        courseId: course.id,
        enrollments: enrollmentCounts.get(course.id) ?? 0,
        totalSections: sectionCounts.get(course.id) ?? 0,
        averageCompletion: 0,
    }))
}