import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// user profile shape returned by this endpoint
// email comes from auth.users, all other fields come from the public users table
interface User {
  id: string
  name: string
  username: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  created_at: string
}

// GET /api/user/me — returns the authenticated user's profile
export async function GET() {
  const cookieStore = await cookies()

  // Server-side routes need their own Supabase client to access auth cookies.
  // Created inline here for now — if a shared server client helper is added
  // to lib/supabase/ later, this should be replaced with that import.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Validate the session server-side and retrieve the authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
