'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import CartAside from '../../../context/CartAside';

const Header = () => {
  const { isOpen, toggleCart, cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // quantidade total de itens
  const totalItems = (cartItems ?? []).reduce((acc, item) => acc + item.qtd, 0);

  return (
    <>
      <header className="bg-red-600 text-white shadow-lg fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              aria-label="Voltar ao menu principal"
              scroll={false}
            >
              <div className="relative w-12 h-12">
                <Image
                  src="/img/logo.png"
                  alt="Pizzaria Bom Gosto"
                  fill
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <span className="text-2xl font-black overflow-hidden">
                Bella
                <strong className="text-amber-400 inline-block align-baseline">
                  Pizza
                </strong>
              </span>
            </Link>

            {/* Menu + Carrinho */}
            <div className="flex items-center gap-6">
              {/* Menu Desktop */}
              <nav className="hidden md:flex gap-6 uppercase font-semibold text-sm">
                <Link href="/#cardapio" className="hover:text-amber-400">
                  Cardápio
                </Link>
                <Link href="/#promocoes" className="hover:text-amber-400">
                  Promoções
                </Link>
                <Link href="/#sobre" className="hover:text-amber-400">
                  Sobre Nós
                </Link>
                <Link href="/#contato" className="hover:text-amber-400">
                  Contato
                </Link>
              </nav>

              {/* Carrinho */}
              <div className="relative">
                <button
                  onClick={toggleCart}
                  className="p-2 bg-red-700 rounded-full hover:bg-red-800 transition-colors"
                  aria-label="Carrinho de compras"
                >
                  <FaShoppingCart size={20} />
                </button>

                {/* Badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>

              {/* Menu Hambúrguer Mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 bg-red-700 rounded-full hover:bg-red-800 transition-colors"
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Menu Mobile */}
          <div
            className={`absolute right-3 top-12 shadow-sm md:hidden mt-3 bg-red-700 rounded-lg p-4 transition-all duration-300 overflow-hidden ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <nav className="flex flex-col gap-2 uppercase font-semibold text-sm">
              <Link href="/#cardapio" className="hover:text-amber-400">
                Cardápio
              </Link>
              <Link href="/#promocoes" className="hover:text-amber-400">
                Promoções
              </Link>
              <Link href="/#sobre" className="hover:text-amber-400">
                Sobre Nós
              </Link>
              <Link href="/#contato" className="hover:text-amber-400">
                Contato
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Carrinho Lateral */}
      <CartAside />
    </>
  );
};

export default Header;
