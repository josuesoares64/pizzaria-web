import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/Dashboardshell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/dono", label: "Início" },
  { href: "/dashboard/dono/pedidos", label: "Pedidos" },
  { href: "/dashboard/dono/cardapio", label: "Cardápio" },
  { href: "/dashboard/dono/tamanhos-bordas", label: "Tamanhos & Bordas" },
  { href: "/dashboard/dono/funcionarios", label: "Funcionários" },
  { href: "/dashboard/dono/configuracoes", label: "Configurações" },
  { href: "/dashboard/dono/minha-conta", label: "Minha Conta" },
];

export default function DonoLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={NAV_ITEMS} subtitulo="Painel do Dono">
      {children}
    </DashboardShell>
  );
}