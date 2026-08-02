import { Tamanho, TamanhoInput } from "@/types/tamanho";
import { api } from "./api";

export const tamanhoService = {
  listar(): Promise<Tamanho[]> {
    return api.get<Tamanho[]>("/tamanhos");
  },
  criar(dados: TamanhoInput): Promise<Tamanho> {
    return api.post<Tamanho>("/tamanhos", dados);
  },
  atualizarNome(id: string, nome: string): Promise<Tamanho> {
    return api.patch<Tamanho>(`/tamanhos/${id}/nome`, { nome });
  },
  reordenar(id: string, ordemNova: number): Promise<Tamanho> {
    return api.patch<Tamanho>(`/tamanhos/${id}`, { ordemNova });
  },
  excluir(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/tamanhos/${id}`);
  },
};