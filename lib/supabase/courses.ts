import { supabase } from './client'
import { Course, CourseWithInstructor, Enrollment, EnrolledCourseWithProgress } from '@/types/database'

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

// Fetch all published courses, each joined with the instructor's name
// Used by: courses page to display the full course grid
export async function getAllPublishedCourses(): Promise<CourseWithInstructor[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`*, users(name, username)`)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// Fetch a single course by its ID, joined with instructor's name
// Used by: course detail page
export async function getCourseById(courseId: string): Promise<CourseWithInstructor | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`*, users(name, username)`)
    .eq('id', courseId)
    .single()

  // PGRST116 = no rows found = course doesn't exist, return null
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

// Enroll a user in a course
// The database has a UNIQUE constraint on (user_id, course_id)
// so duplicate enrollments are automatically rejected at the DB level
// Used by: enroll button on CourseCard
export async function enrollInCourse(userId: string, courseId: string): Promise<void> {
  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId })

  if (error) {
    // Supabase error code 23505 = unique constraint violation = for when user is already enrolled
    if (error.code === '23505') throw new Error('Already enrolled in this course')
    throw new Error(error.message)
  }
}

// Get all courses a user is enrolled in, with full course details
// Used by: my courses page, checking what user is enrolled in
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// Check if a specific user is enrolled in a specific course
// Returns true/false - used to show "Enroll" vs "Enrolled" on CourseCard
// Can take a third argument, supabase, helpful for when called 
// npin server components where createServerClient() is called
export async function isUserEnrolled(
  userId: string,
  courseId: string,
  client = supabase
) {
    const { data, error } = await client
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle()

  // PGRST116 = no rows found = not enrolled (not a real error)
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data !== null
}

// Get a user's enrolled courses, each with a count of completed sections and total sections
// Section completion is attributed to a course via user_progress.lesson_id -> lessons.course_id,
// since user_progress does not store course_id directly
// Used by: student dashboard, to show enrolled courses with progress
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
