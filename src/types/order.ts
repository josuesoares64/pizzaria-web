import { Endereco } from './endereco';

export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao';

export type StatusPedido =
  | 'pendente'
  | 'confirmado'
  | 'preparando'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado';

export interface OrderItemInput {
  produto_id: string;
  produto_id_2?: string;
  tamanho_id?: string;
  borda_id?: string;
  quantidade: number;
  observacoes?: string;
}

export interface CriarPedidoInput {
  pizzaria_id: string;
  forma_pagamento: FormaPagamento;
  observacoes?: string;
  endereco: Endereco;
  itens: OrderItemInput[];
}

interface RefNomeada {
  id: string;
  nome: string;
}

interface ClienteResumo {
  id: string;
  nome: string;
  telefone: string;
}

export interface OrderItem {
  id: string;
  produto: RefNomeada;
  produtoSegundoSabor: RefNomeada | null;
  tamanho: RefNomeada | null;
  borda: RefNomeada | null;
  quantidade: number;
  observacoes?: string;
  preco_unitario: string;
  subtotal: string;
}

export interface Order {
  id: string;
  pizzaria_id: string;
  pizzaria: RefNomeada;
  cliente?: ClienteResumo; // só vem preenchido em GET /orders (dono/funcionario), não em GET /orders/me
  forma_pagamento: FormaPagamento;
  status: StatusPedido;
  observacoes?: string;
  endereco_cep: string;
  endereco_rua: string;
  endereco_numero: string;
  endereco_bairro: string;
  endereco_complemento?: string;
  endereco_referencia?: string;
  total: string;
  itens: OrderItem[];
  createdAt: string;
}