'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pizzariaService } from '@/server/pizzaria.service';
import { PizzariaResumo } from '@/types/pizzaria';

export default function HomePage() {
  const [pizzarias, setPizzarias] = useState<PizzariaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarPizzarias() {
      try {
        const data = await pizzariaService.listar();
        setPizzarias(data);
      } catch {
        setErro('Não foi possível carregar as pizzarias.');
      } finally {
        setCarregando(false);
      }
    }

    carregarPizzarias();
  }, []);

  if (carregando) {
    return <p className="text-center mt-20">Carregando pizzarias...</p>;
  }

  if (erro) {
    return <p className="text-center mt-20 text-red-600">{erro}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Escolha sua pizzaria</h1>

      {pizzarias.length === 0 ? (
        <p className="text-gray-500">Nenhuma pizzaria disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pizzarias.map((pizzaria) => (
            <Link
              key={pizzaria.id}
              href={`/${pizzaria.slug}`}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {pizzaria.logo_url ? (
                <img
                  src={pizzaria.logo_url}
                  alt={pizzaria.slug}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                  Sem logo
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold">{pizzaria.slug.replace(/-/g, ' ')}</p>
                <p className="text-sm text-gray-500">{pizzaria.endereco}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}