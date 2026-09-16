import { supabase } from './client'
import { Course, CourseWithInstructor } from '@/types/database'

// Instructor-facing analytics queries. Visibility of draft courses and of
// other users' enrollments/progress relies on the instructor RLS policies
// added in migration 012_instructor_analytics_policies.sql.
//
// Error handling convention (same as courses.ts): throws on unexpected
// Supabase errors; list queries return [] for "no rows".

type SupabaseClient = typeof supabase

// Raw shape returned by the joined courses query — the Supabase client here
// has no generic Database type, so joined columns need explicit local typing
interface CourseWithLessonCountRaw extends Course {
  users: { name: string; username: string } | null
  lessons: { count: number }[]
}

function toCourseWithInstructor(raw: CourseWithLessonCountRaw): CourseWithInstructor {
  const { lessons, ...course } = raw
  return { ...course, lessonCount: lessons?.[0]?.count ?? 0 }
}

// A student enrolled in a course, as shown to its instructor.
// Deliberately no email: public.users has no email column (email lives only
// in auth.users, which client queries cannot read).
export interface EnrolledStudent {
  id: string
  name: string
  enrolled_at: string
}

export interface CourseEnrollments {
  count: number
  students: EnrolledStudent[]
}

/** Returns all courses taught by an instructor (drafts included), with instructor info and lesson count; throws on unexpected error. */
export async function getInstructorCourses(
  userId: string,
  client: SupabaseClient = supabase
): Promise<CourseWithInstructor[]> {
  const { data, error } = await client
    .from('courses')
    .select(`*, users(name, username), lessons(count)`)
    .eq('instructor_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as CourseWithLessonCountRaw[]).map(toCourseWithInstructor)
}

/**
 * Returns the enrollment count and enrolled students for a course; throws on unexpected error.
 * Student names are fetched in a second query because enrollments.user_id
 * references auth.users, not public.users, so PostgREST cannot embed users(name).
 */
export async function getCourseEnrollments(
  courseId: string,
  client: SupabaseClient = supabase
): Promise<CourseEnrollments> {
  const { data: enrollments, error } = await client
    .from('enrollments')
    .select('user_id, enrolled_at')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!enrollments || enrollments.length === 0) return { count: 0, students: [] }

  const userIds = enrollments.map(e => e.user_id as string)

  const { data: users, error: usersError } = await client
    .from('users')
    .select('id, name')
    .in('id', userIds)

  if (usersError) throw new Error(usersError.message)

  const nameById = new Map<string, string>(
    (users ?? []).map(u => [u.id as string, u.name as string])
  )

  const students = enrollments.map(e => ({
    id: e.user_id as string,
    name: nameById.get(e.user_id as string) ?? '',
    enrolled_at: e.enrolled_at as string,
  }))

  return { count: students.length, students }
}

/**
 * Returns the percentage (integer 0-100) of enrolled students who have completed
 * at least one lesson in the course, i.e. have a lesson-level user_progress row
 * (section_id IS NULL, completed = true) for one of its lessons.
 * Returns 0 when the course has no enrollments or no lessons; throws on unexpected error.
 */
export async function getCourseCompletionRate(
  courseId: string,
  client: SupabaseClient = supabase
): Promise<number> {
  const [enrollmentsResult, lessonsResult] = await Promise.all([
    client.from('enrollments').select('id').eq('course_id', courseId),
    client.from('lessons').select('id').eq('course_id', courseId),
  ])

  if (enrollmentsResult.error) throw new Error(enrollmentsResult.error.message)
  if (lessonsResult.error) throw new Error(lessonsResult.error.message)

  const enrolledCount = (enrollmentsResult.data ?? []).length
  if (enrolledCount === 0) return 0

  const lessonIds = (lessonsResult.data ?? []).map(l => l.id as string)
  if (lessonIds.length === 0) return 0

  const { data: progress, error } = await client
    .from('user_progress')
    .select('user_id')
    .eq('completed', true)
    .is('section_id', null)
    .in('lesson_id', lessonIds)

  if (error) throw new Error(error.message)

  const completers = new Set((progress ?? []).map(row => row.user_id as string))
  // Cap at 100: progress rows can exist for users no longer enrolled
  return Math.min(100, Math.round((completers.size / enrolledCount) * 100))
}
