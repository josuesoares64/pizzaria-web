import { CartItem } from '@/types/carrinho';

const ACTIVE_PIZZARIA_KEY = 'bella-pizza-cart-active';
const cartKey = (pizzariaId: string) => `bella-pizza-cart:${pizzariaId}`;

interface PizzariaAtiva {
  pizzariaId: string;
  slug: string;
}

export function lerCarrinhoSalvo(pizzariaId: string): CartItem[] {
  try {
    const salvo = localStorage.getItem(cartKey(pizzariaId));
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function salvarCarrinho(pizzariaId: string, slug: string, items: CartItem[]) {
  localStorage.setItem(cartKey(pizzariaId), JSON.stringify(items));
  localStorage.setItem(ACTIVE_PIZZARIA_KEY, JSON.stringify({ pizzariaId, slug }));
}

export function lerPizzariaAtiva(): PizzariaAtiva | null {
  try {
    const salvo = localStorage.getItem(ACTIVE_PIZZARIA_KEY);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}