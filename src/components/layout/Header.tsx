'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '../cardapio/CartDrawer';

export function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const totalItens = useAppSelector((state) => state.cart.items.reduce((soma, item) => soma + item.quantidade, 0));

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-bold text-lg text-red-600">🍕 Bella Pizza</span>

          <button onClick={() => setCarrinhoAberto(true)} className="relative p-2" aria-label="Abrir carrinho">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.987-4.708 2.576-7.183.075-.312-.174-.6-.494-.6H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItens > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItens}
              </span>
            )}
          </button>
        </div>
      </header>

      <CartDrawer aberto={carrinhoAberto} aoFechar={() => setCarrinhoAberto(false)} />
    </>
  );
}