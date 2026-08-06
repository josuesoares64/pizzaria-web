import { CriarPedidoInput, Order, StatusPedido } from "@/types/order";
import { api } from "./api";

export const orderService = {
  criarPedido(dados: CriarPedidoInput): Promise<Order> {
    return api.post<Order>("/orders", dados);
  },

  listarMeusPedidos(): Promise<Order[]> {
    return api.get<Order[]>("/orders/me");
  },

  listarPedidosPizzaria(): Promise<Order[]> {
    return api.get<Order[]>("/orders");
  },

  atualizarStatus(orderId: string, status: StatusPedido): Promise<Order> {
    return api.patch<Order>(`/orders/${orderId}/status`, { status });
  },

  marcarComoImpresso(orderId: string): Promise<Order> {
    return api.patch<Order>(`/orders/${orderId}/imprimir`, {});
  },
};