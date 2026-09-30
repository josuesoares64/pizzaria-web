"use client";

import { useEffect, useState, useCallback } from "react";
import { orderService } from "@/server/order.service";
import { pizzariaService } from "@/server/pizzaria.service";
import { Order, StatusPedido } from "@/types/order";
import ReciboModal from "./ReciboModal";
import ImpressaoAutomatica from "./ImpressaoAutomatica";

interface ColunaConfig {
  status: StatusPedido;
  label: string;
  sublabel: string;
  corBorda: string;
  corHeader: string;
  badgeCor: string;
  icone: string;
  proximoStatus?: StatusPedido;
  proximoLabel?: string;
  corBotaoAvanco?: string;
}

const COLUNAS_ATIVAS: ColunaConfig[] = [
  {
    status: "pendente",
    label: "Pendente",
    sublabel: "Aguardando confirmação",
    corBorda: "border-l-amber-500",
    corHeader: "bg-amber-50/80 border-amber-200/80 text-amber-900",
    badgeCor: "bg-amber-100 text-amber-800 border-amber-300",
    icone: "⏳",
    proximoStatus: "confirmado",
    proximoLabel: "Confirmar Pedido",
    corBotaoAvanco: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
  },
  {
    status: "confirmado",
    label: "Confirmado",
    sublabel: "Fila de produção",
    corBorda: "border-l-blue-500",
    corHeader: "bg-blue-50/80 border-blue-200/80 text-blue-900",
    badgeCor: "bg-blue-100 text-blue-800 border-blue-300",
    icone: "📋",
    proximoStatus: "preparando",
    proximoLabel: "Iniciar Preparo",
    corBotaoAvanco: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
  },
  {
    status: "preparando",
    label: "Preparando",
    sublabel: "No forno / montagem",
    corBorda: "border-l-orange-500",
    corHeader: "bg-orange-50/80 border-orange-200/80 text-orange-900",
    badgeCor: "bg-orange-100 text-orange-800 border-orange-300",
    icone: "🔥",
    proximoStatus: "saiu_para_entrega",
    proximoLabel: "Pronto / Despachar",
    corBotaoAvanco: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20",
  },
  {
    status: "saiu_para_entrega",
    label: "Saiu para entrega",
    sublabel: "Em rota com o motoboy",
    corBorda: "border-l-purple-500",
    corHeader: "bg-purple-50/80 border-purple-200/80 text-purple-900",
    badgeCor: "bg-purple-100 text-purple-800 border-purple-300",
    icone: "🛵",
    proximoStatus: "entregue",
    proximoLabel: "Finalizar Entrega",
    corBotaoAvanco: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
  },
];

const STATUS_OPCOES: { value: StatusPedido; label: string }[] = [
  { value: "pendente", label: "⏳ Pendente" },
  { value: "confirmado", label: "📋 Confirmado" },
  { value: "preparando", label: "🔥 Preparando" },
  { value: "saiu_para_entrega", label: "🛵 Saiu para entrega" },
  { value: "entregue", label: "✅ Entregue" },
  { value: "cancelado", label: "❌ Cancelado" },
];

const FORMA_PAGAMENTO_INFO: Record<string, { label: string; badge: string; icone: string }> = {
  dinheiro: {
    label: "Dinheiro",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icone: "💵",
  },
  pix: {
    label: "Pix",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
    icone: "⚡",
  },
  cartao: {
    label: "Cartão",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    icone: "💳",
  },
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
    mostrarToast(novoValor ? "🖨️ Auto-impressão ativada" : "Auto-impressão desativada");
  }

  function mostrarToast(mensagem: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, mensagem }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handlePedidoImpressoAutomaticamente(pedido: Order) {
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
      const label = STATUS_OPCOES.find((s) => s.value === novoStatus)?.label || novoStatus;
      mostrarToast(`Pedido #${orderId.slice(0, 8).toUpperCase()} alterado para ${label}`);
    } catch {
      setPedidos(anterior);
      setErro("Não foi possível atualizar o status desse pedido.");
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-neutral-500">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Carregando painel de pedidos...</p>
      </div>
    );
  }

  const pedidosAtivos = pedidos.filter((p) =>
    ["pendente", "confirmado", "preparando", "saiu_para_entrega"].includes(p.status)
  );

  const pedidosHistorico = pedidos.filter((p) =>
    ["entregue", "cancelado"].includes(p.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Header Superior com Identidade e Controles */}
      <header className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Título & Badge Operacional */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-sm shadow-orange-500/20">
              🍕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {nomePizzaria || "Bella Pizza"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operação Ativa
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Painel Kanban de Pedidos em Tempo Real
              </p>
            </div>
          </div>

          {/* Controles: Impressão Automática e Alternador de Abas */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Switch de Impressão Automática */}
            <label className="flex items-center gap-2.5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 cursor-pointer select-none transition-colors">
              <span className="flex items-center gap-1">
                <span>🖨️</span>
                <span>Impressão automática</span>
              </span>
              <button
                type="button"
                onClick={handleToggleImpressaoAutomatica}
                className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none ${
                  impressaoAutomatica ? "bg-emerald-500" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    impressaoAutomatica ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </label>

            {/* Alternador de Abas */}
            <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
              <button
                onClick={() => setAba("ativos")}
                className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  aba === "ativos"
                    ? "bg-white shadow-xs text-neutral-900 font-bold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <span>Ativos</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    aba === "ativos"
                      ? "bg-amber-100 text-amber-800 font-bold"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {pedidosAtivos.length}
                </span>
              </button>
              <button
                onClick={() => setAba("historico")}
                className={`px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  aba === "historico"
                    ? "bg-white shadow-xs text-neutral-900 font-bold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <span>Histórico</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-200 text-neutral-600">
                  {pedidosHistorico.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {erro && (
        <div className="flex items-center justify-between text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{erro}</span>
          </div>
          <button
            onClick={() => buscarPedidos()}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {aba === "ativos" ? (
        /* Grid das 4 Colunas Kanban */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUNAS_ATIVAS.map((coluna) => {
            const itensColuna = pedidos.filter((p) => p.status === coluna.status);
            const totalColuna = itensColuna.reduce((soma, p) => soma + Number(p.total), 0);

            return (
              <div
                key={coluna.status}
                className="bg-neutral-100/90 rounded-2xl p-2.5 flex flex-col border border-neutral-200/80 shadow-2xs"
              >
                {/* Header da Coluna com Ícone e Cores Vivas */}
                <div
                  className={`rounded-xl px-3 py-2.5 mb-3 border shadow-2xs ${coluna.corHeader}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{coluna.icone}</span>
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider">
                          {coluna.label}
                        </h2>
                        <p className="text-[10px] opacity-75 font-medium leading-none mt-0.5">
                          {coluna.sublabel}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs ${coluna.badgeCor}`}
                    >
                      {itensColuna.length}
                    </span>
                  </div>

                  {itensColuna.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px] font-mono">
                      <span className="opacity-70">Total:</span>
                      <span className="font-semibold">{formatarMoeda(totalColuna)}</span>
                    </div>
                  )}
                </div>

                {/* Cards da Coluna */}
                <div className="flex flex-col gap-3 min-h-[120px]">
                  {itensColuna.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-xl border border-dashed border-neutral-300 bg-white/50 text-neutral-400">
                      <span className="text-xl block mb-1 opacity-50">{coluna.icone}</span>
                      <p className="text-xs font-medium">Nenhum pedido aqui</p>
                    </div>
                  ) : (
                    itensColuna.map((pedido) => (
                      <PedidoCard
                        key={pedido.id}
                        pedido={pedido}
                        corBorda={coluna.corBorda}
                        colunaConfig={coluna}
                        onMudarStatus={handleMudarStatus}
                        onImprimir={setPedidoParaImprimir}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visual da Aba Histórico */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Histórico de Pedidos
              </h2>
              <p className="text-xs text-neutral-500">
                Pedidos já entregues ou cancelados
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-lg">
              {pedidosHistorico.length} pedido(s)
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {pedidosHistorico.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-10">
                Sem pedidos no histórico ainda.
              </p>
            )}
            {pedidosHistorico.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                corBorda={
                  pedido.status === "entregue"
                    ? "border-l-emerald-500"
                    : "border-l-rose-500"
                }
                onMudarStatus={handleMudarStatus}
                onImprimir={setPedidoParaImprimir}
              />
            ))}
          </div>
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

      {/* Toasts Flutuantes */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[60] no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-neutral-900 text-white text-xs font-medium rounded-xl px-4 py-2.5 shadow-xl border border-neutral-800 flex items-center gap-2"
          >
            {toast.mensagem}
          </div>
        ))}
      </div>
    </div>
  );
}

function TipoPedidoBanner({
  pedido,
  enderecoCompleto,
  taxaEntregaNumero,
}: {
  pedido: Order;
  enderecoCompleto: string | null;
  taxaEntregaNumero: number | null;
}) {
  if (pedido.tipo_pedido === "entrega") {
    return (
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl p-2.5 mb-2.5 shadow-xs">
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide">
            <span className="text-sm">🚚</span>
            <span>Entrega</span>
          </div>
          {taxaEntregaNumero !== null && (
            <span className="text-[11px] font-mono bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded font-semibold text-white">
              Taxa: {taxaEntregaNumero === 0 ? "Grátis" : formatarMoeda(taxaEntregaNumero)}
            </span>
          )}
        </div>
        <p className="text-xs text-white/95 font-medium leading-snug break-words">
          📍 {enderecoCompleto}
        </p>
      </div>
    );
  }

  if (pedido.tipo_pedido === "retirada") {
    return (
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-3 py-2 mb-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🏪</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide leading-none">
              Retirada no balcão
            </p>
            <p className="text-[11px] text-white/90 leading-tight mt-0.5">
              Cliente vai buscar na loja
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pedido.tipo_pedido === "mesa") {
    return (
      <div className="flex items-center justify-between bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl px-3 py-2 mb-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🍽️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide leading-none">
              Mesa {pedido.numero_mesa}
            </p>
            <p className="text-[11px] text-white/90 leading-tight mt-0.5">
              Consumo no local
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PedidoCard({
  pedido,
  corBorda,
  colunaConfig,
  onMudarStatus,
  onImprimir,
}: {
  pedido: Order;
  corBorda: string;
  colunaConfig?: ColunaConfig;
  onMudarStatus: (id: string, status: StatusPedido) => void;
  onImprimir: (pedido: Order) => void;
}) {
  const horario = new Date(pedido.createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalNumero = Number(pedido.total);
  const trocoParaNumero = pedido.troco_para ? Number(pedido.troco_para) : null;

  // Subtotal vem sempre da soma dos itens (fonte confiável, independe de taxa),
  // e a taxa de entrega vem direto do snapshot salvo no pedido.
  const subtotalNumero = pedido.itens.reduce((soma, item) => soma + Number(item.subtotal), 0);
  const taxaEntregaNumero =
    pedido.tipo_pedido === "entrega" && pedido.taxa_entrega !== undefined
      ? Number(pedido.taxa_entrega)
      : null;

  const enderecoCompleto =
    pedido.tipo_pedido === "entrega"
      ? [
          `${pedido.endereco_rua}, ${pedido.endereco_numero}`,
          pedido.endereco_bairro,
          pedido.endereco_complemento,
          pedido.endereco_referencia ? `Ref: ${pedido.endereco_referencia}` : null,
        ]
          .filter(Boolean)
          .join(" — ")
      : null;

  // Formatação do link para abrir diretamente o WhatsApp do cliente
  const apenasDigitosTelefone = pedido.cliente?.telefone
    ? pedido.cliente.telefone.replace(/\D/g, "")
    : "";
  const telefoneWhatsapp =
    apenasDigitosTelefone.length === 10 || apenasDigitosTelefone.length === 11
      ? `55${apenasDigitosTelefone}`
      : apenasDigitosTelefone;

  const idCurto = pedido.id.slice(0, 8).toUpperCase();
  const infoPagamento = FORMA_PAGAMENTO_INFO[pedido.forma_pagamento] || {
    label: pedido.forma_pagamento,
    badge: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icone: "💳",
  };

  return (
    <div
      className={`bg-white rounded-xl border-l-4 ${corBorda} border border-neutral-200 shadow-sm hover:shadow-md transition-shadow p-3.5`}
    >
      {/* Topo do Card: Identificação, WhatsApp e Impressão */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono text-[11px] font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
              #{idCurto}
            </span>
            <span className="text-[11px] font-medium text-neutral-400">
              {horario}
            </span>
          </div>

          <p className="text-sm font-bold text-neutral-900 leading-tight">
            {pedido.cliente?.nome ?? "Cliente"}
          </p>

          {pedido.cliente?.telefone ? (
            <a
              href={`https://wa.me/${telefoneWhatsapp}?text=Ol%C3%A1%2C+${encodeURIComponent(
                pedido.cliente?.nome ?? "Cliente"
              )}%21+Falamos+da+pizzaria+sobre+o+seu+pedido.`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir WhatsApp do cliente"
              className="text-xs text-neutral-600 hover:text-emerald-700 inline-flex items-center gap-1.5 mt-1 group"
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 group-hover:scale-110 transition-transform shadow-2xs">
                <svg
                  viewBox="0 0 24 24"
                  width="11"
                  height="11"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.676.15-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.176-.3-.019-.463.132-.613.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.517l-.577-.01c-.2 0-.527.075-.802.376-.276.3-1.053 1.03-1.053 2.511 0 1.481 1.078 2.91 1.229 3.111.15.201 2.122 3.24 5.14 4.544.718.31 1.278.496 1.716.635.722.23 1.378.197 1.9.12.58-.088 1.782-.728 2.032-1.431.25-.702.25-1.304.175-1.43-.075-.126-.275-.201-.576-.351z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5.01L2 22l5.16-1.31A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.58 0-3.07-.44-4.35-1.21l-.31-.18-3.08.78.82-2.99-.2-.32A8.16 8.16 0 013.8 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z" />
                </svg>
              </span>
              <span className="font-semibold underline-offset-2 group-hover:underline">
                {pedido.cliente.telefone}
              </span>
            </a>
          ) : (
            <p className="text-xs text-neutral-400">—</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onImprimir(pedido)}
            title="Imprimir cupom"
            className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
          >
            🖨️
          </button>
        </div>
      </div>

      {/* Banner de Tipo de Pedido com Taxa em Evidência */}
      <TipoPedidoBanner
        pedido={pedido}
        enderecoCompleto={enderecoCompleto}
        taxaEntregaNumero={taxaEntregaNumero}
      />

      {/* Lista de Itens do Pedido */}
      <div className="mb-2.5 pb-2.5 border-b border-neutral-100">
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
          {pedido.itens.length} {pedido.itens.length === 1 ? "Item" : "Itens"}
        </p>
        <ul className="text-xs text-neutral-700 space-y-1.5">
          {pedido.itens.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 bg-neutral-50/80 rounded-lg p-2 border border-neutral-100"
            >
              <div className="flex items-start gap-1.5 min-w-0">
                <span className="font-mono font-bold text-neutral-900 bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-[11px] shrink-0">
                  {item.quantidade}x
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-800 leading-tight">
                    {item.produto.nome}
                    {item.produtoSegundoSabor && (
                      <span className="text-neutral-600 font-normal">
                        {" "}
                        / {item.produtoSegundoSabor.nome}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-x-2 text-[11px] text-neutral-500 mt-0.5">
                    {item.tamanho && <span>• Tam: {item.tamanho.nome}</span>}
                    {item.borda && (
                      <span className="text-amber-800 font-medium">
                        • Borda: {item.borda.nome}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold text-neutral-700 shrink-0">
                {formatarMoeda(Number(item.subtotal))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Observações com Destaque Visual Imediato */}
      {pedido.observacoes && (
        <div className="mb-2.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
          <p className="text-xs text-amber-900 leading-snug">
            <span className="font-bold block uppercase text-[10px] text-amber-800 mb-0.5">
              ⚠️ Observação:
            </span>
            {pedido.observacoes}
          </p>
        </div>
      )}

      {/* Taxa de entrega e subtotal explícitos para o dono */}
      {pedido.tipo_pedido === "entrega" && taxaEntregaNumero !== null && (
        <div className="mb-2.5 pb-2 border-b border-neutral-100 text-xs text-neutral-600 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatarMoeda(subtotalNumero)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Taxa de entrega</span>
            <span
              className={`font-semibold ${
                taxaEntregaNumero === 0 ? "text-emerald-600" : "text-neutral-800"
              }`}
            >
              {taxaEntregaNumero === 0 ? "Grátis" : formatarMoeda(taxaEntregaNumero)}
            </span>
          </div>
        </div>
      )}

      {/* Total a Pagar e Forma de Pagamento */}
      <div className="flex items-center justify-between mb-2.5 bg-neutral-50 rounded-lg p-2 border border-neutral-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-none">
            Total
          </span>
          <span className="text-base font-extrabold text-neutral-900 font-mono">
            {formatarMoeda(totalNumero)}
          </span>
        </div>
        <span
          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border flex items-center gap-1.5 ${infoPagamento.badge}`}
        >
          <span>{infoPagamento.icone}</span>
          <span>{infoPagamento.label}</span>
        </span>
      </div>

      {/* Troco com Alta Legibilidade */}
      {pedido.forma_pagamento === "dinheiro" && (
        <div
          className={`mb-2.5 rounded-lg px-2.5 py-1.5 text-xs font-mono border ${
            trocoParaNumero
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {trocoParaNumero ? (
            <div className="flex items-center justify-between">
              <span>💵 Troco p/ {formatarMoeda(trocoParaNumero)}:</span>
              <span className="font-bold bg-white/80 px-1.5 py-0.5 rounded border border-red-200">
                Levar {formatarMoeda(trocoParaNumero - totalNumero)}
              </span>
            </div>
          ) : (
            <span className="font-semibold">💵 Não precisa de troco</span>
          )}
        </div>
      )}

      {/* Ações de Status */}
      <div className="space-y-1.5 pt-1">
        {/* Botão de Avanço Rápido */}
        {colunaConfig?.proximoStatus && (
          <button
            type="button"
            onClick={() => onMudarStatus(pedido.id, colunaConfig.proximoStatus!)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${colunaConfig.corBotaoAvanco}`}
          >
            <span>{colunaConfig.proximoLabel}</span>
            <span>➔</span>
          </button>
        )}

        {/* Seletor Completo para qualquer Status */}
        <select
          value={pedido.status}
          onChange={(e) => onMudarStatus(pedido.id, e.target.value as StatusPedido)}
          className="w-full text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
