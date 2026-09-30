'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Produto } from '@/types/produto';
import { Borda } from '@/types/borda';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { FiPlus, FiSliders } from 'react-icons/fi';
import { PizzaCustomizationModal } from './PizzaCustomizationModal';

interface ProdutoCardProps {
  produto: Produto;
  todasPizzas: Produto[];
  bordas: Borda[];
  pizzariaId: string;
  modalAberto: boolean;
  aoAbrirModal: () => void;
  aoFecharModal: () => void;
}

function formatarPreco(preco: string | number) {
  const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProdutoCard({
  produto,
  todasPizzas,
  bordas,
  pizzariaId,
  modalAberto,
  aoAbrirModal,
  aoFecharModal,
}: ProdutoCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const ehPizza = produto.precos !== undefined;

  const menorPreco = ehPizza
    ? produto
        .precos!.filter((p) => p.preco !== null && p.preco !== '')
        .map((p) => parseFloat(p.preco as string))
        .sort((a, b) => a - b)[0]
    : undefined;

  const desabilitado = ehPizza && menorPreco === undefined;

  function handleAcaoPrincipal() {
    if (desabilitado) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}&produto=${produto.id}`);
      return;
    }

    if (ehPizza) {
      aoAbrirModal();
      return;
    }

    dispatch(
      addItem({
        pizzariaId,
        produtoId: produto.id,
        nomeExibicao: produto.nome,
        precoUnitario: parseFloat(produto.preco ?? '0'),
        quantidade: 1,
      })
    );
  }

  return (
    <>
      <div
        onClick={handleAcaoPrincipal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAcaoPrincipal();
          }
        }}
        className={`group relative bg-white border border-neutral-200/90 rounded-2xl p-3.5 sm:p-4 flex gap-3.5 items-center justify-between shadow-2xs hover:shadow-md hover:border-red-200/90 transition-all duration-200 select-none cursor-pointer ${
          desabilitado ? 'opacity-60 cursor-not-allowed hover:shadow-2xs hover:border-neutral-200/90' : ''
        }`}
      >
        {/* Foto do Produto ou Placeholder */}
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl border border-neutral-100 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-102 transition-transform duration-200">
          {produto.imagem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={produto.imagem_url}
              alt={produto.nome}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-2xl opacity-60">
              {ehPizza ? '🍕' : '🥤'}
            </span>
          )}
        </div>

        {/* Textos Informativos */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors truncate">
              {produto.nome}
            </h3>
            {ehPizza && (
              <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded-md">
                Pizza
              </span>
            )}
          </div>

          {produto.descricao ? (
            <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5 leading-relaxed">
              {produto.descricao}
            </p>
          ) : (
            <p className="text-[11px] text-neutral-400 italic mt-0.5">
              Item tradicional da casa
            </p>
          )}

          {/* Preço formatado */}
          <div className="mt-2 flex items-baseline gap-1">
            {ehPizza ? (
              menorPreco !== undefined ? (
                <>
                  <span className="text-[11px] text-neutral-500">A partir de</span>
                  <span className="text-sm font-extrabold text-neutral-900 font-mono">
                    {formatarPreco(menorPreco)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Sem preço
                </span>
              )
            ) : (
              <span className="text-sm font-extrabold text-neutral-900 font-mono">
                {formatarPreco(produto.preco ?? '0')}
              </span>
            )}
          </div>
        </div>

        {/* Botão de Ação */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAcaoPrincipal();
          }}
          disabled={desabilitado}
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-xl px-3 py-2 text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-150 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
          title={ehPizza ? 'Personalizar sabores e borda' : 'Adicionar ao pedido'}
        >
          {ehPizza ? (
            <>
              <FiSliders size={14} />
              <span className="hidden sm:inline">Montar</span>
            </>
          ) : (
            <>
              <FiPlus size={15} />
              <span className="hidden sm:inline">Adicionar</span>
            </>
          )}
        </button>
      </div>

      {/* Modal de Customização de Pizza */}
      {ehPizza && modalAberto && (
        <PizzaCustomizationModal
          produto={produto}
          todasPizzas={todasPizzas}
          bordas={bordas}
          pizzariaId={pizzariaId}
          aoFechar={aoFecharModal}
        />
      )}
    </>
  );
}