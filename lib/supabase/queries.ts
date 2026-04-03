import { supabase } from '@/lib/supabase/client'

//  lesson returned by getUserLessons
// 
export interface UserLesson {
  id: string
  title: string
  completed: number  // 0 or 1 whether this lesson is marked complete
  total: number      // always 1 each lesson
}

// Fetches all lessons and joins with the user's progress data.
// Uses a left join so lessons with no progress record still appear (completed defaults to 0).
export async function getUserLessons(userId: string): Promise<UserLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      user_progress!left (
        completed
      )
    `)
    .eq('user_progress.user_id', userId)
    .order('lesson_order', { ascending: true })

  if (error || !data) {
    console.error('Error fetching lessons:', error)
    return []
  }

  return data.map((lesson) => {
    // take the first progress row — filtered to this user in the query above
    const progress = Array.isArray(lesson.user_progress) ? lesson.user_progress[0] : lesson.user_progress

    return {
      id: lesson.id,
      title: lesson.title,
      completed: progress?.completed ? 1 : 0,
      total: 1,
    }
  })
}
