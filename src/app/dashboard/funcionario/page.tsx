"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/server/order.service";
import { Order } from "@/types/order";

const ATALHOS = [
  {
    href: "/dashboard/funcionario/pedidos",
    titulo: "Pedidos",
    descricao: "Acompanhe e atualize o status dos pedidos.",
  },
  {
    href: "/dashboard/funcionario/cardapio",
    titulo: "Cardápio",
    descricao: "Consulte e edite os produtos do cardápio.",
  },
  {
    href: "/dashboard/funcionario/tamanhos-bordas",
    titulo: "Tamanhos e bordas",
    descricao: "Veja os tamanhos e bordas disponíveis.",
  },
];

export default function DashboardFuncionarioPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    orderService
      .listarPedidosPizzaria()
      .then(setPedidos)
      .catch(() => {
        // Se der erro, o resumo simplesmente não aparece.
      })
      .finally(() => setCarregando(false));
  }, []);

  const pendentes = pedidos.filter((p) => p.status === "pendente").length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">
        Dashboard do funcionário
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Acesso rápido às áreas do painel.
      </p>

      {!carregando && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Pedidos pendentes</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {pendentes}
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