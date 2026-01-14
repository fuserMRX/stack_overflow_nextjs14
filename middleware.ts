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

const isNextInternalRequest = (req: NextRequest) =>
    req.headers.get('rsc') === '1' ||
    req.headers.get('next-router-prefetch') === '1' ||
    !!req.headers.get('next-router-state-tree');

const hasBypassToken = (req: NextRequest) => {
    const token = process.env.BOT_BLOCK_BYPASS_TOKEN;
    if (!token) return false;

    return (
        req.headers.get('x-bypass-token') === token ||
        req.nextUrl.searchParams.get('bypass') === token
    );
};

const isSuspiciousRequest = (req: NextRequest) => {
    if (isNextInternalRequest(req)) return false;

    const userAgent = req.headers.get('user-agent') ?? '';
    if (!userAgent) return true;

    if (botUserAgentRegex.test(userAgent)) return true;

    const accept = req.headers.get('accept') ?? '';
    const acceptLanguage = req.headers.get('accept-language') ?? '';
    const acceptEncoding = req.headers.get('accept-encoding') ?? '';

    const isHtmlAccept =
        accept.includes('text/html') || accept.includes('application/xhtml+xml');
    const hasBrowserHeaders = !!acceptLanguage && !!acceptEncoding;

    return !(isHtmlAccept && hasBrowserHeaders);
};

export default clerkMiddleware((auth, req) => {
    // Block obvious bots on public pages before hitting server components/actions.
    if (
        (req.method === 'GET' || req.method === 'HEAD') &&
        isBotSensitiveRoute(req) &&
        !hasBypassToken(req) &&
        isSuspiciousRequest(req)
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
