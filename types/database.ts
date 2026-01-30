// Database type definitions
// These should match your Supabase schema

export interface Lesson {
  id: string
  title: string
  description: string | null
  lesson_order: number
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  lesson_id: string
  title: string
  content: string | null
  section_order: number
  created_at: string
}

export interface Exercise {
  id: string
  section_id: string
  question: string
  exercise_type: 'multiple_choice' | 'code' | 'text'
  correct_answer: string
  options: string[] | null
  exercise_order: number
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  lesson_id: string
  section_id: string | null
  completed: boolean
  last_accessed: string
  created_at: string
}

// Example: Type for a lesson with its sections
export interface LessonWithSections extends Lesson {
  sections: Section[]
}