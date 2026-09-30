import { ReactNode } from "react";
import { DashboardShell, NavItem } from "@/components/dashboard/Dashboardshell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/funcionario", label: "Início" },
  { href: "/dashboard/funcionario/pedidos", label: "Pedidos (Kanban)" },
  { href: "/dashboard/funcionario/cardapio", label: "Cardápio Operacional" },
  { href: "/dashboard/funcionario/tamanhos-bordas", label: "Tamanhos & Bordas" },
  { href: "/dashboard/funcionario/minha-conta", label: "Minha Senha & Conta" },
];

export default function FuncionarioLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={NAV_ITEMS} subtitulo="Painel do Funcionário">
      {children}
    </DashboardShell>
  );
}