import { SobremesaItem } from "@/server/data/dataProducts"
import Image from "next/image";
import { FaCartPlus } from "react-icons/fa";

type CardSobremesaProps = {
    sobremesa: SobremesaItem;
    onAdd: () => void;
};

export default function CardSobremesa({ sobremesa, onAdd }: CardSobremesaProps) {
    return (
        <div>
            <Image
            src={sobremesa.imagem}
            alt={sobremesa.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
            />

            <div>
                <h3 className="text-lg font-semibold">{sobremesa.name}</h3>

                <p className="text-gray-600">{sobremesa.description}</p>

                <p className="text-lg font-bold mt-2">R$ {sobremesa.price.toFixed(2)}</p>

                <button>
                    <FaCartPlus onClick={onAdd} className="mt-3 w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"/>
                </button>
            </div>
        </div>
    )
}