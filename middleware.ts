import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Only protect non-public routes
  if (!isPublicRoute(req)) {
    const { userId } = await auth()
    
    // If user is not authenticated, redirect to home (which has sign-in)
    if (!userId) {
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
