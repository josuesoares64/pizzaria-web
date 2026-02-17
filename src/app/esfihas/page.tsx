"use client";

import { useEffect, useState } from "react";
import CardEsfiha from "@/app/components/card/CardEsfihas";
import { useCart } from "@/context/CartContext";
import { getEsfihas, type EsfihaItem } from "@/server/data/dataProducts";

export default function Esfihas() {
  const { addToCart } = useCart();

  const [esfihas, setEsfihas] = useState<EsfihaItem[]>([]);

  // 🔥 Buscar esfihas da API
  useEffect(() => {
    async function load() {
      try {
        const data = await getEsfihas();
        setEsfihas(data); // assume que retorna array
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  // 🛒 adicionar ao carrinho
  const handleAddToCart = (esfiha: EsfihaItem) => {
    addToCart({
      flavors: [esfiha],
      size: "Único",
      price: esfiha.price,
      qtd: 1,
    });
  };

  return (
    <section className="p-6 mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Escolha suas esfihas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {esfihas.map((esfiha) => (
          <CardEsfiha
            key={esfiha.id}
            esfiha={esfiha}
            onAdd={() => handleAddToCart(esfiha)}
          />
        ))}
      </div>
    </section>
  );
}
