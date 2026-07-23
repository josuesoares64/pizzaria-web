import { ProdutoPreco } from "./produtoPreco";

export interface Produto {
    id: string;
    nome: string;
    descricao: string | null;
    imagem_url: string | null;
    preco?: string;
    precos?: ProdutoPreco[];
}