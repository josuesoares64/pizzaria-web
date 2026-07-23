'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { pizzariaService } from '@/server/pizzaria.service';
import { PizzariaDetalhe } from '@/types/pizzaria';
import { ProdutoCard } from '@/components/ProdutoCard';

export default function PizzariaPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    return <p className="text-center mt-20">Carregando cardápio...</p>;
  }

  if (erro || !pizzaria) {
    return <p className="text-center mt-20 text-red-600">{erro || 'Erro ao carregar.'}</p>;
  }

  const todasPizzas = pizzaria.categorias.flatMap((c) => c.produtos.filter((p) => p.precos !== undefined));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-1">{pizzaria.nome}</h1>
      <p className="text-gray-500 mb-8">{pizzaria.endereco}</p>

      {pizzaria.categorias.length === 0 ? (
        <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
      ) : (
        pizzaria.categorias.map((categoria) => (
          <div key={categoria.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{categoria.nome}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoria.produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  todasPizzas={todasPizzas}
                  bordas={pizzaria.bordas}
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