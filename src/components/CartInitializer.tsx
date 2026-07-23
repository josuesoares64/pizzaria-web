'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrate } from '@/store/slices/cartSlice';

const CART_STORAGE_KEY = 'bella-pizza-cart';

export function CartInitializer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const hidratado = useRef(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CART_STORAGE_KEY);
    if (salvo) {
      try {
        dispatch(hydrate(JSON.parse(salvo)));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    hidratado.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hidratado.current) return; // evita sobrescrever antes de hidratar
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  return null;
}