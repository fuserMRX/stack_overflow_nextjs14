// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Only protect routes that require authentication
const isProtectedRoute = createRouteMatcher([
    '/ask-question(.*)',
    '/collection(.*)',
    '/profile/edit(.*)',
    '/question/edit/(.*)',
]);

export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) {
        auth().protect();
    }
});

// IMPORTANT: Only run middleware on protected routes to minimize Edge Middleware invocations
export const config = {
    matcher: [
        '/ask-question',
        '/collection',
        '/profile/edit',
        '/question/edit/:path*',
    ],
};