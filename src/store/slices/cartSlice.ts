import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types/carrinho';

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

function gerarId(item: Pick<CartItem, 'produtoId' | 'produtoId2' | 'tamanhoId' | 'bordaId'>) {
  return [item.produtoId, item.produtoId2 ?? '', item.tamanhoId ?? '', item.bordaId ?? ''].join('-');
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
      const id = gerarId(action.payload);
      const existente = state.items.find((item) => item.id === id);

      if (existente) {
        existente.quantidade += action.payload.quantidade;
      } else {
        state.items.push({ ...action.payload, id });
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
    hydrate: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addItem, removeItem, updateQuantidade, clearCart, hydrate } = cartSlice.actions;
export default cartSlice.reducer;