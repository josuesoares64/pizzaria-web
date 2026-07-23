export interface CartItem {
  id: string;
  produtoId: string;
  produtoId2?: string;
  nomeExibicao: string;
  tamanhoId?: string;
  tamanhoNome?: string;
  bordaId?: string;
  bordaNome?: string;
  precoUnitario: number;
  quantidade: number;
}