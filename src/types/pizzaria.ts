import { Categoria } from "./categoria";
import { Borda } from "./borda";

export interface PizzariaResumo {
    id: string;
    nome: string;
    slug: string;
    telefone: string;
    endereco: string;
    logo_url: string;
}

export interface PizzariaDetalhe {
    nome: string;
    slug: string;
    telefone: string;
    endereco: string;
    logo_url: string;
    categorias: Categoria[];
    bordas: Borda[];
}