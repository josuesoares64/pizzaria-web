'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrate } from '@/store/slices/cartSlice';
import { lerCarrinhoSalvo, lerPizzariaAtiva, salvarCarrinho } from '@/lib/cartStorage';

export function CartInitializer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const pizzariaId = useAppSelector((state) => state.cart.pizzariaId);
  const pizzariaSlug = useAppSelector((state) => state.cart.pizzariaSlug);
  const hidratado = useRef(false);

  useEffect(() => {
    const ativa = lerPizzariaAtiva();
    if (ativa) {
      dispatch(hydrate({ pizzariaId: ativa.pizzariaId, pizzariaSlug: ativa.slug, items: lerCarrinhoSalvo(ativa.pizzariaId) }));
    }
    hidratado.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hidratado.current) return;
    if (!pizzariaId || !pizzariaSlug) return;
    salvarCarrinho(pizzariaId, pizzariaSlug, items);
  }, [items, pizzariaId, pizzariaSlug]);

  return null;
}