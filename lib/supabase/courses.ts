import { supabase } from './client'
import { Course, CourseWithInstructor, Enrollment, EnrolledCourseWithProgress } from '@/types/database'
import { getLessonsByCourse } from './lessons'

// Error handling convention for this file: throws on unexpected Supabase
// errors; single-row lookups return null/false for "not found" (PGRST116);
// list queries return [] for "no rows" rather than treating it as an error.

type SupabaseClient = typeof supabase

// Raw shapes returned by the joined queries below — the Supabase client here
// has no generic Database type, so joined columns need explicit local typing
interface EnrollmentWithCourse extends Enrollment {
  courses: Course
}

interface ProgressWithCourseId {
  section_id: string | null
  lessons: { course_id: string | null } | null
}

interface CourseWithLessonCountRaw extends Course {
  users: { name: string; username: string } | null
  lessons: { count: number }[]
}

function toCourseWithInstructor(raw: CourseWithLessonCountRaw): CourseWithInstructor {
  const { lessons, ...course } = raw
  return { ...course, lessonCount: lessons?.[0]?.count ?? 0 }
}

/** Returns published courses joined with instructor info and lesson count; throws on unexpected error. */
export async function getAllPublishedCourses(client: SupabaseClient = supabase): Promise<CourseWithInstructor[]> {
  const { data, error } = await client
    .from('courses')
    .select(`*, users(name, username), lessons(count)`)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as CourseWithLessonCountRaw[]).map(toCourseWithInstructor)
}

/**
 * Searches published courses by title/description substring and/or difficulty.
 * Falls back to getAllPublishedCourses when both filters are empty; throws on unexpected error.
 */
export async function searchCourses(
  query: string,
  difficulty: string | null,
  client: SupabaseClient = supabase
): Promise<CourseWithInstructor[]> {
  if (!query && !difficulty) {
    return getAllPublishedCourses(client)
  }

  let request = client
    .from('courses')
    .select(`*, users(name, username), lessons(count)`)
    .eq('published', true)

  if (query) {
    request = request.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }
  if (difficulty) {
    request = request.eq('difficulty', difficulty)
  }

  const { data, error } = await request.order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as CourseWithLessonCountRaw[]).map(toCourseWithInstructor)
}

/** Returns a course by id joined with instructor info and lesson count, or null if not found; throws on unexpected error. */
export async function getCourseById(courseId: string): Promise<CourseWithInstructor | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`*, users(name, username), lessons(count)`)
    .eq('id', courseId)
    .single()

  // PGRST116 = no rows found = course doesn't exist, return null
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  if (!data) return null
  return toCourseWithInstructor(data as unknown as CourseWithLessonCountRaw)
}

/**
 * Enrolls a user in a course; throws if already enrolled or on unexpected error.
 * The enrollments table has a UNIQUE constraint on (user_id, course_id), so the
 * database rejects duplicates automatically — that's why 23505 is handled here.
 */
export async function enrollInCourse(userId: string, courseId: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })

  if (error) {
    // 23505 = unique constraint violation = user is already enrolled
    if (error.code === '23505') throw new Error('Already enrolled in this course')
    throw new Error(error.message)
  }
}

/** Returns all enrollments for a user; throws on unexpected error. */
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** Returns whether a user is enrolled in a course; throws on unexpected error. */
export async function isUserEnrolled(
  userId: string,
  courseId: string,
  client = supabase
) {
  const { data, error } = await client
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  // PGRST116 = no rows found = not enrolled (not a real error)
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data !== null
}

/**
 * Returns enrolled courses for a user, each with completed and total section counts.
 * Section completion is attributed to a course via user_progress.lesson_id -> lessons.course_id,
 * since user_progress does not store course_id directly; throws on unexpected error.
 */
export async function getEnrolledCoursesWithProgress(
  userId: string,
  client: SupabaseClient = supabase
): Promise<EnrolledCourseWithProgress[]> {
  const { data: enrollments, error: enrollmentsError } = await client
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId)

  if (enrollmentsError) throw new Error(enrollmentsError.message)
  if (!enrollments || enrollments.length === 0) return []

  const typedEnrollments = enrollments as unknown as EnrollmentWithCourse[]
  const courseIds = typedEnrollments.map(e => e.course_id)

  // Count completed sections per course via lesson_id -> course_id join
  const { data: progress, error: progressError } = await client
    .from('user_progress')
    .select('section_id, lessons(course_id)')
    .eq('user_id', userId)
    .eq('completed', true)
    .not('section_id', 'is', null)

  if (progressError) throw new Error(progressError.message)

  const typedProgress = (progress ?? []) as unknown as ProgressWithCourseId[]

  const sectionsCompletedByCourseId = new Map<string, number>()
  for (const row of typedProgress) {
    const courseId = row.lessons?.course_id
    if (!courseId) continue
    sectionsCompletedByCourseId.set(courseId, (sectionsCompletedByCourseId.get(courseId) ?? 0) + 1)
  }

  // Count total sections per course via lessons -> sections
  const { data: lessons, error: lessonsError } = await client
    .from('lessons')
    .select('id, course_id')
    .in('course_id', courseIds)

  if (lessonsError) throw new Error(lessonsError.message)

  const lessonIds = (lessons ?? []).map(l => l.id as string)
  const lessonToCourse = new Map<string, string>(
    (lessons ?? []).map(l => [l.id as string, l.course_id as string])
  )

  const { data: sections, error: sectionsError } = await client
    .from('sections')
    .select('id, lesson_id')
    .in('lesson_id', lessonIds)

  if (sectionsError) throw new Error(sectionsError.message)

  const totalSectionsByCourseId = new Map<string, number>()
  for (const section of sections ?? []) {
    const courseId = lessonToCourse.get(section.lesson_id as string)
    if (!courseId) continue
    totalSectionsByCourseId.set(courseId, (totalSectionsByCourseId.get(courseId) ?? 0) + 1)
  }

  return typedEnrollments.map((enrollment) => ({
    course: enrollment.courses,
    sectionsCompleted: sectionsCompletedByCourseId.get(enrollment.course_id) ?? 0,
    totalSections: totalSectionsByCourseId.get(enrollment.course_id) ?? 0,
  }))
}
export async function isCourseComplete(
  userId: string,
  courseId: string,
  client: SupabaseClient = supabase
): Promise<boolean> {
  const lessons = await getLessonsByCourse(courseId, client)
  if (lessons.length === 0) return false

  const lessonIds = lessons.map(l => l.id)

  const { data, error } = await client
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true)
    .is('section_id', null)
    .in('lesson_id', lessonIds)

  if (error) throw new Error(error.message)
  return (data ?? []).length === lessons.length
}
