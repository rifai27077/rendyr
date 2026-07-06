import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('sb-access-token')?.value;

  // Protect Admin Dashboard Routes
  if (pathname.startsWith('/admin')) {
    // 1. If on login page and has a token, redirect to dashboard
    if (pathname === '/admin/login') {
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // 2. If accessing any other admin path and has no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      // Optional: save search query parameter for post-login return url redirect
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
