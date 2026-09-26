"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/server/order.service";
import { Order } from "@/types/order";

const ATALHOS = [
  {
    href: "/dashboard/dono/pedidos",
    titulo: "Pedidos",
    descricao: "Acompanhe e gerencie os pedidos da pizzaria.",
  },
  {
    href: "/dashboard/dono/cardapio",
    titulo: "Cardápio",
    descricao: "Cadastre e edite produtos e categorias.",
  },
  {
    href: "/dashboard/dono/funcionarios",
    titulo: "Funcionários",
    descricao: "Gerencie quem tem acesso ao painel.",
  },
  {
    href: "/dashboard/dono/tamanhos-bordas",
    titulo: "Tamanhos e bordas",
    descricao: "Configure os tamanhos e bordas disponíveis.",
  },
  {
    href: "/dashboard/dono/configuracoes",
    titulo: "Configurações",
    descricao: "Ajuste dados da pizzaria e taxas de entrega.",
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

export default function DashboardDonoPage() {
  const [pedidosHoje, setPedidosHoje] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    orderService
      .listarPedidosPizzaria()
      .then((pedidos) => {
        setPedidosHoje(pedidos.filter((p) => ehHoje(p.createdAt)));
      })
      .catch(() => {
        // Se der erro, o resumo do dia simplesmente não aparece.
        // Os atalhos abaixo continuam funcionando normalmente.
      })
      .finally(() => setCarregando(false));
  }, []);

  const pedidosValidos = pedidosHoje.filter((p) => p.status !== "cancelado");
  const totalPedidos = pedidosValidos.length;
  const faturado = pedidosValidos.reduce((soma, p) => soma + Number(p.total), 0);
  const cancelados = pedidosHoje.filter((p) => p.status === "cancelado").length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">
        Dashboard do dono
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Acesso rápido às áreas do painel.
      </p>

      {!carregando && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Pedidos hoje</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {totalPedidos}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Faturado hoje</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {formatarMoeda(faturado)}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Cancelados hoje</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {cancelados}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ATALHOS.map((atalho) => (
          <Link
            key={atalho.href}
            href={atalho.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-red-200 hover:bg-red-50"
          >
            <h2 className="text-sm font-semibold text-neutral-900">
              {atalho.titulo}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {atalho.descricao}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}