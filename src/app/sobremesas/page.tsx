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
        <section>
            <div>
                <h2>Escolha sua sobremesa</h2>
            </div>

            <div>
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