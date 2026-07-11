import { supabase as browserClient } from './client'
import { Lesson, Section, Exercise, UserProgress } from '@/types/database'

// Error handling convention for this file: throws on unexpected Supabase
// errors; single-row lookups return null for "not found" (PGRST116);
// list queries return [] for "no rows" rather than treating it as an error.

// Extended types for nested query results — defined here since database.ts cannot be modified

export interface SectionWithExercises extends Section {
  exercises: Exercise[]
}

export interface LessonWithSections extends Lesson {
  sections: SectionWithExercises[]
}

type SupabaseClient = typeof browserClient

/** Returns a lesson with its sections and exercises, or null if not found; throws on unexpected error. */
export async function getLessonWithSections(
  lessonId: string,
  client: SupabaseClient = browserClient
): Promise<LessonWithSections | null> {
  const { data, error } = await client
    .from('lessons')
    .select(`
      *,
      sections (
        *,
        exercises (*)
      )
    `)
    .eq('id', lessonId)
    .order('section_order', { referencedTable: 'sections', ascending: true })
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  if (!data) return null

  // Sort exercises within each section by exercise_order
  const sections = (data.sections ?? []).map((section: SectionWithExercises) => ({
    ...section,
    exercises: (section.exercises ?? []).sort(
      (a: Exercise, b: Exercise) => a.exercise_order - b.exercise_order
    ),
  }))

  return { ...data, sections }
}

/** Returns all UserProgress rows for a user and lesson; throws on unexpected error. */
export async function getUserProgress(
  userId: string,
  lessonId: string,
  client: SupabaseClient = browserClient
): Promise<UserProgress[]> {
  const { data, error } = await client
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)

  if (error) throw new Error(error.message)
  return data ?? []
}

/** Upserts a UserProgress row marking a section completed; throws on unexpected error. */
export async function markSectionComplete(
  userId: string,
  lessonId: string,
  sectionId: string,
  client: SupabaseClient = browserClient
): Promise<void> {
  const { error } = await client
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        section_id: sectionId,
        completed: true,
        last_accessed: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id,section_id' }
    )

  if (error) throw new Error(error.message)
}

/** Returns all lessons for a course ordered by lesson_order, or [] if none; throws on unexpected error. */
export async function getLessonsByCourse(
  courseId: string,
  client: SupabaseClient = browserClient
): Promise<Lesson[]> {
  const { data, error } = await client
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('lesson_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/** Returns lesson IDs the user has fully completed within a course, or [] if none; throws on unexpected error. */
export async function getUserProgressForCourse(
  userId: string,
  courseId: string,
  client: SupabaseClient = browserClient
): Promise<string[]> {
  const lessons = await getLessonsByCourse(courseId, client)
  if (lessons.length === 0) return []

  const lessonIds = lessons.map(l => l.id)

  const { data, error } = await client
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true)
    .is('section_id', null)
    .in('lesson_id', lessonIds)

  if (error) throw new Error(error.message)
  return (data ?? []).map(row => row.lesson_id)
}

/** Returns the section after the given one within a lesson, or null if it was the last; throws on unexpected error. */
export async function getNextSection(
  lessonId: string,
  currentSectionOrder: number,
  client: SupabaseClient = browserClient
): Promise<Section | null> {
  const { data, error } = await client
    .from('sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('section_order', currentSectionOrder + 1)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data ?? null
}
