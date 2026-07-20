import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'


// /courses is intentionally NOT protected — the courses table's RLS policy
// allows anonymous reads of published courses, and both the catalog and
// course detail pages already handle userId === null gracefully, gating
// only the actual "enroll" action with their own redirect to /auth/login.
const PROTECTED_ROUTES = ['/dashboard', '/lessons']
const AUTH_ROUTES = ['/auth/login', '/auth/signup']

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (pathname === route) return true
    if (pathname.startsWith(route + '/')) return true
    return false
  })
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES)
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES)

  // when unauthenticated user trying to access protected route
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // when the authenticated user trying to access auth routes
  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/lessons/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}