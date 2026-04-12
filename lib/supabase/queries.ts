import { supabase } from '@/lib/supabase/client'
import { UserLesson } from '@/types/database'

// Fetches all lessons and the current user's progress for each one.
// Uses two separate queries — one for all lessons, one for this user's progress —
// then merges them. This avoids the PostgREST limitation where .eq() on a
// joined table filters the embedded result but cannot act as a true JOIN condition,
// which would otherwise risk exposing other users' progress data.
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
    console.error('Error fetching lessons:', lessonsResult.error)
    return []
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
