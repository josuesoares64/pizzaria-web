// Interfaces
export interface PizzaSizePrice {
  size: "Pequena" | "Média" | "Grande" | "Família";
  price: number;
}

export interface PizzaItem {
  id: number;
  name: string;
  description: string;
  prices: PizzaSizePrice[]; // pizzas têm variação de tamanho
  image: string;
  category: "Salgada" | "Doce";
}

export interface BebidaItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Refrigerante" | "Alcoólica" | "Suco" | "Água";
}

export interface SobremesasItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Sobremesa";
}

export interface Menu {
  pizzasSalgadas: PizzaItem[];
  pizzasDoces: PizzaItem[];
  bebidas: {
    refrigerantes: BebidaItem[];
    alcoolicas: BebidaItem[];
    sucos: BebidaItem[];
    aguas: BebidaItem[];
  };
  sobremesas: SobremesasItem[];
}

// Dados das Pizzas Salgadas
export const pizzasSalgadas: PizzaItem[] = [
  {
    id: 1,
    name: "Margherita",
    description: "Molho de tomate, mussarela, manjericão fresco",
    prices: [
      { size: "Pequena", price: 25.0 },
      { size: "Média", price: 35.0 },
      { size: "Grande", price: 45.0 },
      { size: "Família", price: 55.0 },
    ],
    image: "/img/margherita.png",
    category: "Salgada",
  },
  {
    id: 2,
    name: "Pepperoni",
    description: "Molho de tomate, mussarela e pepperoni",
    prices: [
      { size: "Pequena", price: 28.0 },
      { size: "Média", price: 40.0 },
      { size: "Grande", price: 52.0 },
    ],
    image: "/img/pepperoni.png",
    category: "Salgada",
  },
  {
    id: 3,
    name: "Calabresa",
    description: "Molho de tomate, mussarela e linguiça calabresa",
    prices: [
      { size: "Pequena", price: 27.0 },
      { size: "Média", price: 38.0 },
      { size: "Grande", price: 50.0 },
    ],
    image: "/img/calabresa.png",
    category: "Salgada",
  },
  {
    id: 4,
    name: "Frango com Catupiry",
    description: "Molho de tomate, frango desfiado e catupiry",
    prices: [
      { size: "Pequena", price: 30.0 },
      { size: "Média", price: 42.0 },
      { size: "Grande", price: 55.0 },
    ],
    image: "/img/frango-catupiry.png",
    category: "Salgada",
  },
  {
    id: 5,
    name: "Portuguesa",
    description: "Molho de tomate, mussarela, presunto, ovo, cebola e azeitonas",
    prices: [
      { size: "Pequena", price: 32.0 },
      { size: "Média", price: 45.0 },
      { size: "Grande", price: 58.0 },
    ],
    image: "/img/portuguesa.png",
    category: "Salgada",
  },
  {
    id: 6,
    name: "Quatro Queijos",
    description: "Molho de tomate, mussarela, provolone, parmesão e gorgonzola",
    prices: [
      { size: "Pequena", price: 35.0 },
      { size: "Média", price: 48.0 },
      { size: "Grande", price: 60.0 },
    ],
    image: "/img/quatro-queijos.png",
    category: "Salgada",
  },
  {
    id: 7,
    name: "Vegetariana",
    description: "Molho de tomate, mussarela, pimentão, champignon, cebola e azeitonas",
    prices: [
      { size: "Pequena", price: 28.0 },
      { size: "Média", price: 39.0 },
      { size: "Grande", price: 50.0 },
    ],
    image: "/img/vegetariana.png",
    category: "Salgada",
  },
  {
    id: 8,
    name: "Bacon com Ovo",
    description: "Molho de tomate, mussarela, bacon e ovo",
    prices: [
      { size: "Pequena", price: 30.0 },
      { size: "Média", price: 43.0 },
      { size: "Grande", price: 55.0 },
    ],
    image: "/img/bacon-ovo.png",
    category: "Salgada",
  },
  {
    id: 9,
    name: "Napolitana",
    description: "Molho de tomate, mussarela, tomate em rodelas e parmesão",
    prices: [
      { size: "Pequena", price: 26.0 },
      { size: "Média", price: 37.0 },
      { size: "Grande", price: 48.0 },
    ],
    image: "/img/napolitana.png",
    category: "Salgada",
  },
];

// Dados das Pizzas Doces
export const pizzasDoces: PizzaItem[] = [
  {
    id: 10,
    name: "Chocolate com Morango",
    description: "Chocolate derretido e morangos frescos",
    prices: [
      { size: "Pequena", price: 35.0 },
      { size: "Média", price: 50.0 },
      { size: "Grande", price: 65.0 },
    ],
    image: "/img/chocolate-morango.png",
    category: "Doce",
  },
  {
    id: 11,
    name: "Brigadeiro",
    description: "Chocolate, granulado e leite condensado",
    prices: [
      { size: "Pequena", price: 30.0 },
      { size: "Média", price: 45.0 },
      { size: "Grande", price: 58.0 },
    ],
    image: "/img/brigadeiro.png",
    category: "Doce",
  },
  {
    id: 12,
    name: "Romeu e Julieta",
    description: "Goiabada cremosa com queijo mussarela",
    prices: [
      { size: "Pequena", price: 32.0 },
      { size: "Média", price: 48.0 },
      { size: "Grande", price: 60.0 },
    ],
    image: "/img/romeu-julieta.png",
    category: "Doce",
  },
  {
    id: 13,
    name: "Banana com Canela",
    description: "Banana caramelizada com canela e açúcar",
    prices: [
      { size: "Pequena", price: 29.0 },
      { size: "Média", price: 42.0 },
      { size: "Grande", price: 55.0 },
    ],
    image: "/img/banana-canela.png",
    category: "Doce",
  },
  {
    id: 14,
    name: "Prestígio",
    description: "Chocolate, coco ralado e leite condensado",
    prices: [
      { size: "Pequena", price: 33.0 },
      { size: "Média", price: 47.0 },
      { size: "Grande", price: 60.0 },
    ],
    image: "/img/prestigio.png",
    category: "Doce",
  },
];

// Dados das Bebidas
export const refrigerantes: BebidaItem[] = [
  {
    id: 1,
    name: "Coca-Cola Lata",
    description: "350ml",
    price: 6.0,
    image: "/img/coca.png",
    category: "Refrigerante",
  },
  {
    id: 2,
    name: "Guaraná Antarctica Lata",
    description: "350ml",
    price: 5.5,
    image: "/img/guarana.png",
    category: "Refrigerante",
  },
  {
    id: 3,
    name: "Fanta Laranja Lata",
    description: "350ml",
    price: 5.5,
    image: "/img/fanta.png",
    category: "Refrigerante",
  },
  {
    id: 4,
    name: "Coca-Cola 1L",
    description: "1000ml",
    price: 12.0,
    image: "/img/coca-1L.png",
    category: "Refrigerante",
  },
  {
    id: 5,
    name: "Guaraná Antarctica 1L",
    description: "1000ml",
    price: 10.0,
    image: "/img/guarana-1L.png",
    category: "Refrigerante",
  },
  {
    id: 6,
    name: "Fanta Laranja 1L",
    description: "1000ml",
    price: 9.5,
    image: "/img/fanta-1L.png",
    category: "Refrigerante",
  },
];

export const bebidasAlcoolicas: BebidaItem[] = [
  {
    id: 10,
    name: "Cerveja Heineken Long Neck",
    description: "330ml",
    price: 9.0,
    image: "/img/heineken.png",
    category: "Alcoólica",
  },
];

export const sucos: BebidaItem[] = [
  {
    id: 7,
    name: "Suco de Laranja Natural",
    description: "300ml",
    price: 8.0,
    image: "/img/suco-laranja.png",
    category: "Suco",
  },
];

export const aguas: BebidaItem[] = [
  {
    id: 8,
    name: "Água Mineral (sem gás)",
    description: "500ml",
    price: 4.0,
    image: "/img/agua-sem-gas.png",
    category: "Água",
  },
  {
    id: 9,
    name: "Água Mineral (com gás)",
    description: "500ml",
    price: 4.5,
    image: "/img/agua-com-gas.png",
    category: "Água",
  },
];

// Dados das Sobremesas
export const sobremesas: SobremesasItem[] = [
  {
    id: 1,
    name: "Brownie com Sorvete",
    description: "Brownie caseiro com bola de sorvete de creme",
    price: 14.9,
    image: "/img/brownie-sorvete.png",
    category: "Sobremesa",
  },
  {
    id: 2,
    name: "Pudim de Leite",
    description: "Fatia generosa com calda de caramelo",
    price: 9.5,
    image: "/img/pudim.png",
    category: "Sobremesa",
  },
  {
    id: 3,
    name: "Mousse de Chocolate",
    description: "Porção individual, decorada com raspas de chocolate",
    price: 8.0,
    image: "/img/mousse.png",
    category: "Sobremesa",
  },
  {
    id: 4,
    name: "Sorvete de Massa",
    description: "2 bolas (sabores: creme, chocolate, morango ou flocos)",
    price: 12.0,
    image: "/img/sorvete.png",
    category: "Sobremesa",
  },
  {
    id: 5,
    name: "Torta de Limão",
    description: "Fatia com base de biscoito e creme de limão",
    price: 10.5,
    image: "/img/torta-limao.png",
    category: "Sobremesa",
  },
  {
    id: 6,
    name: "Petit Gateau",
    description: "Bolo de chocolate com recheio derretido e sorvete",
    price: 16.9,
    image: "/img/petit-gateau.png",
    category: "Sobremesa",
  },
  {
    id: 7,
    name: "Banana Split",
    description: "Banana com sorvete, calda de chocolate e chantilly",
    price: 15.0,
    image: "/img/banana-split.png",
    category: "Sobremesa",
  },
];

// Menu Completo
export const menu: Menu = {
  pizzasSalgadas,
  pizzasDoces,
  bebidas: {
    refrigerantes,
    alcoolicas: bebidasAlcoolicas,
    sucos,
    aguas,
  },
  sobremesas,
};
