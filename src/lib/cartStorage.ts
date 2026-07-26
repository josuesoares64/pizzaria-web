import { CartItem } from '@/types/carrinho';

const ACTIVE_PIZZARIA_KEY = 'bella-pizza-cart-active';
const cartKey = (pizzariaId: string) => `bella-pizza-cart:${pizzariaId}`;

export function lerCarrinhoSalvo(pizzariaId: string): CartItem[] {
  try {
    const salvo = localStorage.getItem(cartKey(pizzariaId));
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function salvarCarrinho(pizzariaId: string, items: CartItem[]) {
  localStorage.setItem(cartKey(pizzariaId), JSON.stringify(items));
  localStorage.setItem(ACTIVE_PIZZARIA_KEY, pizzariaId);
}

export function lerPizzariaAtiva(): string | null {
  return localStorage.getItem(ACTIVE_PIZZARIA_KEY);
}