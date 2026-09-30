'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, updateQuantidade } from '@/store/slices/cartSlice';
import { FiTrash2, FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

interface CartDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartDrawer({ aberto, aoFechar }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((state) => state.cart.items);
  const total = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
  const totalItens = items.reduce((soma, item) => soma + item.quantidade, 0);

  // Fecha com a tecla ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && aberto) aoFechar();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, aoFechar]);

  // Evita scroll no body quando o drawer estiver aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  function irParaCheckout() {
    aoFechar();
    router.push('/checkout');
  }

  return (
    <>
      {/* Overlay com Fade e Blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-200 ${
          aberto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={aoFechar}
        aria-hidden="true"
      />

      {/* Drawer Lateral */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-neutral-50 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          aberto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Topo do Carrinho */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-200/80 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛍️</span>
            <div>
              <h2 className="font-extrabold text-base text-neutral-900 leading-tight">
                Sua Sacola
              </h2>
              <span className="text-[11px] text-neutral-400 font-medium">
                {totalItens} {totalItens === 1 ? 'item adicionado' : 'itens adicionados'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Fechar carrinho (ESC)"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
                <FiShoppingBag size={28} />
              </div>
              <p className="font-bold text-sm text-neutral-800">Sua sacola está vazia</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                Adicione suas pizzas, bebidas ou sobremesas favoritas para continuar o pedido.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between gap-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">
                      {item.nomeExibicao}
                    </p>

                    {(item.tamanhoNome || item.bordaNome) && (
                      <p className="text-[11px] font-medium text-neutral-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        {item.tamanhoNome && (
                          <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded font-mono">
                            {item.tamanhoNome}
                          </span>
                        )}
                        {item.bordaNome && (
                          <span className="bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                            Borda {item.bordaNome}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch(removeItem(item.id))}
                    className="text-neutral-300 hover:text-red-600 p-1 rounded-md transition-colors"
                    title="Remover item do pedido"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                {/* Linha de Quantidade e Subtotal */}
                <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantidade({ id: item.id, quantidade: item.quantidade - 1 })
                        )
                      }
                      className="w-6 h-6 rounded-lg bg-white hover:bg-neutral-200/80 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                    >
                      −
                    </button>
                    <span className="text-xs font-mono font-bold w-6 text-center text-neutral-800">
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantidade({ id: item.id, quantidade: item.quantidade + 1 })
                        )
                      }
                      className="w-6 h-6 rounded-lg bg-white hover:bg-neutral-200/80 border border-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center transition-colors shadow-2xs"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900">
                    {formatarPreco(item.precoUnitario * item.quantidade)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé Fixo */}
        <div className="p-4 sm:p-5 border-t border-neutral-200/80 bg-white space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Subtotal do Pedido
            </span>
            <span className="font-mono font-extrabold text-lg text-neutral-900">
              {formatarPreco(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={irParaCheckout}
            disabled={items.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-between group active:scale-98"
          >
            <span>Avançar para Pagamento</span>
            <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <FiArrowRight size={16} />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}