import { api } from "./api";

export interface LocalidadeTaxa {
  id: string;
  bairro: string;
  taxa: number;
}

export interface LocalidadesResponse {
  taxaPadrao: number | null;
  localidades: LocalidadeTaxa[];
}

export const entregaService = {
  listarLocalidades(pizzariaId: string): Promise<LocalidadesResponse> {
    return api.get<LocalidadesResponse>(`/entrega/localidades?pizzaria_id=${pizzariaId}`);
  },
};