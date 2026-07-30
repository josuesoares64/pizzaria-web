export interface Categoria {
    id: string;
    nome: string;
    ativo: boolean;
}

export interface CategoriaInput {
    nome: string;
    ativo?: boolean;
}