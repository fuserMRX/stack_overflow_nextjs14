// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only protect routes that require authentication
const isProtectedRoute = createRouteMatcher([
    '/ask-question(.*)',
    '/collection(.*)',
    '/profile/edit(.*)',
    '/question/edit/(.*)',
]);

const isBotSensitiveRoute = createRouteMatcher([
    '/',
    '/ask-question(.*)',
    '/collection(.*)',
    '/community(.*)',
    '/profile(.*)',
    '/question(.*)',
    '/tags(.*)',
]);

const botUserAgentRegex =
    /bot|crawler|spider|crawl|slurp|curl|wget|python-requests|httpclient|libwww|scrapy|axios|go-http-client|java|okhttp|wordpress|ahrefs|semrush|mj12bot|dotbot|yandex|bingbot|googlebot|duckduckbot|baiduspider|sogou|facebookexternalhit|facebot|ia_archiver|bitlybot|skypeuripreview|pinterest|discordbot|slackbot|telegrambot|whatsapp|wechat/i;

const isBotRequest = (req: NextRequest) => {
    const userAgent = req.headers.get('user-agent') ?? '';
    if (!userAgent) return false;
    return botUserAgentRegex.test(userAgent);
};

export default clerkMiddleware((auth, req) => {
    // Block obvious bots on public pages before hitting server components/actions.
    if (
        (req.method === 'GET' || req.method === 'HEAD') &&
        isBotSensitiveRoute(req) &&
        isBotRequest(req)
    ) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    if (isProtectedRoute(req)) {
        auth().protect();
    }

    return NextResponse.next();
});

// IMPORTANT: Run middleware on non-static pages to stop bot traffic early.
export const config = {
    matcher: ['/((?!_next|api|trpc|.*\\..*).*)'],
};
