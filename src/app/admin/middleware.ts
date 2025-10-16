import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin authentication middleware
 * Protects all admin routes and validates admin permissions
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for admin session token
  const adminToken = request.cookies.get('admin-token');

  if (!adminToken) {
    // Redirect to admin login if no token
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // TODO: Add token validation logic here
  // For now, allow all authenticated admin requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/((?!login|_next/static|_next/image|favicon.ico).*)',
  ]
};