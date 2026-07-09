import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  email: string;
  role: 'cliente' | 'dono' | 'funcionario' | 'superadmin';
  exp: number;
}

function getUsuarioFromToken(token: string): TokenPayload | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const usuario = token ? getUsuarioFromToken(token) : null;
  const { pathname } = request.nextUrl;

  const rotaProtegida = pathname.startsWith('/dashboard');
  const rotaLogin = pathname === '/login';

  if (rotaProtegida && !usuario) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (rotaLogin && usuario) {
    const destino = usuario.role === 'dono' ? '/dashboard/dono' : '/dashboard/funcionario';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};