"use client";

import { FormEvent, useState } from "react";
import { api } from "@/server/api";
import { FiEye, FiEyeOff, FiCheck, FiX, FiLock } from "react-icons/fi";

export function AlterarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const senhasIguais = confirmacao.length > 0 && novaSenha === confirmacao;
  const senhasDiferentes = confirmacao.length > 0 && novaSenha !== confirmacao;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!senhaAtual || !novaSenha || !confirmacao) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }

    if (novaSenha.trim().length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro("A confirmação não coincide com a nova senha digitada.");
      return;
    }

    if (senhaAtual.trim() === novaSenha.trim()) {
      setErro("A nova senha deve ser diferente da sua senha atual.");
      return;
    }

    setEnviando(true);

    try {
      await api.put("/auth/alterar-senha", { senhaAtual, novaSenha });
      setSucesso("Sua senha foi alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
    } catch (err) {
      const mensagem =
        (err as { message?: string })?.message ||
        "Não foi possível alterar a senha. Verifique se sua senha atual está correta.";
      setErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs"
    >
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 mb-1">
        <span className="text-base text-neutral-600">
          <FiLock />
        </span>
        <div>
          <h2 className="text-sm font-bold text-neutral-900">
            Atualizar Senha de Acesso
          </h2>
          <p className="text-[11px] text-neutral-400">
            Use uma senha forte e memorize para os próximos acessos
          </p>
        </div>
      </div>

      {erro && (
        <div
          role="alert"
          className="flex items-center justify-between text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 shadow-2xs"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro(null)}
            className="text-xs font-bold underline ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 shadow-2xs"
        >
          <span>{sucesso}</span>
          <button
            type="button"
            onClick={() => setSucesso(null)}
            className="text-xs font-bold underline ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Campo: Senha Atual */}
      <div>
        <label
          htmlFor="senha-atual"
          className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1"
        >
          Senha Atual *
        </label>
        <div className="relative">
          <input
            id="senha-atual"
            type={mostrarAtual ? "text" : "password"}
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Digite a senha atual"
            className="w-full border border-neutral-300 rounded-xl pl-3.5 pr-10 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
          />
          <button
            type="button"
            onClick={() => setMostrarAtual(!mostrarAtual)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
            title={mostrarAtual ? "Ocultar senha" : "Ver senha"}
          >
            {mostrarAtual ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      {/* Campo: Nova Senha */}
      <div>
        <label
          htmlFor="nova-senha"
          className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1"
        >
          Nova Senha *
        </label>
        <div className="relative">
          <input
            id="nova-senha"
            type={mostrarNova ? "text" : "password"}
            autoComplete="new-password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="w-full border border-neutral-300 rounded-xl pl-3.5 pr-10 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
          />
          <button
            type="button"
            onClick={() => setMostrarNova(!mostrarNova)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
            title={mostrarNova ? "Ocultar senha" : "Ver senha"}
          >
            {mostrarNova ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      {/* Campo: Confirmação */}
      <div>
        <label
          htmlFor="confirmacao-senha"
          className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1"
        >
          Confirmar Nova Senha *
        </label>
        <div className="relative">
          <input
            id="confirmacao-senha"
            type={mostrarConfirmacao ? "text" : "password"}
            autoComplete="new-password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Repita a nova senha"
            className={`w-full border rounded-xl pl-3.5 pr-10 py-2 text-sm focus:outline-none font-mono ${
              senhasIguais
                ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                : senhasDiferentes
                ? "border-red-400 focus:ring-2 focus:ring-red-500/10"
                : "border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
            }`}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
            title={mostrarConfirmacao ? "Ocultar senha" : "Ver senha"}
          >
            {mostrarConfirmacao ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        {/* Feedback visual imediato de coincidência */}
        {senhasIguais && (
          <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <FiCheck /> As senhas coincidem!
          </p>
        )}
        {senhasDiferentes && (
          <p className="flex items-center gap-1 text-[11px] text-red-600 font-medium mt-1">
            <FiX /> As senhas não coincidem.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <button
          type="submit"
          disabled={enviando || !senhaAtual || !novaSenha || !confirmacao || novaSenha !== confirmacao}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          {enviando ? "Salvando..." : "Salvar Nova Senha"}
        </button>
      </div>
    </form>
  );
}