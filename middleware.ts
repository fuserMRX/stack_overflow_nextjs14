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

const browserUserAgentRegex =
    /mozilla\/5\.0|applewebkit|chrome|safari|firefox|edg|opr\//i;

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
    if (!browserUserAgentRegex.test(userAgent)) return true;

    const accept = req.headers.get('accept') ?? '';
    const acceptLanguage = req.headers.get('accept-language') ?? '';
    const acceptEncoding = req.headers.get('accept-encoding') ?? '';
    const secFetchMode = req.headers.get('sec-fetch-mode') ?? '';
    const secFetchDest = req.headers.get('sec-fetch-dest') ?? '';
    const secFetchSite = req.headers.get('sec-fetch-site') ?? '';
    const secChUa = req.headers.get('sec-ch-ua') ?? '';
    const secChUaPlatform = req.headers.get('sec-ch-ua-platform') ?? '';
    const secChUaMobile = req.headers.get('sec-ch-ua-mobile') ?? '';

    const isHtmlAccept =
        accept.includes('text/html') || accept.includes('application/xhtml+xml');
    const hasBrowserHeaders = !!acceptLanguage && !!acceptEncoding;
    const hasSecFetch = !!secFetchMode && !!secFetchDest && !!secFetchSite;
    const hasClientHints = !!secChUa && !!secChUaPlatform && !!secChUaMobile;

    return !(isHtmlAccept && (hasSecFetch || hasClientHints || hasBrowserHeaders));
};

export default clerkMiddleware((auth, req) => {
    // Block obvious bots on public pages before hitting server components/actions.
    if (
        (req.method === 'GET' || req.method === 'HEAD') &&
        isBotSensitiveRoute(req) &&
        !hasBypassToken(req) &&
        isSuspiciousRequest(req)
    ) {
        return new NextResponse(null, { status: 403 });
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
