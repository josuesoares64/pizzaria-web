"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/server/order.service";
import { Order } from "@/types/order";

const ATALHOS = [
  {
    href: "/dashboard/dono/pedidos",
    titulo: "Kanban de Pedidos",
    descricao: "Acompanhe a fila em tempo real, despache entregas e imprima cupons.",
    icone: "🍕",
    corBadge: "bg-amber-50 text-amber-800 border-amber-200",
    destaque: true,
  },
  {
    href: "/dashboard/dono/cardapio",
    titulo: "Cardápio & Produtos",
    descricao: "Cadastre pizzas, fotos, bebidas e pause itens que esgotaram.",
    icone: "📋",
    corBadge: "bg-red-50 text-red-800 border-red-200",
  },
  {
    href: "/dashboard/dono/tamanhos-bordas",
    titulo: "Tamanhos & Bordas",
    descricao: "Configure tamanhos de pizzas (fatias) e as bordas recheadas.",
    icone: "🧀",
    corBadge: "bg-orange-50 text-orange-800 border-orange-200",
  },
  {
    href: "/dashboard/dono/configuracoes",
    titulo: "Configurações da Loja",
    descricao: "Taxas por bairro, link do cardápio e impressora térmica (58/80mm).",
    icone: "⚙️",
    corBadge: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
  {
    href: "/dashboard/dono/funcionarios",
    titulo: "Equipe & Acessos",
    descricao: "Gerencie os logins e acessos dos atendentes e pizzaiolos.",
    icone: "👨‍🍳",
    corBadge: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    href: "/dashboard/dono/minha-conta",
    titulo: "Minha Conta & Senha",
    descricao: "Altere a sua senha de acesso de administrador com segurança.",
    icone: "🔒",
    corBadge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ehHoje(dataISO: string) {
  const data = new Date(dataISO);
  const hoje = new Date();
  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}

function obterSaudacao() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return "Bom dia! Preparando os fornos?";
  if (hora >= 12 && hora < 18) return "Boa tarde! Que o dia seja produtivo.";
  return "Boa noite! Ótima fornada e boas vendas!";
}

export default function DashboardDonoPage() {
  const [pedidosHoje, setPedidosHoje] = useState<Order[]>([]);
  const [pedidosAtivosCount, setPedidosAtivosCount] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    orderService
      .listarPedidosPizzaria()
      .then((pedidos) => {
        const hoje = pedidos.filter((p) => ehHoje(p.createdAt));
        setPedidosHoje(hoje);

        const ativos = pedidos.filter((p) =>
          ["pendente", "confirmado", "preparando", "saiu_para_entrega"].includes(p.status),
        );
        setPedidosAtivosCount(ativos.length);
      })
      .catch(() => {
        // Se a listagem falhar, os atalhos continuam operacionais
      })
      .finally(() => setCarregando(false));
  }, []);

  const pedidosValidos = pedidosHoje.filter((p) => p.status !== "cancelado");
  const totalPedidos = pedidosValidos.length;
  const faturado = pedidosValidos.reduce((soma, p) => soma + Number(p.total), 0);
  const ticketMedio = totalPedidos > 0 ? faturado / totalPedidos : 0;
  const cancelados = pedidosHoje.filter((p) => p.status === "cancelado").length;

  // Distribuição simples das formas de pagamento de hoje
  const pixTotal = pedidosValidos
    .filter((p) => p.forma_pagamento === "pix")
    .reduce((s, p) => s + Number(p.total), 0);

  const cartaoTotal = pedidosValidos
    .filter((p) => p.forma_pagamento === "cartao")
    .reduce((s, p) => s + Number(p.total), 0);

  const dinheiroTotal = pedidosValidos
    .filter((p) => p.forma_pagamento === "dinheiro")
    .reduce((s, p) => s + Number(p.total), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Topo com Saudação e Status Operacional */}
      <header className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Painel Administrativo
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operação Conectada
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {obterSaudacao()}
            </p>
          </div>

          {pedidosAtivosCount > 0 && (
            <Link
              href="/dashboard/dono/pedidos"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0 animate-bounce"
            >
              <span>🔥</span>
              <span>{pedidosAtivosCount} pedido(s) em andamento agora</span>
              <span>➔</span>
            </Link>
          )}
        </div>
      </header>

      {/* Métricas do Dia em Tempo Real */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Resumo Operacional de Hoje
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {carregando ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-2xl p-4 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card: Faturamento */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                Faturamento Bruto
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                {formatarMoeda(faturado)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">Total de pedidos válidos</p>
            </div>

            {/* Card: Total de Pedidos */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                Pedidos Concluídos
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                {totalPedidos}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {cancelados > 0 ? `${cancelados} cancelado(s)` : "Zero cancelamentos"}
              </p>
            </div>

            {/* Card: Ticket Médio */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                Ticket Médio
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                {formatarMoeda(ticketMedio)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">Média por cliente</p>
            </div>

            {/* Card: Cancelamentos */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-neutral-400 block mb-1">
                Cancelamentos
              </span>
              <p
                className={`text-xl sm:text-2xl font-extrabold font-mono ${
                  cancelados > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {cancelados}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1">
                {cancelados === 0 ? "Tudo sob controle" : "Pedidos estornados"}
              </p>
            </div>
          </div>
        )}

        {/* Resumo por Forma de Pagamento */}
        {!carregando && totalPedidos > 0 && (
          <div className="mt-3 bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-neutral-500 font-sans font-semibold text-[11px]">
              Entradas de hoje:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
                ⚡ Pix: {formatarMoeda(pixTotal)}
              </span>
              <span className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
                💳 Cartão: {formatarMoeda(cartaoTotal)}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                💵 Dinheiro: {formatarMoeda(dinheiroTotal)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Grid de Atalhos Rápidos */}
      <section>
        <div className="mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Módulos de Gestão
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ATALHOS.map((atalho) => (
            <Link
              key={atalho.href}
              href={atalho.href}
              className={`group bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                atalho.destaque
                  ? "border-amber-300 hover:border-amber-400 bg-gradient-to-br from-white to-amber-50/20"
                  : "border-neutral-200/90 hover:border-red-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:scale-110 flex items-center justify-center text-xl transition-transform shadow-2xs">
                    {atalho.icone}
                  </span>
                  <span className="text-xs font-bold text-neutral-300 group-hover:text-red-600 transition-colors">
                    ➔
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-red-600 transition-colors">
                  {atalho.titulo}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  {atalho.descricao}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group-hover:text-neutral-700">
                <span>Acessar área</span>
                <span className="text-xs">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}