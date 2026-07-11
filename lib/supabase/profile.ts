import { supabase as browserClient } from './client'

// Error handling convention for this file: throws on unexpected Supabase
// errors; returns null when there is no authenticated user or no profile row.

/** Returns the current user's name, email, and bio, or null if not signed in / no profile row; throws on unexpected error. */
export async function getUserProfile(
  client = browserClient
): Promise<{ name: string; email: string; bio: string } | null> {
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError) throw new Error(authError.message)
  if (!user) return null

  const { data, error } = await client
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  if (!data) return null

  return {
    name: data.name,
    email: user.email ?? '',
    bio: (user.user_metadata?.bio as string | undefined) ?? '',
  }
}

/** Updates the user's auth metadata (name, bio) and mirrors name into the users table; throws on unexpected error. */
export async function updateUserProfile(
  name: string,
  bio: string,
  client = browserClient
): Promise<void> {
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError) throw new Error(authError.message)
  if (!user) throw new Error('Not authenticated')

  const { error: updateAuthError } = await client.auth.updateUser({
    data: { full_name: name, bio },
  })
  if (updateAuthError) throw new Error(updateAuthError.message)

  const { error: updateUsersError } = await client
    .from('users')
    .update({ name })
    .eq('id', user.id)
  if (updateUsersError) throw new Error(updateUsersError.message)
}
