'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { pizzariaService } from '@/server/pizzaria.service';
import { PizzariaDetalhe } from '@/types/pizzaria';
import { ProdutoCard } from '@/components/cardapio/ProdutoCard';
import { FiMapPin, FiPhone, FiAlertTriangle, FiShoppingBag, FiSearch, FiX } from 'react-icons/fi';
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
  const [termoBusca, setTermoBusca] = useState('');

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
    if (pizzariaIdAtiva === pizzaria.id) return;

    dispatch(
      trocarPizzaria({
        pizzariaId: pizzaria.id,
        pizzariaSlug: slug,
        items: lerCarrinhoSalvo(pizzaria.id),
      })
    );
  }, [pizzaria, pizzariaIdAtiva, dispatch, slug]);

  useEffect(() => {
    if (!pizzaria) return;
    const produtoId = searchParams.get('produto');
    if (!produtoId) return;

    const produto = pizzaria.categorias
      .flatMap((c) => c.produtos)
      .find((p) => p.id === produtoId);

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
      { rootMargin: '-110px 0px -70% 0px', threshold: 0 }
    );

    const secoes = document.querySelectorAll('[data-categoria-id]');
    secoes.forEach((secao) => observer.observe(secao));

    return () => observer.disconnect();
  }, [pizzaria]);

  function handleClickCategoria(id: string) {
    setCategoriaAtivaId(id);
    const elemento = document.querySelector(`[data-categoria-id="${id}"]`);
    if (elemento) {
      const topOffset = 120;
      const elementPosition = elemento.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }

  // Filtro de produtos por busca em tempo real
  const categoriasFiltradas = useMemo(() => {
    if (!pizzaria) return [];
    if (!termoBusca.trim()) return pizzaria.categorias;

    const termo = termoBusca.toLowerCase().trim();
    return pizzaria.categorias
      .map((cat) => ({
        ...cat,
        produtos: cat.produtos.filter(
          (prod) =>
            prod.nome.toLowerCase().includes(termo) ||
            prod.descricao?.toLowerCase().includes(termo)
        ),
      }))
      .filter((cat) => cat.produtos.length > 0);
  }, [pizzaria, termoBusca]);

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-pulse space-y-8">
        <span className="sr-only">Carregando cardápio...</span>
        {/* Skeleton Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-200 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-6 sm:h-8 w-48 sm:w-64 bg-neutral-200 rounded-lg" />
            <div className="h-4 w-40 bg-neutral-100 rounded-md" />
            <div className="h-3.5 w-56 bg-neutral-100 rounded-md" />
          </div>
        </div>
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-2xl border border-neutral-200/60" />
          ))}
        </div>
      </div>
    );
  }

  if (erro || !pizzaria) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <FiAlertTriangle size={28} />
        </div>
        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Pizzaria não encontrada</h1>
        <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
          O link que você acessou pode estar incorreto ou o estabelecimento alterou o endereço do cardápio.
        </p>
      </div>
    );
  }

  const todasPizzas = pizzaria.categorias.flatMap((c) =>
    c.produtos.filter((p) => p.precos !== undefined)
  );
  const idAtivo = categoriaAtivaId ?? pizzaria.categorias[0]?.id;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* HEADER DA PIZZARIA */}
      <header className="bg-neutral-950 text-white border-b border-neutral-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
            {pizzaria.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pizzaria.logo_url}
                alt={`Logo ${pizzaria.nome}`}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shrink-0 bg-white shadow-lg"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center text-3xl font-extrabold shrink-0 border-2 border-white/20 shadow-lg">
                {pizzaria.nome.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                  {pizzaria.nome}
                </h1>
                <span className="inline-flex items-center gap-1.5 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cardápio Aberto
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-neutral-300">
                {pizzaria.endereco && (
                  <p className="flex items-center gap-1.5">
                    <FiMapPin size={13} className="shrink-0 text-red-400" />
                    <span className="truncate max-w-xs">{pizzaria.endereco}</span>
                  </p>
                )}
                {pizzaria.telefone && (
                  <p className="flex items-center gap-1.5">
                    <FiPhone size={13} className="shrink-0 text-emerald-400" />
                    <span>{pizzaria.telefone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Campo de Busca Rápida no Cardápio */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <div className="relative max-w-md">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar pizzas, bebidas, sobremesas..."
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
              {termoBusca && (
                <button
                  type="button"
                  onClick={() => setTermoBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
                  title="Limpar busca"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NAVEGAÇÃO DE CATEGORIAS STICKY */}
      {pizzaria.categorias.length > 1 && !termoBusca && (
        <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
          <div className="max-w-4xl mx-auto px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {pizzaria.categorias.map((categoria) => {
              const ativa = idAtivo === categoria.id;
              return (
                <button
                  key={categoria.id}
                  onClick={() => handleClickCategoria(categoria.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    ativa
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
                  }`}
                >
                  {categoria.nome}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* LISTAGEM DE CATEGORIAS E PRODUTOS */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {categoriasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-neutral-400 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs">
            <FiShoppingBag size={32} className="text-neutral-300" />
            <p className="font-bold text-sm text-neutral-800">
              {termoBusca ? 'Nenhum produto encontrado' : 'Cardápio em preparação'}
            </p>
            <p className="text-xs text-neutral-500 max-w-xs">
              {termoBusca
                ? `Não encontramos itens correspondentes a "${termoBusca}". Tente outro termo.`
                : 'Esta pizzaria ainda não cadastrou produtos ativos. Volte em instantes!'}
            </p>
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca('')}
                className="mt-3 text-xs font-bold text-red-600 hover:underline"
              >
                Limpar busca e ver cardápio completo
              </button>
            )}
          </div>
        ) : (
          categoriasFiltradas.map((categoria) => (
            <section
              key={categoria.id}
              data-categoria-id={categoria.id}
              className="mb-10 scroll-mt-24"
            >
              {/* Cabeçalho da Categoria */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-1.5 h-5 bg-red-600 rounded-full shrink-0" />
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {categoria.nome}
                </h2>
                <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full font-semibold">
                  {categoria.produtos.length}
                </span>
              </div>

              {/* Grid de Cards de Produto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
            </section>
          ))
        )}
      </main>

      {/* BOTÃO FLUTUANTE DE WHATSAPP */}
      <WhatsappButton
        telefone={pizzaria.telefone}
        mensagem={`Olá! Tenho uma dúvida sobre o cardápio da ${pizzaria.nome}.`}
      />
    </div>
  );
}