import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/Dashboardshell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/funcionario", label: "Início" },
  { href: "/dashboard/funcionario/pedidos", label: "Pedidos" },
  { href: "/dashboard/funcionario/cardapio", label: "Cardápio" },
  { href: "/dashboard/funcionario/tamanhos-bordas", label: "Tamanhos e bordas" },
  { href: "/dashboard/funcionario/minha-conta", label: "Minha conta" },
];

export default function FuncionarioLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={NAV_ITEMS} subtitulo="Painel do funcionário">
      {children}
    </DashboardShell>
  );
}