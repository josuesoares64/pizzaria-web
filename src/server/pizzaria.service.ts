import { PizzariaDetalhe, PizzariaMe, PizzariaResumo } from "@/types/pizzaria";
import { api } from "./api"

export const pizzariaService = {
    listar(): Promise<PizzariaResumo[]> {
        return api.get<PizzariaResumo[]>("/pizzarias");
    },

    buscarPorSlug(slug: string): Promise<PizzariaDetalhe> {
        return api.get<PizzariaDetalhe>(`/pizzarias/${slug}`);
    },

    getMe(): Promise<PizzariaMe> {
        return api.get<PizzariaMe>("/pizzarias/me");
    },

    atualizar(dados: Partial<Pick<PizzariaMe, "nome" | "slug" | "telefone" | "endereco">>): Promise<PizzariaMe> {
        return api.patch<PizzariaMe>("/pizzarias/me", dados);
    },

    uploadLogo(file: File) {
        const formData = new FormData();
        formData.append("logo", file);
        return api.patchForm<PizzariaMe>("/pizzarias/me/logo", formData);
    },
}