'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Produto } from '@/types/produto';
import { Borda } from '@/types/borda';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { PizzaCustomizationModal } from './PizzaCustomizationModal';

interface ProdutoCardProps {
  produto: Produto;
  todasPizzas: Produto[];
  bordas: Borda[];
  modalAberto: boolean;
  aoAbrirModal: () => void;
  aoFecharModal: () => void;
}

function formatarPreco(preco: string | number) {
  const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProdutoCard({ produto, todasPizzas, bordas, modalAberto, aoAbrirModal, aoFecharModal }: ProdutoCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const ehPizza = produto.precos !== undefined;

  function handleAdicionar() {
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
        produtoId: produto.id,
        nomeExibicao: produto.nome,
        precoUnitario: parseFloat(produto.preco ?? '0'),
        quantidade: 1,
      })
    );
  }

  const menorPreco = ehPizza
    ? produto.precos!.filter((p) => p.preco !== null).map((p) => parseFloat(p.preco as string)).sort((a, b) => a - b)[0]
    : undefined;

  return (
    <>
      <div className="border rounded-xl p-4 flex gap-4 items-center bg-white shadow-sm hover:shadow-md transition-shadow">
        {produto.imagem_url && (
          <img src={produto.imagem_url} alt={produto.nome} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{produto.nome}</p>
          {produto.descricao && <p className="text-sm text-gray-500 line-clamp-2">{produto.descricao}</p>}
          <p className="text-sm font-semibold mt-1 text-gray-900">
            {ehPizza
              ? menorPreco !== undefined ? `A partir de ${formatarPreco(menorPreco)}` : 'Em breve'
              : formatarPreco(produto.preco ?? '0')}
          </p>
        </div>
        <button
          onClick={handleAdicionar}
          disabled={ehPizza && menorPreco === undefined}
          className="bg-red-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          Adicionar
        </button>
      </div>

      {ehPizza && modalAberto && (
        <PizzaCustomizationModal produto={produto} todasPizzas={todasPizzas} bordas={bordas} aoFechar={aoFecharModal} />
      )}
    </>
  );
}