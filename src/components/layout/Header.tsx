'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { FiArrowLeft, FiShoppingBag, FiUser, FiLogOut } from 'react-icons/fi';
import { CartDrawer } from '../cardapio/CartDrawer';

export function Header() {
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const usuario = useAppSelector((state) => state.auth.usuario);
  const totalItens = useAppSelector((state) =>
    state.cart.items.reduce((soma, item) => soma + item.quantidade, 0)
  );

  function handleLogout() {
    Cookies.remove('token');
    dispatch(logout());
    router.push('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs select-none">
        <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex justify-between items-center">
          {/* Lado Esquerdo: Botão Voltar & Marca */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Voltar para a página anterior"
            >
              <FiArrowLeft size={18} />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
                🍕
              </div>
              <span className="font-black text-base tracking-tight text-neutral-900 group-hover:text-red-600 transition-colors">
                Forno<span className="text-red-600">Menu</span>
              </span>
            </Link>
          </div>

          {/* Lado Direito: Usuário & Sacola */}
          <div className="flex items-center gap-2 sm:gap-3">
            {usuario ? (
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 rounded-xl px-2.5 py-1.5">
                <Link
                  href="/pedidos"
                  className="text-xs font-semibold text-neutral-700 hover:text-red-600 transition-colors flex items-center gap-1.5"
                  title="Ver meus pedidos"
                >
                  <FiUser size={13} className="text-neutral-400" />
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {usuario.nome?.split(' ')[0] || 'Minha conta'}
                  </span>
                </Link>

                <span className="text-neutral-300 text-xs">•</span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1"
                  title="Sair da conta"
                >
                  <FiLogOut size={12} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Entrar
              </Link>
            )}

            {/* Botão da Sacola com Badge */}
            <button
              type="button"
              onClick={() => setCarrinhoAberto(true)}
              className="relative p-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-all active:scale-95"
              aria-label="Abrir sacola de pedidos"
            >
              <FiShoppingBag size={20} />

              {totalItens > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-mono font-bold text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-150">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer da Sacola */}
      <CartDrawer aberto={carrinhoAberto} aoFechar={() => setCarrinhoAberto(false)} />
    </>
  );
}