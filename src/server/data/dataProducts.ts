export type PizzaAPI = {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  preco_pequena: string;
  preco_media: string;
  preco_grande: string;
  preco_familia: string;
};

export type PizzaItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  prices: { size: string; price: number }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getPizzas() {
  try {
    console.log("📡 Buscando pizzas em:", `${API_URL}/pizzas`);

    const res = await fetch(`${API_URL}/pizzas`, {
      cache: "no-store",
    });

    console.log("📊 Status da resposta:", res.status);

    if (!res.ok) {
      throw new Error("Erro ao buscar pizzas");
    }

    const data: PizzaAPI[] = await res.json();
    console.log("📦 Dados recebidos da API:", data);

    const pizzas: PizzaItem[] = data.map((pizza) => ({
      id: pizza.id,
      name: pizza.nome,
      description: pizza.descricao,
      image: `${API_URL}/${pizza.imagem}`,
      prices: [
        { size: "Pequena", price: Number(pizza.preco_pequena) },
        { size: "Média", price: Number(pizza.preco_media) },
        { size: "Grande", price: Number(pizza.preco_grande) },
        { size: "Família", price: Number(pizza.preco_familia) },
      ],
    }));

    console.log("🧩 Dados transformados:", pizzas);

    return {
      pizzasSalgadas: pizzas,
      pizzasDoces: [],
    };
  } catch (error) {
    console.error("❌ Erro no getPizzas:", error);
    return {
      pizzasSalgadas: [],
      pizzasDoces: [],
    };
  }
}
