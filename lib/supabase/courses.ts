import { supabase } from './client'
import { CourseWithInstructor, Enrollment } from '@/types/database'

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
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  // PGRST116 = no rows found = not enrolled (not a real error)
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data !== null
}

// Get all courses (published and unpublished) for a specific instructor
// Used by : instructor dashboard to show their full course list
export async function getInstructorCourses(instructorId: string): Promise<CourseWithInstructor[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(`*, users(name, username)`)
    .eq('instructor_id', instructorId)
    .order('created_at', {ascending : false})

  
  if (error) throw new Error(error.message) 
  return data ?? [];
}

// Count how many students are enrolled in a specific course
// Used by: instructor dashboard to show enrollment numbers per course
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  const { count, error }  = await supabase
    .from('enrollments')
    .select('*', {count: 'exact', head:true})
    .eq('course_id', courseId);

  if (error) throw new Error(error.message)
  return count ?? 0
}