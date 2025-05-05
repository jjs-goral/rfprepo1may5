import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/projects'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Define auth routes (login, register, etc.)
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If the user is not logged in and trying to access a protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and trying to access an auth route
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the user is not logged in and accessing the root path
  if (request.nextUrl.pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and accessing the root path
  if (request.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/', '/dashboard/:path*', '/projects/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
};
