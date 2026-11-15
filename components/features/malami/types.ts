export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

// Mirrors the `context` shape accepted by POST /api/malami (B1.3).
export interface MalamiContext {
  lessonId?: string
  exerciseId?: string
  userAnswer?: string
}

export type MalamiError =
  | { kind: 'unauthorised' }
  | { kind: 'rate_limited' }
  | { kind: 'unavailable' }
  | { kind: 'unknown'; message: string }
