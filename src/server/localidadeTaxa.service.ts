import { api } from "./api";

export interface LocalidadeTaxa {
  id: string;
  pizzaria_id: string;
  bairro: string;
  taxa: number;
  ativo: boolean;
}

export const localidadeTaxaService = {
  listar(): Promise<LocalidadeTaxa[]> {
    return api.get<LocalidadeTaxa[]>("/localidades-taxa");
  },
  criar(dados: { bairro: string; taxa: number }): Promise<LocalidadeTaxa> {
    return api.post<LocalidadeTaxa>("/localidades-taxa", dados);
  },
  atualizar(
    id: string,
    dados: { bairro?: string; taxa?: number; ativo?: boolean }
  ): Promise<LocalidadeTaxa> {
    return api.patch<LocalidadeTaxa>(`/localidades-taxa/${id}`, dados);
  },
  excluir(id: string): Promise<void> {
    return api.delete<void>(`/localidades-taxa/${id}`);
  },
};