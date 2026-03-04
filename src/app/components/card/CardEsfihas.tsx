import type { EsfihaItem } from "@/server/data/dataProducts";
import Image from "next/image";
import { FaCartPlus } from "react-icons/fa";

type CardEsfihaProps = {
  esfiha: EsfihaItem;
  onAdd: () => void;
};

export default function CardEsfiha({ esfiha, onAdd }: CardEsfihaProps) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:bg-gray-50 group">
      {/* Wrapper da imagem */}
      <div className="relative w-full h-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 group">
        <Image
          src={esfiha.image}
          alt={esfiha.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      <div className="p-4 pb-0 flex flex-col flex-1">
        <h3 className="text-lg font-semibold">{esfiha.name}</h3>

        <p className="text-gray-600">{esfiha.description}</p>

        <p className="text-lg font-bold mt-2">R$ {esfiha.price.toFixed(2)}</p>

        <button
          onClick={onAdd}
          className="mt-auto w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <FaCartPlus /> Adicionar
        </button>
      </div>
    </div>
  );
}
