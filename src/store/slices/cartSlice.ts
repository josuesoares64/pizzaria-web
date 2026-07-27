import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types/carrinho';

interface CartState {
  items: CartItem[];
  pizzariaId: string | null;
}

const initialState: CartState = {
  items: [],
  pizzariaId: null,
};

function gerarId(item: Pick<CartItem, 'produtoId' | 'produtoId2' | 'tamanhoId' | 'bordaId'>) {
  return [item.produtoId, item.produtoId2 ?? '', item.tamanhoId ?? '', item.bordaId ?? ''].join('-');
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'> & { pizzariaId: string }>) => {
      const { pizzariaId, ...itemData } = action.payload;

      // Segurança: garante que o pizzariaId do carrinho está sempre sincronizado
      if (state.pizzariaId !== pizzariaId) {
        state.pizzariaId = pizzariaId;
      }

      const id = gerarId(itemData);
      const existente = state.items.find((item) => item.id === id);

      if (existente) {
        existente.quantidade += itemData.quantidade;
      } else {
        state.items.push({ ...itemData, id });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantidade: (state, action: PayloadAction<{ id: string; quantidade: number }>) => {
      if (action.payload.quantidade <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
        return;
      }
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) item.quantidade = action.payload.quantidade;
    },
    clearCart: (state) => {
      state.items = [];
    },
    // Restaura o último carrinho ativo (chamado no boot do app, pelo CartInitializer)
    hydrate: (state, action: PayloadAction<{ pizzariaId: string | null; items: CartItem[] }>) => {
      state.pizzariaId = action.payload.pizzariaId;
      state.items = action.payload.items;
    },
    // Troca de carrinho quando o cliente entra em uma pizzaria diferente
    trocarPizzaria: (state, action: PayloadAction<{ pizzariaId: string; items: CartItem[] }>) => {
      state.pizzariaId = action.payload.pizzariaId;
      state.items = action.payload.items;
    },
  },
});

export const { addItem, removeItem, updateQuantidade, clearCart, hydrate, trocarPizzaria } = cartSlice.actions;
export default cartSlice.reducer;