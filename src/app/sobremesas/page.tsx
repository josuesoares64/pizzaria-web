"use client";

import { useEffect, useState } from "react";
import CardSobremesa from "@/app/components/card/CardSobremesa";
import { useCart } from "@/context/CartContext";
import { getSobremesas, type SobremesaItem } from "@/server/data/dataProducts";

export default function Sobremesas() {
    const { addToCart } = useCart();

    const [sobremesas, setSobremesas] = useState<SobremesaItem[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const data = await getSobremesas();
                setSobremesas(data);
            } catch (err) {
                console.error(err);
            }
        }

        load();
    }, []);

    const handleAddToCart = (sobremesa: SobremesaItem) => {
        addToCart({
            flavors: [sobremesa],
            size: "Único",
            price: sobremesa.price,
            qtd: 1,
        })
    }

    return (
        <section className="p-6 mt-20">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Escolha sua sobremesa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sobremesas.map((sobremesa) => (
                    <CardSobremesa
                    key={sobremesa.id}
                    sobremesa={sobremesa}
                    onAdd={() => handleAddToCart(sobremesa)}
                    />
                ))}
            </div>
        </section>
    )
}