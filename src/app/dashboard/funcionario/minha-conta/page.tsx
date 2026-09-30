import { AlterarSenhaForm } from "@/components/AlterarSenhaForm";
import { FiLock, FiShield } from "react-icons/fi";

export default function MinhaContaPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Topo da Página */}
      <header className="pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Minha Conta & Senha
          </h1>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">
          Atualize sua senha de acesso individual ao painel de atendimento e cozinha
        </p>
      </header>

      {/* Formulário Principal de Troca de Senha */}
      <AlterarSenhaForm />

      {/* Dica de Segurança para Funcionários */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 text-xs text-neutral-600 flex items-start gap-3 shadow-2xs">
        <FiShield className="text-neutral-500 shrink-0 mt-0.5" size={16} />
        <div>
          <p className="font-bold text-neutral-800 mb-0.5">
            Segurança do seu acesso
          </p>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Sua conta é individual. Não repasse sua senha a outros colaboradores. Todas as ações realizadas no painel (atualizações de status de pedidos e cardápio) ficam registradas sob seu usuário.
          </p>
        </div>
      </div>
    </div>
  );
}