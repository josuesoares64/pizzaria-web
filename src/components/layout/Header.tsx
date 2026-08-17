'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { FiArrowLeft } from 'react-icons/fi';
import { CartDrawer } from '../cardapio/CartDrawer';

export function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const usuario = useAppSelector((state) => state.auth.usuario);
  const totalItens = useAppSelector((state) => state.cart.items.reduce((soma, item) => soma + item.quantidade, 0));

  function handleLogout() {
    Cookies.remove('token');
    dispatch(logout());
    router.push('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              aria-label="Voltar"
            >
              <FiArrowLeft size={20} />
            </button>
            <span className="font-bold text-lg text-red-600">FornoMenu</span>
          </div>

          <div className="flex items-center gap-3">
            {usuario && (
              <button
                onClick={handleLogout}
                className="text-xs text-neutral-500 hover:text-red-600 transition-colors"
              >
                Sair
              </button>
            )}

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
        </div>
      </header>

      <CartDrawer aberto={carrinhoAberto} aoFechar={() => setCarrinhoAberto(false)} />
    </>
  );
}