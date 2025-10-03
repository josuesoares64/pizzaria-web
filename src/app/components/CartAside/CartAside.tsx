'use client';
import { FiX } from 'react-icons/fi';
import React from "react";
import { useCart } from "../../../context/CartContext";
import { FaTrashAlt, FaPlus, FaMinus } from 'react-icons/fa';

export default function CartAside() {
  const { isOpen, toggleCart, cartItems, removeFromCart, updateQuantity } = useCart();

  const onIncrease = (itemId: number, currentQtd: number) => {
    updateQuantity(itemId, currentQtd + 1);
  };

  const onDecrease = (itemId: number, currentQtd: number) => {
    if (currentQtd > 1) {
      updateQuantity(itemId, currentQtd - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <aside className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 p-4 overflow-y-auto transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-red-600">Seu Carrinho</h2>
        <button onClick={toggleCart} className="hover:bg-gray-100 p-1 rounded">
          <FiX size={20} />
        </button>
      </div>

      {cartItems.length > 0 ? (
        <div className="space-y-3">
          {cartItems.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {item.flavors.map(f => f.name).join(' + ')}
                  </h3>
                  <p className="text-xs text-gray-600">{item.size}</p>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <FaTrashAlt size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDecrease(item.id, item.qtd)}
                    className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs hover:bg-gray-200"
                  >
                    <FaMinus />
                  </button>
                  <span className="font-semibold mx-2">{item.qtd}</span>
                  <button
                    onClick={() => onIncrease(item.id, item.qtd)}
                    className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs hover:bg-green-600"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-green-600">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <button className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 mt-3">
              Finalizar Pedido
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
      )}
    </aside>
  );
}