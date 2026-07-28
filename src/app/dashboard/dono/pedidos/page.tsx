"use client";

import { useEffect, useState, useCallback } from "react";
import { orderService } from "@/server/order.service";
import { Order, StatusPedido } from "@/types/order";

const COLUNAS_ATIVAS: { status: StatusPedido; label: string; cor: string }[] = [
  { status: "pendente", label: "Pendente", cor: "border-amber-400" },
  { status: "confirmado", label: "Confirmado", cor: "border-blue-400" },
  { status: "preparando", label: "Preparando", cor: "border-orange-400" },
  { status: "saiu_para_entrega", label: "Saiu para entrega", cor: "border-purple-400" },
];

const STATUS_OPCOES: { value: StatusPedido; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "preparando", label: "Preparando" },
  { value: "saiu_para_entrega", label: "Saiu para entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
};

const POLLING_MS = 20000;

export default function PedidosDonoPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"ativos" | "historico">("ativos");

  const buscarPedidos = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const dados = await orderService.listarPedidosPizzaria();
      setPedidos(dados);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os pedidos.");
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarPedidos();
    const intervalo = setInterval(() => buscarPedidos(true), POLLING_MS);
    return () => clearInterval(intervalo);
  }, [buscarPedidos]);

  async function handleMudarStatus(orderId: string, novoStatus: StatusPedido) {
    const anterior = pedidos;
    setPedidos((prev) =>
      prev.map((p) => (p.id === orderId ? { ...p, status: novoStatus } : p))
    );
    try {
      await orderService.atualizarStatus(orderId, novoStatus);
    } catch {
      setPedidos(anterior);
      setErro("Não foi possível atualizar o status desse pedido.");
    }
  }

  if (carregando) {
    return <p className="text-neutral-500 text-sm">Carregando pedidos...</p>;
  }

  const pedidosHistorico = pedidos.filter((p) =>
    ["entregue", "cancelado"].includes(p.status)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-neutral-800">Pedidos</h1>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setAba("ativos")}
            className={`px-3 py-1.5 text-sm rounded-md font-medium ${
              aba === "ativos" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setAba("historico")}
            className={`px-3 py-1.5 text-sm rounded-md font-medium ${
              aba === "historico" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-500"
            }`}
          >
            Histórico
          </button>
        </div>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}

      {aba === "ativos" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUNAS_ATIVAS.map((coluna) => {
            const itensColuna = pedidos.filter((p) => p.status === coluna.status);
            return (
              <div key={coluna.status}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-neutral-700">{coluna.label}</h2>
                  <span className="text-xs text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                    {itensColuna.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {itensColuna.length === 0 && (
                    <p className="text-xs text-neutral-400">Nenhum pedido aqui.</p>
                  )}
                  {itensColuna.map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      corBorda={coluna.cor}
                      onMudarStatus={handleMudarStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {pedidosHistorico.length === 0 && (
            <p className="text-sm text-neutral-400">Sem pedidos no histórico ainda.</p>
          )}
          {pedidosHistorico.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              corBorda={pedido.status === "entregue" ? "border-green-400" : "border-red-400"}
              onMudarStatus={handleMudarStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PedidoCard({
  pedido,
  corBorda,
  onMudarStatus,
}: {
  pedido: Order;
  corBorda: string;
  onMudarStatus: (id: string, status: StatusPedido) => void;
}) {
  const horario = new Date(pedido.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`bg-white rounded-lg border-l-4 ${corBorda} border border-neutral-200 shadow-sm p-3`}>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            {pedido.cliente?.nome ?? "Cliente"}
          </p>
          <p className="text-xs text-neutral-400">{pedido.cliente?.telefone}</p>
        </div>
        <span className="text-xs text-neutral-400">{horario}</span>
      </div>

      <ul className="text-xs text-neutral-600 mb-2 space-y-0.5">
        {pedido.itens.map((item) => (
          <li key={item.id}>
            {item.quantidade}x {item.produto.nome}
            {item.produtoSegundoSabor ? ` / ${item.produtoSegundoSabor.nome}` : ""}
            {item.tamanho ? ` (${item.tamanho.nome})` : ""}
          </li>
        ))}
      </ul>

      <p className="text-xs text-neutral-500 mb-2">
        {pedido.endereco_rua}, {pedido.endereco_numero} — {pedido.endereco_bairro}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-neutral-800">
            R$ {Number(pedido.total).toFixed(2).replace(".", ",")}
          </span>
          <span className="text-xs text-neutral-400 ml-2">
            {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento]}
          </span>
        </div>
        <select
          value={pedido.status}
          onChange={(e) => onMudarStatus(pedido.id, e.target.value as StatusPedido)}
          className="text-xs border border-neutral-200 rounded-md px-2 py-1 bg-white"
        >
          {STATUS_OPCOES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}