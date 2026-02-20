import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// user profile shape returned by this endpoint
// email comes from auth.users, all other fields come from the public users table
// interface used as type definition for line 66
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

  // if a shared server client helper is added
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

  // once server.ts is implemented in lib/supabase/ remove 18-38 and add const supabase = await createClient()


  // validate the session server-side and get the authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // query the public users table for profile fields (password is never selected)
  // RLS makes sure only rows accessible to the authenticated user are returned
  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, role, created_at')
    .eq('id', authUser.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'User not found' }, { status: 500 })
  }

  // Combine users table data with email from auth.users (since email
  // is not stored in the public users table — supabase manages it separately) (authUser)
  const user: User = {
    ...data,
    email: authUser.email ? authUser.email : '',    
  }

  return NextResponse.json(user)
}