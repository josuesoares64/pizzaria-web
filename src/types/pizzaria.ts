import { Categoria } from "./categoria";
import { Borda } from "./borda";
import { Produto } from "./produto";

export interface CategoriaComProdutos extends Categoria {
    produtos: Produto[];
}

export interface PizzariaResumo {
    id: string;
    nome: string;
    slug: string;
    telefone: string;
    endereco: string;
    logo_url: string;
    taxa_entrega: number | null;
}

export interface PizzariaDetalhe extends PizzariaResumo {
    categorias: CategoriaComProdutos[];
    bordas: Borda[];
}

export interface PizzariaMe extends PizzariaResumo {
    plano: string;
    bloqueado: boolean;
    largura_cupom: '58mm' | '80mm';
}