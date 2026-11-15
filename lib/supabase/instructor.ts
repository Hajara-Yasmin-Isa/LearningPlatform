import { supabase as browserClient } from './client'
import { getSectionMapsForCourses } from './courses'
import type { EnrolledStudent, InstructorCourseStats } from '@/types/database'
import {
  computeInstructorCourseStats,
  groupEnrolledStudents,
  studentCourseKey,
  type InstructorData,
} from './instructorAggregate'

type SupabaseClient = typeof browserClient

/*
 * Review notes, Nov 2026 (A1.3 / A1.4) — kept on purpose so the next person learns from them.
 *
 * What the first version did, and why it was changed:
 *
 * 1. N+1 queries. For every enrolled student it awaited a helper that itself ran four
 *    queries, so a course with 100 students meant ~400 sequential requests on every
 *    mount of the Manage Students tab. Rule: never put an `await` on a database call
 *    inside a loop over rows. Fetch the sets you need (enrollments, progress, users)
 *    with one `.in(...)` query each and join them in memory with Maps.
 *
 * 2. Nested filters for the average. `enrollments.filter(progress.filter(sections.some(...)))`
 *    is enrollments x progress x sections comparisons. Build a lookup Map once and read
 *    from it; see instructorAggregate.ts.
 *
 * 3. Two functions, two copies of the same queries. Both tabs are rendered by the same
 *    dashboard, so the data is loaded ONCE (loadInstructorData) and each tab's shape is
 *    derived from it. The section-counting logic now lives in courses.ts and is shared
 *    with the student view, so "total sections" cannot drift between the two dashboards.
 *
 * 4. console.log of query results. One of them printed every enrollment row (student
 *    ids) to the browser console. Debug output never ships, and A1.3 says name and
 *    progress only.
 *
 * 5. Return types declared inline, three slightly different times. They now live in
 *    types/database.ts, as CLAUDE.md says.
 *
 * What was RIGHT and must stay: no policy changes here. Under the RLS on dev today
 * (courses: published only; enrollments and user_progress: own rows only) an instructor
 * gets back published courses and NO enrollments or progress. That is the blocker both
 * cards documented; PR 93 (A2.1) adds the instructor read policies. Do not work around
 * it in application code.
 */

type Row = Record<string, unknown>

async function loadInstructorData(instructorId: string, client: SupabaseClient): Promise<InstructorData | null> {
  const { data: courseRows, error } = await client
    .from('courses')
    .select('id, title')
    .eq('instructor_id', instructorId)
  if (error) throw new Error(error.message)

  // Same early exit for every caller: no courses means no further queries, and it also
  // avoids sending `.in('course_id', [])`, which PostgREST rejects.
  const courses = ((courseRows ?? []) as Row[]).map((c) => ({ id: String(c.id), title: String(c.title ?? '') }))
  if (courses.length === 0) return null
  const courseIds = courses.map((c) => c.id)

  // Independent queries run together, not one after the other.
  const [enrollmentsResult, sectionMaps] = await Promise.all([
    client.from('enrollments').select('user_id, course_id').in('course_id', courseIds),
    getSectionMapsForCourses(courseIds, client),
  ])
  if (enrollmentsResult.error) throw new Error(enrollmentsResult.error.message)
  const enrollments = ((enrollmentsResult.data ?? []) as Row[]).map((e) => ({
    user_id: String(e.user_id),
    course_id: String(e.course_id),
  }))
  const studentIds = [...new Set(enrollments.map((e) => e.user_id))]

  const namesById = new Map<string, string | null>()
  const completedByStudentCourse = new Map<string, number>()

  if (studentIds.length > 0) {
    const [usersResult, progressResult] = await Promise.all([
      client.from('users').select('id, name').in('id', studentIds),
      client
        .from('user_progress')
        .select('user_id, section_id')
        .in('user_id', studentIds)
        .eq('completed', true)
        .not('section_id', 'is', null),
    ])
    if (usersResult.error) throw new Error(usersResult.error.message)
    if (progressResult.error) throw new Error(progressResult.error.message)

    for (const u of (usersResult.data ?? []) as Row[]) {
      namesById.set(String(u.id), typeof u.name === 'string' ? u.name : null)
    }
    for (const p of (progressResult.data ?? []) as Row[]) {
      // Progress in a course this instructor does not teach is simply not in the map.
      const courseId = sectionMaps.sectionToCourse.get(String(p.section_id))
      if (!courseId) continue
      const key = studentCourseKey(String(p.user_id), courseId)
      completedByStudentCourse.set(key, (completedByStudentCourse.get(key) ?? 0) + 1)
    }
  }

  return {
    courses,
    enrollments,
    namesById,
    totalSectionsByCourse: sectionMaps.totalSectionsByCourse,
    completedByStudentCourse,
  }
}

/** Both tabs' data from one load: five queries in total, however many students there are. */
export async function getInstructorDashboardData(
  instructorId: string,
  client: SupabaseClient = browserClient
): Promise<{ stats: InstructorCourseStats[]; students: EnrolledStudent[] }> {
  const data = await loadInstructorData(instructorId, client)
  if (!data) return { stats: [], students: [] }
  return { stats: computeInstructorCourseStats(data), students: groupEnrolledStudents(data) }
}

/** A1.4: per course — enrollments, total sections, average completion %. */
export async function getInstructorCourseStats(
  instructorId: string,
  client: SupabaseClient = browserClient
): Promise<InstructorCourseStats[]> {
  return (await getInstructorDashboardData(instructorId, client)).stats
}

/** A1.3: students enrolled in the instructor's courses, with sections completed / total per course. */
export async function getEnrolledStudents(
  instructorId: string,
  client: SupabaseClient = browserClient
): Promise<EnrolledStudent[]> {
  return (await getInstructorDashboardData(instructorId, client)).students
}
