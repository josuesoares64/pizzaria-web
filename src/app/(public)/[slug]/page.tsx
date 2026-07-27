'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { pizzariaService } from '@/server/pizzaria.service';
import { PizzariaDetalhe } from '@/types/pizzaria';
import { ProdutoCard } from '@/components/cardapio/ProdutoCard';
import { FiMapPin, FiLoader, FiAlertTriangle, FiShoppingBag } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { trocarPizzaria } from '@/store/slices/cartSlice';
import { lerCarrinhoSalvo } from '@/lib/cartStorage';

export default function PizzariaPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pizzariaIdAtiva = useAppSelector((state) => state.cart.pizzariaId);

  const [pizzaria, setPizzaria] = useState<PizzariaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [produtoModalId, setProdutoModalId] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPizzaria() {
      try {
        const data = await pizzariaService.buscarPorSlug(slug);
        setPizzaria(data);
      } catch {
        setErro('Pizzaria não encontrada.');
      } finally {
        setCarregando(false);
      }
    }

    carregarPizzaria();
  }, [slug]);

  // Troca o carrinho ativo quando o cliente entra em uma pizzaria diferente
  useEffect(() => {
    if (!pizzaria) return;
    if (pizzariaIdAtiva === pizzaria.id) return; // já é a pizzaria ativa, não sobrescreve

    dispatch(trocarPizzaria({ pizzariaId: pizzaria.id, items: lerCarrinhoSalvo(pizzaria.id) }));
  }, [pizzaria, pizzariaIdAtiva, dispatch]);

  useEffect(() => {
    if (!pizzaria) return;
    const produtoId = searchParams.get('produto');
    if (!produtoId) return;

    const produto = pizzaria.categorias.flatMap((c) => c.produtos).find((p) => p.id === produtoId);
    if (produto?.precos !== undefined) {
      setProdutoModalId(produtoId);
    }

    router.replace(`/${slug}`);
  }, [pizzaria, searchParams, router, slug]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-400">
        <FiLoader className="animate-spin" size={28} />
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  if (erro || !pizzaria) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-red-600 text-center px-4">
        <FiAlertTriangle size={28} />
        <p>{erro || 'Erro ao carregar.'}</p>
      </div>
    );
  }

  const todasPizzas = pizzaria.categorias.flatMap((c) => c.produtos.filter((p) => p.precos !== undefined));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10 pb-6 border-b border-gray-100 flex items-center gap-4">
        {pizzaria.logo_url ? (
          <img
            src={pizzaria.logo_url}
            alt={`Logo ${pizzaria.nome}`}
            className="w-16 h-16 rounded-full object-cover border border-gray-100 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {pizzaria.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{pizzaria.nome}</h1>
          <p className="flex items-center gap-1.5 text-gray-500">
            <FiMapPin size={15} className="text-red-600 shrink-0" />
            {pizzaria.endereco}
          </p>
        </div>
      </div>

      {pizzaria.categorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 mt-16 text-gray-400">
          <FiShoppingBag size={28} />
          <p>Nenhum produto cadastrado ainda.</p>
        </div>
      ) : (
        pizzaria.categorias.map((categoria) => (
          <div key={categoria.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-6 bg-red-600 rounded-sm shrink-0" />
              <h2 className="text-xl font-semibold text-gray-900">{categoria.nome}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoria.produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  todasPizzas={todasPizzas}
                  bordas={pizzaria.bordas}
                  pizzariaId={pizzaria.id}
                  modalAberto={produtoModalId === produto.id}
                  aoAbrirModal={() => setProdutoModalId(produto.id)}
                  aoFecharModal={() => setProdutoModalId(null)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}