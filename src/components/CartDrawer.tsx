'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, updateQuantidade } from '@/store/slices/cartSlice';

interface CartDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartDrawer({ aberto, aoFechar }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const total = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${aberto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={aoFechar}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-xl transform transition-transform flex flex-col ${aberto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Seu carrinho</h2>
          <button onClick={aoFechar} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-10">Seu carrinho está vazio.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="border-b pb-4">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{item.nomeExibicao}</p>
                    <button onClick={() => dispatch(removeItem(item.id))} className="text-gray-400 hover:text-red-600 text-xs">
                      remover
                    </button>
                  </div>
                  {(item.tamanhoNome || item.bordaNome) && (
                    <p className="text-xs text-gray-500">{[item.tamanhoNome, item.bordaNome].filter(Boolean).join(' • ')}</p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => dispatch(updateQuantidade({ id: item.id, quantidade: item.quantidade - 1 }))} className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">−</button>
                      <span className="text-sm w-4 text-center">{item.quantidade}</span>
                      <button onClick={() => dispatch(updateQuantidade({ id: item.id, quantidade: item.quantidade + 1 }))} className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">+</button>
                    </div>
                    <p className="text-sm font-semibold">{formatarPreco(item.precoUnitario * item.quantidade)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span className="font-medium">Total</span>
            <span className="font-bold">{formatarPreco(total)}</span>
          </div>
          <button disabled title="Em breve" className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
            Finalizar compra (em breve)
          </button>
        </div>
      </aside>
    </>
  );
}