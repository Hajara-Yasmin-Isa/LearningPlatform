import { supabase as browserClient } from './client'
import { Lesson, Section, Exercise, UserProgress } from '@/types/database'

// Extended types for nested query results — defined here since database.ts cannot be modified

export interface SectionWithExercises extends Section {
  exercises: Exercise[]
}

export interface LessonWithSections extends Lesson {
  sections: SectionWithExercises[]
}

type SupabaseClient = typeof browserClient

// Fetches a lesson, all its sections, and all exercises within each section
// Used by: lesson viewer (Card A) to render the full lesson tree
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

// Fetches all UserProgress rows for a given user and lesson
// Used by: lesson viewer to mark which sections are already completed
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

// Inserts or updates a UserProgress row setting completed: true for the given section
// Called when the user finishes all exercises in a section
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

// Fetches all lessons for a given course, ordered by lesson_order ascending
// Returns [] (not an error) if the course exists but has no lessons yet
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

// Fetches the section immediately after the given one within the same lesson
// Returns null if the current section is the last one in the lesson
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
