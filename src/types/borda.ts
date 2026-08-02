export interface Borda {
  id: string;
  nome: string;
  preco: number;
  pizzaria_id: string;
  ativo: boolean;
}

export interface BordaInput {
  nome: string;
  preco: number;
}