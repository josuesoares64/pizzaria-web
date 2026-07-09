'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { decodeToken } from '@/lib/jwt';
import { useAppDispatch } from './hooks';
import { login } from './slices/authSlice';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const usuario = decodeToken(token);
      if (usuario) {
        dispatch(login(usuario));
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}