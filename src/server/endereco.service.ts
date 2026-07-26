import { Endereco } from "@/types/endereco";
import { api } from "./api";

export const enderecoService = {
  buscarMeu(): Promise<Endereco> {
    return api.get<Endereco>("/enderecos/me");
  },

  salvar(dados: Endereco): Promise<Endereco> {
    return api.put<Endereco>("/enderecos/me", dados);
  },
};