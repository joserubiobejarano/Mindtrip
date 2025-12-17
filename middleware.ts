import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/p(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/debug(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Only protect non-public routes
  if (!isPublicRoute(request)) {
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

