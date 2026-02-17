import type { PizzaItem } from "@/server/data/dataProducts";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";

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
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full  hover:bg-gray-50group
"
    >
      {/* Imagem */}
      <div className="flex justify-center mb-4">
        <Image
          src={pizza.image}
          alt={pizza.name}
          width={120}
          height={120}
          className="rounded-lg transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Informações */}
      <div className="flex-1 mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {pizza.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {pizza.description}
        </p>

        {/* Preços - Layout compacto em linha */}
        <div className="flex flex-wrap gap-3 justify-normal">
          {pizza.prices.map((p) => (
            <div
              key={p.size}
              className="flex items-center gap-1 bg-green-50 px-3 py-2 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700">
                {p.size}
              </span>
              <span className="text-sm font-bold text-green-600">-</span>
              <span className="text-base font-bold text-green-700">
                R$ {p.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botões de quantidade */}
      <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 mt-auto">
        <button
          onClick={onDecrease}
          disabled={count === 0}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50active:scale-95
      "
        >
          <FaMinus className="text-gray-700 text-xs" />
        </button>

        <span className="text-lg font-bold text-gray-800 min-w-8 text-center">
          {count}
        </span>

        <button
          onClick={onIncrease}
          disabled={locked}
          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm  hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-600active:scale-95
      "
        >
          <FaPlus className="text-white text-xs" />
        </button>
      </div>
    </div>
  );
}
