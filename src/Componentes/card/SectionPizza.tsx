'use client';

import CardPizza from '@/Componentes/card/CardPizza';
import { useCart } from '@/context/CartContext';
import { pizzasDoces, pizzasSalgadas, type PizzaItem } from '@/data/menu';
import { useEffect, useMemo, useRef, useState } from 'react';

type SelectionMap = Record<number, number>;

export default function SectionPizza() {
  const [selection, setSelection] = useState<SelectionMap>({});
  const [size, setSize] = useState<string>('');
  const addToCartRef = useRef<HTMLDivElement | null>(null);

  const { addToCart } = useCart();

  const allPizzas = useMemo(() => [...pizzasSalgadas, ...pizzasDoces], []);
  const totalSelected = useMemo(
    () => Object.values(selection).reduce((sum, n) => sum + n, 0),
    [selection]
  );

  const locked = totalSelected >= 2;

  const handleIncrease = (pizza: PizzaItem) => {
    setSelection(prev => {
      const currentTotal = Object.values(prev).reduce((s, n) => s + n, 0);
      if (currentTotal >= 2) return prev;
      const current = prev[pizza.id] || 0;
      if (current >= 2) return prev;
      return { ...prev, [pizza.id]: current + 1 };
    });
  };

  const handleDecrease = (pizza: PizzaItem) => {
    setSelection(prev => {
      const current = prev[pizza.id] || 0;
      if (current <= 0) return prev;
      const next = { ...prev, [pizza.id]: current - 1 };
      if (next[pizza.id] === 0) delete next[pizza.id];
      return next;
    });
  };

  const handleAddToCart = () => {
    const flavors: PizzaItem[] = [];
    for (const [idStr, count] of Object.entries(selection)) {
      const id = Number(idStr);
      const item = allPizzas.find(p => p.id === id);
      if (item) {
        for (let i = 0; i < count; i++) flavors.push(item);
      }
    }

    if (flavors.length !== 2 || !size) {
      alert('⚠️ Escolha 2 sabores e um tamanho!');
      return;
    }

    // Encontrar o preço baseado no tamanho selecionado
    const basePizza = flavors[0];
    const selectedSizePrice = basePizza.prices.find(p => p.size === size);

    if (!selectedSizePrice) {
      alert('⚠️ Tamanho não disponível para esta pizza!');
      return;
    }

    addToCart({
      flavors,
      size,
      price: selectedSizePrice.price,
      qtd: 1,
    });

    setSelection({});
    setSize('');
  };

  useEffect(() => {
    if (locked && addToCartRef.current) {
      addToCartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [locked]);

  return (
    <section className="p-6 mt-20">
      {/* TÍTULO E INSTRUÇÕES */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Monte Sua Pizza</h2>
        <p className="text-lg text-gray-600">
          Escolha até 2 sabores para sua pizza
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Selecionados: {totalSelected}/2
        </p>
      </div>

      {/* GRID DE PIZZAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPizzas.map(pizza => (
          <CardPizza
            key={pizza.id}
            pizza={pizza}
            count={selection[pizza.id] || 0}
            locked={locked}
            onIncrease={() => handleIncrease(pizza)}
            onDecrease={() => handleDecrease(pizza)}
          />
        ))}
      </div>

      {/* SELEÇÃO DE TAMANHO E BOTÃO ADICIONAR */}
      {locked && (
        <div ref={addToCartRef} className="mt-6 text-center">
          <select
            value={size}
            onChange={e => setSize(e.target.value)}
            className="border p-2 rounded mb-3"
          >
            <option value="">Selecione o tamanho</option>
            <option value="Pequena">Pequena</option>
            <option value="Média">Média</option>
            <option value="Grande">Grande</option>
            <option value="Família">Família</option>
          </select>

          <br />

          <button
            onClick={handleAddToCart}
            className="bg-black text-black px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={!size}
          >
            Adicionar Pizza ao Carrinho
          </button>
        </div>
      )}
    </section>
  );
}
