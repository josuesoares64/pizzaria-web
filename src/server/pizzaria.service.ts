import { PizzariaDetalhe, PizzariaResumo } from "@/types/pizzaria";
import { api } from "./api"

export const pizzariaService = {
    listar(): Promise<PizzariaResumo[]> {
        return api.get<PizzariaResumo[]>("/pizzarias");
    },

    buscarPorSlug(slug: string): Promise<PizzariaDetalhe> {
        return api.get<PizzariaDetalhe>(`/pizzarias/${slug}`);
    },
}