import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/interview', '/onboarding'];

// Routes that logged-in users should NOT visit (redirect to dashboard)
const AUTH_ROUTES = ['/login', '/signup'];

/**
 * Lightweight JWT payload decode for Edge Runtime.
 * We only need to check expiry + presence of userId here.
 * Full cryptographic verification happens inside API route handlers.
 */
function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    // base64url → base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function isSessionValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number' || !payload.userId) return false;
  return payload.exp > Math.floor(Date.now() / 1000);
}

function isProfileCompleted(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeTokenPayload(token);
  return payload?.profileCompleted === true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('if_token')?.value;
  const authenticated = isSessionValid(token);
  const profileCompleted = isProfileCompleted(token);

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p));
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isHomeRoute = pathname === '/';

  // Keep landing page only for logged-out users.
  if (authenticated && isHomeRoute) {
    const url = req.nextUrl.clone();
    url.pathname = profileCompleted ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && !profileCompleted && isProtected && !isOnboardingRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && profileCompleted && isOnboardingRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('callbackUrl');
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/signup
  if (isAuthRoute && authenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/interview/:path*', '/onboarding', '/login', '/signup'],
};
