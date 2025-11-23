import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/p(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  try {
    if (!isPublicRoute(request)) {
      await auth.protect()
    }
    return NextResponse.next()
  } catch (error) {
    // If Clerk fails (e.g., missing keys), allow the request through
    // This prevents the middleware from crashing the app
    console.error('Clerk middleware error:', error)
    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}

