"use client";

import { useCart } from "@/context/CartContext";
import { getBebidas } from "@/server/data/dataProducts";
import { useEffect, useState } from "react";
import CardBebida from "../components/card/CardBebida";

export default function Bebidas() {
    const { addToCart } = useCart();

    const [bebidas, setBebidas] = useState<BebidaItem[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const data = await getBebidas();
                setBebidas(data);
            } catch (err) {
                console.error(err);
            }
        }

        load();
    },[]);

    const handleAddToCart = (bebida: BebidaItem) => {
        addToCart({
            flavors: [bebida],
            size: "Único",
            price: bebida.price,
            qtd: 1,
        });
    };

    return (
        <section className="p-6 mt-20">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Escolha sua bebida</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bebidas.map((bebida) => (
                    <CardBebida
                    key={bebida.id}
                    bebida={bebida}
                    onAdd={() => handleAddToCart(bebida)}
                    />
                ))}
            </div>
        </section>
    )
}