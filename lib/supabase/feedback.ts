import { supabase as browserClient } from './client'

// Error handling convention for this file: throws on unexpected Supabase
// errors. submitBetaFeedback is insert-only, so there is no "not found" case.

export type FeedbackType = 'bug' | 'suggestion' | 'other'

/** Inserts a beta feedback row for the given user; throws on unexpected error. */
const MAX_FEEDBACK_LENGTH = 5000

export async function submitBetaFeedback(
  userId: string,
  message: string,
  type: FeedbackType,
  page: string,
  client = browserClient
): Promise<void> {
  if (message.length > MAX_FEEDBACK_LENGTH) throw new Error('Message is too long.')
  const { error } = await client
    .from('beta_feedback')
    .insert({ user_id: userId, message, type, page })

  if (error) throw new Error(error.message)
}
