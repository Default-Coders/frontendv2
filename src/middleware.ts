import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;

  const isPublicRoute = path === '/' || path === '/login' || path.startsWith('/sobre');
  const isAdminRoute = path.startsWith('/admin');
  const isAlunoRoute = path.startsWith('/aluno');

  if (!role && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (role && (path === '/login' || path === '/')) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'ALUNO') return NextResponse.redirect(new URL('/aluno/dashboard', request.url));
  }

  if (role === 'ALUNO' && isAdminRoute) {
    return NextResponse.redirect(new URL('/aluno/dashboard', request.url));
  }
  
  if (role === 'ADMIN' && isAlunoRoute) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)'],
};
