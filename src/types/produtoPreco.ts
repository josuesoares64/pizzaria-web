import { Tamanho } from "./tamanho";

export interface ProdutoPreco {
  id: string;
  preco: string | null;
  tamanho: Tamanho;
}