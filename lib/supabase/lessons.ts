import { supabase } from './client'
import { Lesson, Section, Exercise, UserProgress } from '@/types/database'

// Extended types for nested query results — defined here since database.ts cannot be modified

export interface SectionWithExercises extends Section {
  exercises: Exercise[]
}

export interface LessonWithSections extends Lesson {
  sections: SectionWithExercises[]
}

// Fetches a lesson, all its sections, and all exercises within each section
// Used by: lesson viewer (Card A) to render the full lesson tree
export async function getLessonWithSections(lessonId: string): Promise<LessonWithSections | null> {
  const { data, error } = await supabase
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
  lessonId: string
): Promise<UserProgress[]> {
  const { data, error } = await supabase
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
  sectionId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        section_id: sectionId,
        completed: true,
        last_accessed: new Date().toISOString(),
      },
      // Conflict target: one row per (user_id, lesson_id, section_id)
      { onConflict: 'user_id,lesson_id,section_id' }
    )

  if (error) throw new Error(error.message)
}
