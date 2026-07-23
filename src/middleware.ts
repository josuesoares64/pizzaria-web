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

  // 1. Não logado tentando acessar rota protegida → login
  if (rotaProtegida && !usuario) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Logado, mas tentando acessar dashboard de outro role
  if (usuario) {
    const rotaDono = pathname.startsWith('/dashboard/dono');
    const rotaFuncionario = pathname.startsWith('/dashboard/funcionario');

    if (rotaDono && usuario.role !== 'dono') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (rotaFuncionario && usuario.role !== 'funcionario' && usuario.role !== 'dono') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Já logado tentando acessar /login → manda pro dashboard certo
  if (rotaLogin && usuario) {
    const destino = usuario.role === 'dono' ? '/dashboard/dono' : '/dashboard/funcionario';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};