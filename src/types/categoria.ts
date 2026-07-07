import { Produto } from "./produto";

export interface Categoria {
    id: string;
    nome: string;
    produtos: Produto[];
}