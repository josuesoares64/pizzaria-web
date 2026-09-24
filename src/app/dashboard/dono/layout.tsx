import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/Dashboardshell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/dono/pedidos", label: "Pedidos" },
  { href: "/dashboard/dono/cardapio", label: "Cardápio" },
  { href: "/dashboard/dono/funcionarios", label: "Funcionários" },
  { href: "/dashboard/dono/tamanhos-bordas", label: "Tamanhos e bordas" },
  { href: "/dashboard/dono/configuracoes", label: "Configurações" },
  { href: "/dashboard/dono/minha-conta", label: "Minha conta" },
];

export default function DonoLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={NAV_ITEMS} subtitulo="Painel do dono">
      {children}
    </DashboardShell>
  );
}