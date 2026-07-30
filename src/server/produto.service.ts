import { Produto, ProdutoInput, ProdutoUpdateInput } from "@/types/produto";
import { api } from "./api";

export const produtoService = {
  listar(): Promise<Produto[]> {
    return api.get<Produto[]>("/produtos");
  },
  criar(dados: ProdutoInput): Promise<Produto> {
    return api.post<Produto>("/produtos", dados);
  },
  atualizar(id: string, dados: ProdutoUpdateInput): Promise<Produto> {
    return api.patch<Produto>(`/produtos/${id}`, dados);
  },
  atualizarStatus(id: string, disponivel: boolean): Promise<Produto> {
    return api.patch<Produto>(`/produtos/${id}/status`, { disponivel });
  },
  excluir(id: string): Promise<{ id: string }> {
    return api.delete<{ id: string }>(`/produtos/${id}`);
  },
};