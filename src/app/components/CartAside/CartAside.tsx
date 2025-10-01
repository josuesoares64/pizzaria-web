'use client';
import { FiX } from 'react-icons/fi';
import React from "react";
import { useCart } from "../../../context/CartContext"; // <-- ajuste se sua pasta for diferente

export default function CartAside() {
  const { isOpen, closeCart, toggleCart, cartItems } = useCart();

  // Sempre renderiza para permitir transição; controlamos visibilidade por classes
  return (
    <aside
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg text-red-600">Seu Carrinho</h2>
        <button onClick={toggleCart}>
          <FiX className="text-zinc-800 font-black" size={20} />
        </button>
      </div>
      {cartItems.length > 0 ? (
        <ul>
          {cartItems.map(item => (
            <li key={item.id} className="border-b py-2">
              <span className="font-semibold">
                {item.flavors.map(f => f.name).join(' + ')}
              </span>{' '}
              <br />
              <span className="text-gray-600">
                Tamanho: {item.size} | Qtd: {item.qtd} | R${' '}
                {item.price.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Carrinho vazio</p>
      )}
    </aside>
  );
}
