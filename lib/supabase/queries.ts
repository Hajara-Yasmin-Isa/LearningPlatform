import { supabase } from '@/lib/supabase/client'
import { UserLesson } from '@/types/database'

// Error handling convention for this file: logs and returns [] on unexpected
// Supabase errors instead of throwing (unlike courses.ts/lessons.ts), because
// getUserLessons is called from StudentDashboard.tsx with no try/catch.

/**
 * Returns all lessons with the current user's completion status; logs and returns []
 * on unexpected Supabase errors instead of throwing (see file header).
 * Uses two separate queries instead of a join because PostgREST's .eq() on an
 * embedded table filters the embedded result rather than acting as a JOIN condition —
 * a join would risk exposing other users' progress rows.
 */
export async function getUserLessons(userId: string): Promise<UserLesson[]> {
  const [lessonsResult, progressResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title')
      .order('lesson_order', { ascending: true }),
    supabase
      .from('user_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId),
  ])

  if (lessonsResult.error) {
    console.error('[getUserLessons] error:', lessonsResult.error)
    return []
  }

  // Progress is supplementary — log but don't fail the whole call; lessons
  // still render with completed defaulting to false. Not re-thrown because
  // StudentDashboard.tsx calls this function with no try/catch.
  if (progressResult.error) {
    console.error('[getUserLessons] error:', progressResult.error)
  }

  const progressMap = new Map(
    (progressResult.data ?? []).map((p) => [p.lesson_id, p.completed])
  )

  return (lessonsResult.data ?? []).map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    completed: progressMap.get(lesson.id) ?? false,
    total: 1,
  }))
}
