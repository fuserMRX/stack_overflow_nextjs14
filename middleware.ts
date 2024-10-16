// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a route matcher for protected routes
const isProtectedRoute = createRouteMatcher(['/ask-question(.*)']);

// Function to validate the 'page' query parameter
function validatePageParameter(req: NextRequest): NextResponse | undefined {
    const url = req.nextUrl.clone();

    if (url.searchParams.has('page')) {
        const pageParam = url.searchParams.get('page') || '1';
        const pageNumber = Number(pageParam);

        if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
            url.searchParams.set('page', '1');

            return NextResponse.redirect(url);
        }
    }

    // Return undefined to indicate no response to return
    return undefined;
}

// Export the default middleware using Clerk's approach
export default clerkMiddleware((auth, req) => {
    // Handle authentication
    if (isProtectedRoute(req)) {
        auth().protect();
    }

    // Validate 'page' parameter
    const validationResponse = validatePageParameter(req);
    if (validationResponse) {
        return validationResponse;
    }

    // Continue processing
    return NextResponse.next();
});

export const config = {
    matcher: [
      // Skip Next.js internals and all static files, unless found in search params
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // Always run for API routes
      '/(api|trpc)(.*)',
    ],
  }