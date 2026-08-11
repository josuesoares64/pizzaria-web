import { Endereco } from './endereco';

export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao';

export type TipoPedido = 'entrega' | 'retirada' | 'mesa';

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
  troco_para?: number;
  observacoes?: string;
  tipo_pedido: TipoPedido;
  endereco?: Endereco;
  numero_mesa?: string;
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
  cliente?: ClienteResumo;
  forma_pagamento: FormaPagamento;
  troco_para?: string;
  status: StatusPedido;
  observacoes?: string;
  tipo_pedido: TipoPedido;
  numero_mesa?: string;
  endereco_cep?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_complemento?: string;
  endereco_referencia?: string;
  total: string;
  itens: OrderItem[];
  createdAt: string;
  impresso_em?: string | null;
}