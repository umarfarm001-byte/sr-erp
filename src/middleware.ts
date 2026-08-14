import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Exclude API routes and static assets from middleware redirection
  if (
    request.nextUrl.pathname.startsWith('/api') || 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If there is no token and the user is NOT on the login page, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a token and the user IS on the login page, redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
