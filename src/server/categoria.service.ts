import { Categoria, CategoriaInput } from "@/types/categoria";
import { api } from "./api";

export const categoriaService = {
  listar(): Promise<Categoria[]> {
    return api.get<Categoria[]>("/categorias");
  },
  criar(dados: CategoriaInput): Promise<Categoria> {
    return api.post<Categoria>("/categorias", dados);
  },
  atualizar(id: string, dados: CategoriaInput): Promise<Categoria> {
    return api.patch<Categoria>(`/categorias/${id}`, dados);
  },
  atualizarStatus(id: string, ativo: boolean): Promise<Categoria> {
    return api.patch<Categoria>(`/categorias/${id}/status`, { ativo });
  },
};