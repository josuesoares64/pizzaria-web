import { BebidaItem } from "@/server/data/dataProducts";
import Image from "next/image";
import { FaCartPlus } from "react-icons/fa";

type CardBebidaProps = {
  bebida: BebidaItem;
  onAdd: () => void;
};

export default function CardBebida({ bebida, onAdd }: CardBebidaProps) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full  hover:bg-gray-50group">
      <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-xl bg-white p-6 group">
        <Image
          src={bebida.imagem}
          alt={bebida.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
          priority={false}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">{bebida.name}</h3>

        <p className="text-gray-600">{bebida.description}</p>

        <p className="text-lg font-bold mt-2">R$ {bebida.price.toFixed(2)}</p>

        <button
          onClick={onAdd}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <FaCartPlus /> Adicionar
        </button>
      </div>
    </div>
  );
}
