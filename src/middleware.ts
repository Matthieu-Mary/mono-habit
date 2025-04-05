import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Si l'utilisateur n'est pas connecté via NextAuth
  if (!token) {
    // Rediriger vers la page de login
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Routes qui nécessitent une authentification
    "/dashboard/:path*",
    "/habits/:path*",
  ],
};
