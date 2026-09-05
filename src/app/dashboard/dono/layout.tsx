"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { WhatsappButton } from "@/components/WhatsappButton";

const NAV_ITEMS = [
  { href: "/dashboard/dono/pedidos", label: "Pedidos" },
  { href: "/dashboard/dono/cardapio", label: "Cardápio" },
  { href: "/dashboard/dono/funcionarios", label: "Funcionários" },
  { href: "/dashboard/dono/tamanhos-bordas", label: "Tamanhos e bordas" },
  { href: "/dashboard/dono/configuracoes", label: "Configurações" },
];

export default function DonoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
        <span className="text-base font-semibold tracking-tight text-red-600">
          Sistema Fornomenu
        </span>
        <button
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="p-2 -mr-2 text-neutral-700"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {menuAberto && (
        <div
          onClick={() => setMenuAberto(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`w-60 shrink-0 border-r border-neutral-200 bg-white
          fixed md:static inset-y-0 left-0 z-50
          transform transition-transform duration-200
          ${menuAberto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-5 py-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold tracking-tight text-red-600">
              Sistema FornoMenu
            </span>
            <p className="text-xs text-neutral-400 mt-0.5">Painel do dono</p>
          </div>
          <button
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="md:hidden p-1 text-neutral-400"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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

      <main className="flex-1 p-6 pt-20 md:pt-6">{children}</main>

      <WhatsappButton
        telefone="88981185172"
        mensagem="Olá! Preciso de suporte com o Fornomenu."
      />
    </div>
  );
}