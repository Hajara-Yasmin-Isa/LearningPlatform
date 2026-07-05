// Database type definitions
// These should match your Supabase schema

export interface Lesson {
  id: string
  course_id: string
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

export interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration_minutes: number | null
  instructor_id: string
  published: boolean
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

// Course joined with instructor's basic info from the users table
export interface CourseWithInstructor extends Course {
  users: {
    name: string
    username: string
  } | null
}

// A lesson with the current user's completion status
export interface UserLesson {
  id: string
  title: string
  completed: boolean
  total: number
}