"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { orderService } from "@/server/order.service";
import { Order } from "@/types/order";
import {
  FiClock,
  FiShoppingBag,
  FiArrowRight,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";

const ATALHOS = [
  {
    href: "/dashboard/funcionario/pedidos",
    titulo: "Controle de Pedidos",
    descricao: "Mover pedidos no Kanban, imprimir comandas e atualizar status.",
    icone: "🍕",
    destaque: true,
  },
  {
    href: "/dashboard/funcionario/cardapio",
    titulo: "Cardápio & Estoque",
    descricao: "Pausar ou ativar sabores de pizzas, bebidas e itens simples.",
    icone: "📋",
    destaque: false,
  },
  {
    href: "/dashboard/funcionario/tamanhos-bordas",
    titulo: "Tamanhos & Bordas",
    descricao: "Consultar os tamanhos cadastrados e pausar bordas esgotadas.",
    icone: "🧀",
    destaque: false,
  },
  {
    href: "/dashboard/funcionario/minha-conta",
    titulo: "Minha Senha & Acesso",
    descricao: "Atualizar sua senha individual de acesso ao sistema.",
    icone: "🔒",
    destaque: false,
  },
];

export default function DashboardFuncionarioPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregarPedidos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);

    try {
      const dados = await orderService.listarPedidosPizzaria();
      setPedidos(dados);
    } catch {
      // Fallback silencioso
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  // Contagens operacionais de fluxo de atendimento
  const pendentes = pedidos.filter((p) => p.status === "pendente").length;
  const preparando = pedidos.filter((p) => p.status === "preparando").length;
  const emEntrega = pedidos.filter((p) => p.status === "saiu_para_entrega").length;
  const finalizados = pedidos.filter((p) => p.status === "entregue").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Topo da Página */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍🍳</span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Painel Operacional do Atendimento
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Acompanhe o ritmo da cozinha, pedidos pendentes e atalhos rápidos
          </p>
        </div>

        <button
          type="button"
          onClick={() => carregarPedidos(true)}
          disabled={atualizando}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 px-3 py-2 rounded-xl shadow-2xs hover:bg-neutral-50 transition-colors disabled:opacity-50"
          title="Atualizar status"
        >
          <FiRefreshCw className={atualizando ? "animate-spin text-red-600" : ""} size={13} />
          <span>Atualizar</span>
        </button>
      </header>

      {/* Banner de Atenção se houver pedidos pendentes */}
      {pendentes > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-amber-900">
                Atenção: Você tem {pendentes} {pendentes === 1 ? "pedido pendente" : "pedidos pendentes"}!
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Confirme e envie para a cozinha para iniciar o preparo imediatamente.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/funcionario/pedidos"
            className="self-start sm:self-auto text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-colors shrink-0 shadow-2xs"
          >
            Abrir Kanban →
          </Link>
        </div>
      )}

      {/* Métricas Operacionais */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pendentes */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Pendentes
            </span>
            {pendentes > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            ) : (
              <FiClock size={14} />
            )}
          </div>
          <p className="text-2xl font-black font-mono text-neutral-900 mt-1">
            {carregando ? "—" : pendentes}
          </p>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Aguardando aceite
          </span>
        </div>

        {/* No Forno */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              No Forno
            </span>
            <span className="text-xs">🔥</span>
          </div>
          <p className="text-2xl font-black font-mono text-neutral-900 mt-1">
            {carregando ? "—" : preparando}
          </p>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Em preparação
          </span>
        </div>

        {/* Em Rota / Entrega */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Em Entrega
            </span>
            <span className="text-xs">🛵</span>
          </div>
          <p className="text-2xl font-black font-mono text-neutral-900 mt-1">
            {carregando ? "—" : emEntrega}
          </p>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Com os entregadores
          </span>
        </div>

        {/* Concluídos */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Entregues
            </span>
            <FiCheckCircle size={14} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black font-mono text-neutral-900 mt-1">
            {carregando ? "—" : finalizados}
          </p>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            Finalizados com sucesso
          </span>
        </div>
      </section>

      {/* Grid de Atalhos de Trabalho */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Acesso Rápido às Funções
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ATALHOS.map((atalho) => (
            <Link
              key={atalho.href}
              href={atalho.href}
              className={`group p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between shadow-2xs ${
                atalho.destaque
                  ? "bg-white border-red-200/90 hover:border-red-500 hover:shadow-md"
                  : "bg-white border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                    {atalho.icone}
                  </div>
                  {atalho.destaque && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors">
                  {atalho.titulo}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                  {atalho.descricao}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-400 group-hover:text-neutral-700">
                <span>Acessar</span>
                <FiArrowRight
                  size={14}
                  className="group-hover:translate-x-1 group-hover:text-red-600 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}