"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/dashboard/dono/pedidos", label: "Pedidos" },
  { href: "/dashboard/dono/cardapio", label: "Cardápio" },
  { href: "/dashboard/dono/tamanhos-e-bordas", label: "Tamanhos e bordas" },
  { href: "/dashboard/dono/configuracoes", label: "Configurações" },
];

export default function DonoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="w-60 shrink-0 border-r border-neutral-200 bg-white">
        <div className="px-5 py-6 border-b border-neutral-100">
          <span className="text-lg font-semibold tracking-tight text-red-600">
            Bella Pizza
          </span>
          <p className="text-xs text-neutral-400 mt-0.5">Painel do dono</p>
        </div>

        <nav className="px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-red-50 text-red-600"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}