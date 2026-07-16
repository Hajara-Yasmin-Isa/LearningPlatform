import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * this creates a Supabase client for use in middleware
 * handles cookies properly for authentication state
 */
export async function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}


// this updates the user's session and refreshes the auth token if needed
export async function updateSession(request: NextRequest) {
  const { supabase, response } = await createClient(request)
  try {
    await supabase.auth.getUser()
  } catch {
    // Supabase unreachable (project cold-starting, network issue) —
    // pass the request through; page-level auth checks remain in place
  }
  return { supabase, response }
}