"use client";

import { useEffect, useState, useCallback } from "react";
import { orderService } from "@/server/order.service";
import { pizzariaService } from "@/server/pizzaria.service";
import { Order, StatusPedido } from "@/types/order";
import ReciboModal from "./ReciboModal";
import ImpressaoAutomatica from "./ImpressaoAutomatica";

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
const CHAVE_IMPRESSAO_AUTOMATICA = "bella_pizza_impressao_automatica";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Toast {
  id: string;
  mensagem: string;
}

export default function PedidosKanban() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"ativos" | "historico">("ativos");
  const [larguraCupom, setLarguraCupom] = useState<"58mm" | "80mm">("80mm");
  const [nomePizzaria, setNomePizzaria] = useState("");
  const [pedidoParaImprimir, setPedidoParaImprimir] = useState<Order | null>(null);
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  useEffect(() => {
    pizzariaService.getMe().then((pizzaria) => {
      setLarguraCupom(pizzaria.largura_cupom);
      setNomePizzaria(pizzaria.nome);
    });
  }, []);

  // Lê a preferência salva neste computador ao carregar a tela
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_IMPRESSAO_AUTOMATICA);
    setImpressaoAutomatica(salvo === "true");
  }, []);

  function handleToggleImpressaoAutomatica() {
    const novoValor = !impressaoAutomatica;
    setImpressaoAutomatica(novoValor);
    localStorage.setItem(CHAVE_IMPRESSAO_AUTOMATICA, String(novoValor));
  }

  function mostrarToast(mensagem: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, mensagem }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handlePedidoImpressoAutomaticamente(pedido: Order) {
    // Atualização otimista: marca localmente como impresso, pra fila não pegar de novo antes do próximo polling
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, impresso_em: new Date().toISOString() } : p))
    );
    mostrarToast(`🖨️ Pedido #${pedido.id.slice(0, 8).toUpperCase()} impresso`);
  }

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
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-600 cursor-pointer select-none">
            Impressão automática
            <button
              type="button"
              onClick={handleToggleImpressaoAutomatica}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                impressaoAutomatica ? "bg-green-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  impressaoAutomatica ? "translate-x-4" : ""
                }`}
              />
            </button>
          </label>
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
                      onImprimir={setPedidoParaImprimir}
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
              onImprimir={setPedidoParaImprimir}
            />
          ))}
        </div>
      )}

      {pedidoParaImprimir && (
        <ReciboModal
          pedido={pedidoParaImprimir}
          larguraCupom={larguraCupom}
          nomePizzaria={nomePizzaria}
          onClose={() => setPedidoParaImprimir(null)}
        />
      )}

      <ImpressaoAutomatica
        pedidos={pedidos}
        ativo={impressaoAutomatica}
        larguraCupom={larguraCupom}
        nomePizzaria={nomePizzaria}
        onImprimir={handlePedidoImpressoAutomaticamente}
      />

      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[60] no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-neutral-800 text-white text-sm rounded-md px-4 py-2 shadow-lg"
          >
            {toast.mensagem}
          </div>
        ))}
      </div>
    </div>
  );
}

function PedidoCard({
  pedido,
  corBorda,
  onMudarStatus,
  onImprimir,
}: {
  pedido: Order;
  corBorda: string;
  onMudarStatus: (id: string, status: StatusPedido) => void;
  onImprimir: (pedido: Order) => void;
}) {
  const horario = new Date(pedido.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalNumero = Number(pedido.total);
  const trocoParaNumero = pedido.troco_para ? Number(pedido.troco_para) : null;

  const enderecoCompleto = [
    `${pedido.endereco_rua}, ${pedido.endereco_numero}`,
    pedido.endereco_bairro,
    pedido.endereco_complemento,
    pedido.endereco_referencia ? `Ref: ${pedido.endereco_referencia}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className={`bg-white rounded-lg border-l-4 ${corBorda} border border-neutral-200 shadow-sm p-3`}>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            {pedido.cliente?.nome ?? "Cliente"}
          </p>
          <p className="text-xs text-neutral-400">{pedido.cliente?.telefone}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">{horario}</span>
          <button
            onClick={() => onImprimir(pedido)}
            title="Imprimir cupom"
            className="text-sm text-neutral-400 hover:text-neutral-700"
          >
            🖨️
          </button>
        </div>
      </div>

      <div className="mb-2 pb-2 border-b border-neutral-100">
        <p className="text-xs font-medium text-neutral-500 mb-1">
          {pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"}
        </p>
        <ul className="text-xs text-neutral-600 space-y-1">
          {pedido.itens.map((item) => (
            <li key={item.id} className="flex gap-1.5">
              <span className="font-semibold text-neutral-800 shrink-0">{item.quantidade}x</span>
              <span>
                {item.produto.nome}
                {item.produtoSegundoSabor ? ` / ${item.produtoSegundoSabor.nome}` : ""}
                {item.tamanho ? ` (${item.tamanho.nome})` : ""}
                {item.borda ? ` + borda ${item.borda.nome}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {pedido.observacoes && (
        <div className="mb-2 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Obs:</span> {pedido.observacoes}
          </p>
        </div>
      )}

      <p className="text-xs text-neutral-500 mb-2">📍 {enderecoCompleto}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-neutral-800">
          {formatarMoeda(totalNumero)}
        </span>
        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">
          {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento]}
        </span>
      </div>

      {pedido.forma_pagamento === "dinheiro" && (
        <div
          className={`mb-2 rounded-md px-2 py-1.5 text-xs ${
            trocoParaNumero
              ? "bg-red-50 border border-red-100 text-red-700"
              : "bg-green-50 border border-green-100 text-green-700"
          }`}
        >
          {trocoParaNumero ? (
            <>
              💵 Troco para {formatarMoeda(trocoParaNumero)} — levar{" "}
              <span className="font-semibold">{formatarMoeda(trocoParaNumero - totalNumero)}</span> de troco
            </>
          ) : (
            "💵 Não precisa de troco"
          )}
        </div>
      )}

      <select
        value={pedido.status}
        onChange={(e) => onMudarStatus(pedido.id, e.target.value as StatusPedido)}
        className="w-full text-xs border border-neutral-200 rounded-md px-2 py-1.5 bg-white"
      >
        {STATUS_OPCOES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}