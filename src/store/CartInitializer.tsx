'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrate } from '@/store/slices/cartSlice';
import { lerCarrinhoSalvo, lerPizzariaAtiva, salvarCarrinho } from '@/lib/cartStorage';

export function CartInitializer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const pizzariaId = useAppSelector((state) => state.cart.pizzariaId);
  const hidratado = useRef(false);

  useEffect(() => {
    const ativa = lerPizzariaAtiva();
    if (ativa) {
      dispatch(hydrate({ pizzariaId: ativa, items: lerCarrinhoSalvo(ativa) }));
    }
    hidratado.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hidratado.current) return;
    if (!pizzariaId) return;
    salvarCarrinho(pizzariaId, items);
  }, [items, pizzariaId]);

  return null;
}