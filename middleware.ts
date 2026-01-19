import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/p(.*)',
  '/discover-kruno(.*)',
  '/discover(.*)',
  '/api/newsletter/subscribe(.*)',
  '/api/newsletter/confirm(.*)',
  '/api/newsletter/unsubscribe(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/debug(.*)',
])

const isProtectedRoute = createRouteMatcher([
  '/trips(.*)',
  '/settings(.*)',
  '/api(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Only protect routes that are explicitly protected
  if (isProtectedRoute(request)) {
    try {
      await auth.protect()
    } catch (error) {
      // Fail securely: return 401 instead of allowing unauthorized access
      console.error('Clerk middleware auth error:', error)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}

