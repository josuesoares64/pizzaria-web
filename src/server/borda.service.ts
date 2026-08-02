import { Borda, BordaInput } from "@/types/borda";
import { api } from "./api";

export const bordaService = {
  listar(): Promise<Borda[]> {
    return api.get<Borda[]>("/bordas");
  },
  criar(dados: BordaInput): Promise<Borda> {
    return api.post<Borda>("/bordas", dados);
  },
  atualizar(id: string, dados: BordaInput): Promise<Borda> {
    return api.patch<Borda>(`/bordas/${id}`, dados);
  },
  atualizarStatus(id: string, ativo: boolean): Promise<Borda> {
    return api.patch<Borda>(`/bordas/${id}/status`, { ativo });
  },
  excluir(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/bordas/${id}`);
  },
};