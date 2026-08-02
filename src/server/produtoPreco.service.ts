import { ProdutoPreco } from "@/types/produtoPreco";
import { api } from "./api";

export const produtoPrecoService = {
  listar(produtoId: string): Promise<ProdutoPreco[]> {
    return api.get<ProdutoPreco[]>(`/produtos/${produtoId}/precos`);
  },
  vincularTamanhos(produtoId: string, tamanhoIds: string[]): Promise<ProdutoPreco[]> {
    return api.post<ProdutoPreco[]>(`/produtos/${produtoId}/tamanhos`, { tamanho_ids: tamanhoIds });
  },
  desvincularTamanho(produtoId: string, tamanhoId: string): Promise<void> {
    return api.delete<void>(`/produtos/${produtoId}/tamanhos/${tamanhoId}`);
  },
  atualizarPrecos(
    produtoId: string,
    precos: { tamanho_id: string; preco: number }[]
  ): Promise<ProdutoPreco[]> {
    return api.put<ProdutoPreco[]>(`/produtos/${produtoId}/precos`, { precos });
  },
};