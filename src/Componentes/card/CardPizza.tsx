'use client';

import { PizzaItem } from '@/data/menu';

type CardPizzaProps = {
  pizza: PizzaItem;
  count: number;
  locked: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
};

export default function CardPizza({
  pizza,
  count,
  locked,
  onIncrease,
  onDecrease,
}: CardPizzaProps) {
  // Encontrar o preço mínimo
  const minPrice = Math.min(...pizza.prices.map(p => p.price));

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{pizza.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{pizza.description}</p>
      <p className="font-bold text-red-500 mb-3">R$ {minPrice.toFixed(2)}</p>

      {/* BOTÕES DE ADICIONAR/REMOVER */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrease}
          disabled={count === 0}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          -
        </button>
        <span className="text-lg font-semibold">{count}</span>
        <button
          onClick={onIncrease}
          disabled={locked}
          className="px-3 py-1 bg-green-500 text-black rounded disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
