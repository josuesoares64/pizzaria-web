import { AlterarSenhaForm } from "@/components/AlterarSenhaForm";

export default function MinhaContaPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Topo da Página */}
      <header>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Minha Conta & Segurança
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Gerencie as credenciais e a segurança de acesso ao seu painel
        </p>
      </header>

      {/* Formulário Principal */}
      <AlterarSenhaForm />

      {/* Dica de Segurança */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-xs text-neutral-600 leading-relaxed">
        <p className="font-semibold text-neutral-800 mb-1">
          🛡️ Dica de segurança da conta:
        </p>
        <p>
          Nunca compartilhe a sua senha de administrador com colaboradores ou entregadores. Caso precise que eles acessem o painel, cadastre-os individualmente na aba{" "}
          <strong className="text-neutral-900">Funcionários</strong>.
        </p>
      </div>
    </div>
  );
}