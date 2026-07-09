import { jwtDecode } from 'jwt-decode';
import { Usuario } from '@/types/auth';

interface TokenPayload {
  id: string;
  email: string;
  role: Usuario['role'];
  iat: number;
  exp: number;
}

export function decodeToken(token: string): Usuario | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}