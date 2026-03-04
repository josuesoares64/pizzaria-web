// src/context/CartContext.tsx
"use client";
import { createContext, useContext, useState, useCallback } from "react";
import type { PizzaItem } from "@/data/menuData";

export interface CartItem {
  id: number;            // id único do item no carrinho
  flavors: PizzaItem[];  // até 2 sabores
  size: string;          // Pequena, Média, Grande
  price: number;         // preço total da pizza (já calculado)
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
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  updateQuantity: (id: number, qtd: number) => void;
}

// Função para calcular preço da pizza meio a meio
const calculatePizzaPrice = (flavors: PizzaItem[], size: string): number => {
  if (flavors.length === 1) {
    // Pizza inteira - retorna preço normal
    const flavor = flavors[0];
    const priceObj = flavor.prices.find(p => p.size === size);
    return priceObj ? priceObj.price : 0;
  }
  
  if (flavors.length === 2) {
    // Pizza meio a meio - calcula média dos preços
    let total = 0;
    let validPrices = 0;
    
    flavors.forEach(flavor => {
      const priceObj = flavor.prices.find(p => p.size === size);
      if (priceObj) {
        // Divide o preço pela metade para cada sabor
        total += priceObj.price / 2;
        validPrices++;
      }
    });
    
    // Se algum sabor não tem preço para o tamanho, retorna 0
    return validPrices === flavors.length ? total : 0;
  }
  
  return 0;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((item: Omit<CartItem, "id" | "price">) => {
    setCartItems((prev) => {
      // Calcula o preço baseado nos sabores e tamanho
      const unitPrice = calculatePizzaPrice(item.flavors, item.size);
      
      // Verifica se o preço é válido
      if (unitPrice === 0) {
        console.error('Preço não encontrado para os sabores/tamanho selecionados');
        return prev;
      }
      
      // Procura se já existe no carrinho (mesmo tamanho + mesmos sabores)
      const existingIndex = prev.findIndex(
        (cartItem) =>
          cartItem.size === item.size &&
          cartItem.flavors.map(f => f.id).sort().join(",") ===
            item.flavors.map(f => f.id).sort().join(",")
      );

      // Se já existe → aumenta qtd e recalcula preço total
      if (existingIndex !== -1) {
        const updated = [...prev];
        const newQtd = updated[existingIndex].qtd + item.qtd;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qtd: newQtd,
          price: unitPrice * newQtd
        };
        return updated;
      }
      
      // Se não existe → adiciona um novo
      return [...prev, { 
        id: Date.now(), 
        ...item, 
        price: unitPrice * item.qtd
      }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, qtd: number) => {
    if (qtd <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const unitPrice = calculatePizzaPrice(item.flavors, item.size);
          return {
            ...item,
            qtd: qtd,
            price: unitPrice * qtd
          };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.qtd, 0);
  }, [cartItems]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((p) => !p), []);

  return (
    <CartContext.Provider
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        isOpen, 
        toggleCart, 
        openCart, 
        closeCart,
        getCartTotal,
        getCartItemsCount,
        updateQuantity
      }}
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

// Função auxiliar para exibir detalhes dos preços
export const getPriceBreakdown = (cartItem: CartItem) => {
  return cartItem.flavors.map(flavor => {
    const priceObj = flavor.prices.find(p => p.size === cartItem.size);
    const price = priceObj ? priceObj.price / cartItem.flavors.length : 0;
    return {
      flavor: flavor.name,
      unitPrice: price,
      fullPrice: priceObj ? priceObj.price : 0
    };
  });
};