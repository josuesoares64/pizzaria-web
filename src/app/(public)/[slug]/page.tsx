'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { pizzariaService } from '@/server/pizzaria.service';
import { PizzariaDetalhe } from '@/types/pizzaria';
import { ProdutoCard } from '@/components/cardapio/ProdutoCard';
import { FiMapPin, FiPhone, FiAlertTriangle, FiShoppingBag } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { trocarPizzaria } from '@/store/slices/cartSlice';
import { lerCarrinhoSalvo } from '@/lib/cartStorage';
import { WhatsappButton } from '@/components/WhatsappButton';

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
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<string | null>(null);

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

    dispatch(trocarPizzaria({ pizzariaId: pizzaria.id, pizzariaSlug: slug, items: lerCarrinhoSalvo(pizzaria.id) }));
  }, [pizzaria, pizzariaIdAtiva, dispatch, slug]);

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

  // Scroll-spy: destaca a categoria visível na nav sticky enquanto o cliente rola a página
  useEffect(() => {
    if (!pizzaria || pizzaria.categorias.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries.find((entry) => entry.isIntersecting);
        if (visivel) {
          const id = visivel.target.getAttribute('data-categoria-id');
          if (id) setCategoriaAtivaId(id);
        }
      },
      { rootMargin: '-96px 0px -75% 0px', threshold: 0 }
    );

    const secoes = document.querySelectorAll('[data-categoria-id]');
    secoes.forEach((secao) => observer.observe(secao));

    return () => observer.disconnect();
  }, [pizzaria]);

  function handleClickCategoria(id: string) {
    setCategoriaAtivaId(id);
    document.querySelector(`[data-categoria-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <span className="sr-only">Carregando cardápio...</span>
        <div className="mb-10 pb-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-64 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (erro || !pizzaria) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <FiAlertTriangle className="mx-auto text-gray-300" size={40} />
        <p className="mt-4 text-lg font-medium text-gray-900">Não encontramos essa pizzaria</p>
        <p className="mt-1 text-sm text-gray-500">Confira se o link está certo e tente novamente.</p>
      </div>
    );
  }

  const todasPizzas = pizzaria.categorias.flatMap((c) => c.produtos.filter((p) => p.precos !== undefined));
  const idAtivo = categoriaAtivaId ?? pizzaria.categorias[0]?.id;

  return (
    <div>
      {/* Header — chrome neutro da plataforma, não assume a identidade visual da pizzaria */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 flex items-center gap-4">
          {pizzaria.logo_url ? (
            <img
              src={pizzaria.logo_url}
              alt={`Logo ${pizzaria.nome}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/15 shrink-0 bg-white"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {pizzaria.nome.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 truncate">{pizzaria.nome}</h1>
            <div className="flex flex-col gap-1 text-sm text-white/70">
              {pizzaria.endereco && (
                <p className="flex items-center gap-1.5">
                  <FiMapPin size={14} className="shrink-0" />
                  <span className="truncate">{pizzaria.endereco}</span>
                </p>
              )}
              {pizzaria.telefone && (
                <p className="flex items-center gap-1.5">
                  <FiPhone size={14} className="shrink-0" />
                  {pizzaria.telefone}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Nav de categorias — só aparece se houver mais de uma, senão é ruído sem função */}
      {pizzaria.categorias.length > 1 && (
        <nav className="sticky top-[57px] z-20 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
            {pizzaria.categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => handleClickCategoria(categoria.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  idAtivo === categoria.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-300'
                }`}
              >
                {categoria.nome}
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">
        {pizzaria.categorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 mt-16 text-center text-gray-400">
            <FiShoppingBag size={28} />
            <p className="font-medium text-gray-500">O cardápio ainda está sendo preparado</p>
            <p className="text-sm">Volte em breve para conferir os produtos.</p>
          </div>
        ) : (
          pizzaria.categorias.map((categoria) => (
            <div key={categoria.id} data-categoria-id={categoria.id} className="mb-10 scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-6 bg-red-600 rounded-sm shrink-0" />
                <h2 className="text-xl font-semibold text-gray-900">{categoria.nome}</h2>
                <span className="text-sm text-gray-400">({categoria.produtos.length})</span>
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
      <WhatsappButton
  telefone={pizzaria.telefone}
  mensagem={`Olá! Tenho uma dúvida sobre o cardápio da ${pizzaria.nome}.`}
/>
    </div>
  );
}