import { ProdutoPreco } from "./produtoPreco";

export type TipoProduto = 'simples' | 'pizza';

export interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    tipo: TipoProduto;
    categoria_id: string;
    imagem_url: string | null;
    disponivel: boolean;
    preco?: string;
    precos?: ProdutoPreco[];
}

export interface ProdutoInput {
    nome: string;
    descricao?: string;
    tipo: TipoProduto;
    categoria_id: string;
    preco?: number;
    imagem_url?: string;
}

export interface ProdutoUpdateInput {
    nome?: string;
    descricao?: string;
    preco?: number;
    imagem_url?: string;
    disponivel?: boolean;
}