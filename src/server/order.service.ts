import { CriarPedidoInput, Order } from "@/types/order";
import { api } from "./api";

export const orderService = {
  criarPedido(dados: CriarPedidoInput): Promise<Order> {
    return api.post<Order>("/orders", dados);
  },

  listarMeusPedidos(): Promise<Order[]> {
    return api.get<Order[]>("/orders/me");
  },
};