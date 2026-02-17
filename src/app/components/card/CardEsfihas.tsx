import type { EsfihaItem } from "@/server/data/dataProducts";
import Image from "next/image";
import { FaCartPlus } from "react-icons/fa";

type CardEsfihaProps = {
  esfiha: EsfihaItem;
  onAdd: () => void;
};

export default function CardEsfiha({ esfiha, onAdd }: CardEsfihaProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={esfiha.image}
        alt={esfiha.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold">{esfiha.name}</h3>

        <p className="text-gray-600">{esfiha.description}</p>

        <p className="text-lg font-bold mt-2">
          R$ {esfiha.price.toFixed(2)}
        </p>

        <button
          onClick={onAdd}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <FaCartPlus/>
        </button>
      </div>
    </div>
  );
}
