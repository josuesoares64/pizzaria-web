import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/Dashboardshell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/dono", label: "Início", icone: "📊" },
  { href: "/dashboard/dono/pedidos", label: "Pedidos", icone: "🍕", destaque: true },
  { href: "/dashboard/dono/cardapio", label: "Cardápio", icone: "📋" },
  { href: "/dashboard/dono/tamanhos-bordas", label: "Tamanhos & Bordas", icone: "🧀" },
  { href: "/dashboard/dono/funcionarios", label: "Funcionários", icone: "👨‍🍳" },
  { href: "/dashboard/dono/configuracoes", label: "Configurações", icone: "⚙️" },
  { href: "/dashboard/dono/minha-conta", label: "Minha Conta", icone: "🔒" },
];

export default function DonoLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={NAV_ITEMS} subtitulo="Painel do Dono">
      {children}
    </DashboardShell>
  );
}