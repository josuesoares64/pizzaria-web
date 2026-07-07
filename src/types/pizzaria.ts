import { Categoria } from "./categoria";

export interface PizzariaResumo {
    id: string;
    slug: string;
    telefone: string;
    endereco: string;
    logo_url: string;
}

export interface PizzariaDetalhe extends PizzariaResumo {
    categoria: Categoria[];
}