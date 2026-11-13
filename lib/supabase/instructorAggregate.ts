import type { EnrolledStudent, InstructorCourseStats } from '@/types/database'

// Pure grouping/maths for the instructor dashboard. No Supabase calls in here,
// which is what makes it testable without a database (see the review notes in
// instructor.ts for why the first version could not be tested that way).

/** Everything the instructor dashboard needs, loaded once by lib/supabase/instructor.ts. */
export interface InstructorData {
  courses: { id: string; title: string }[]
  enrollments: { user_id: string; course_id: string }[]
  namesById: Map<string, string | null>
  totalSectionsByCourse: Map<string, number>
  /** `${userId}|${courseId}` -> sections that student has completed in that course */
  completedByStudentCourse: Map<string, number>
}

export const studentCourseKey = (userId: string, courseId: string) => `${userId}|${courseId}`

/**
 * Per course: enrollments, total sections, and the average completion, defined as
 * the mean over enrolled students of (sections completed / total sections) * 100.
 * Lookups are Map hits, so the cost is linear in enrollments — the first version
 * filtered every progress row for every enrollment and then scanned every section
 * for every progress row (enrollments x progress x sections comparisons).
 */
export function computeInstructorCourseStats(data: InstructorData): InstructorCourseStats[] {
  const studentsByCourse = new Map<string, string[]>()
  for (const e of data.enrollments) {
    const list = studentsByCourse.get(e.course_id) ?? []
    list.push(e.user_id)
    studentsByCourse.set(e.course_id, list)
  }

  return data.courses.map((course) => {
    const students = studentsByCourse.get(course.id) ?? []
    const totalSections = data.totalSectionsByCourse.get(course.id) ?? 0
    let sum = 0
    for (const userId of students) {
      const done = data.completedByStudentCourse.get(studentCourseKey(userId, course.id)) ?? 0
      sum += totalSections > 0 ? (done / totalSections) * 100 : 0
    }
    return {
      courseId: course.id,
      title: course.title,
      enrollments: students.length,
      totalSections,
      averageCompletion: students.length > 0 ? Math.round(sum / students.length) : 0,
    }
  })
}

/** One entry per student, with a row for each of the instructor's courses they are enrolled in. */
export function groupEnrolledStudents(data: InstructorData): EnrolledStudent[] {
  const coursesById = new Map(data.courses.map((c) => [c.id, c]))
  const byStudent = new Map<string, EnrolledStudent>()

  for (const e of data.enrollments) {
    const course = coursesById.get(e.course_id)
    if (!course) continue
    let student = byStudent.get(e.user_id)
    if (!student) {
      student = { studentId: e.user_id, name: data.namesById.get(e.user_id) ?? null, courses: [] }
      byStudent.set(e.user_id, student)
    }
    student.courses.push({
      courseId: course.id,
      courseTitle: course.title,
      sectionsCompleted: data.completedByStudentCourse.get(studentCourseKey(e.user_id, course.id)) ?? 0,
      totalSections: data.totalSectionsByCourse.get(course.id) ?? 0,
    })
  }

  return [...byStudent.values()]
}
