"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

// Mapeia ícones contextuais para os links padrão do sistema
const ICONES_MENU: Record<string, string> = {
  // Dono
  "/dashboard/dono": "📊",
  "/dashboard/dono/pedidos": "🍕",
  "/dashboard/dono/cardapio": "📋",
  "/dashboard/dono/tamanhos-bordas": "🧀",
  "/dashboard/dono/funcionarios": "👨‍🍳",
  "/dashboard/dono/configuracoes": "⚙️",
  "/dashboard/dono/minha-conta": "🔒",

  // Funcionário
  "/dashboard/funcionario": "🏠",
  "/dashboard/funcionario/pedidos": "🍕",
  "/dashboard/funcionario/cardapio": "📋",
  "/dashboard/funcionario/tamanhos-bordas": "🧀",
  "/dashboard/funcionario/minha-conta": "🔒",
};

export function DashboardShell({
  navItems,
  subtitulo = "Painel do Dono",
  children,
}: {
  navItems: NavItem[];
  subtitulo?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Função para verificar se a rota está ativa com precisão para Dono e Funcionário
  function verificarAtivo(href: string) {
    if (href === "/dashboard/dono" || href === "/dashboard/funcionario") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    const confirmar = window.confirm("Deseja realmente sair da sua conta?");
    if (!confirmar) return;

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("auth");
        sessionStorage.clear();
      }
    } catch {
      // Ignora erro de limpeza local
    } finally {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col md:flex-row antialiased">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200/90 shadow-2xs shrink-0 select-none">
        {/* Topo / Logo */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-xl shadow-xs shadow-red-500/20">
              🍕
            </div>
            <div>
              <span className="text-base font-extrabold text-neutral-900 tracking-tight block leading-tight">
                Forno Menu
              </span>
              <span className="text-[11px] font-semibold text-neutral-400 block mt-0.5">
                {subtitulo}
              </span>
            </div>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const ativo = verificarAtivo(item.href);
            const icone = ICONES_MENU[item.href] || "•";
            const isPedidos = item.href.includes("/pedidos");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  ativo
                    ? "bg-red-600 text-white shadow-xs shadow-red-600/20 font-bold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{icone}</span>
                  <span>{item.label}</span>
                </div>

                {isPedidos && !ativo && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-3.5 border-t border-neutral-100 space-y-1.5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* CABEÇALHO MOBILE */}
      <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm shadow-2xs">
            🍕
          </div>
          <div>
            <span className="text-sm font-bold text-neutral-900 block leading-tight">
              Forno Menu
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {subtitulo}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuMobileAberto(!menuMobileAberto)}
          className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          aria-label="Abrir menu"
        >
          {menuMobileAberto ? "✕" : "☰"}
        </button>
      </header>

      {/* MENU DRAWER MOBILE */}
      {menuMobileAberto && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="bg-white w-4/5 max-w-xs h-full p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                <span className="font-bold text-sm text-neutral-800">Navegação</span>
                <button
                  onClick={() => setMenuMobileAberto(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const ativo = verificarAtivo(item.href);
                  const icone = ICONES_MENU[item.href] || "•";

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuMobileAberto(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        ativo
                          ? "bg-red-600 text-white font-bold"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{icone}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-red-600"
              >
                <span>🚪</span>
                <span>Sair</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuMobileAberto(false)} />
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}