// src/context/CartContext.tsx
"use client";
import { createContext, useContext, useState, useCallback } from "react";
import type { PizzaItem } from "@/data/menu";

export interface CartItem {
  id: number;            // id único do item no carrinho
  flavors: PizzaItem[];  // até 2 sabores
  size: string;          // Pequena, Média, Grande
  price: number;         // preço da pizza
  qtd: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: number) => void;
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    setCartItems((prev) => [
      ...prev,
      { id: Date.now(), ...item }, // id único
    ]);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((p) => !p), []);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, isOpen, toggleCart, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};
