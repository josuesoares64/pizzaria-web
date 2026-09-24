"use client";

import { FormEvent, useState } from "react";
import { api } from "@/server/api";

const INPUT_CLASSES =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20";

export function AlterarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!senhaAtual || !novaSenha || !confirmacao) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha.trim().length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro("A confirmação não é igual à nova senha.");
      return;
    }

    if (senhaAtual.trim() === novaSenha.trim()) {
      setErro("A nova senha deve ser diferente da atual.");
      return;
    }

    setEnviando(true);

    try {
      await api.put("/auth/alterar-senha", { senhaAtual, novaSenha });
      setSucesso("Senha alterada com sucesso.");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
    } catch (err) {
      const mensagem =
        (err as { message?: string })?.message ||
        "Não foi possível alterar a senha.";
      setErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
    >
      <div>
        <label
          htmlFor="senha-atual"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Senha atual
        </label>
        <input
          id="senha-atual"
          type="password"
          autoComplete="current-password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>

      <div>
        <label
          htmlFor="nova-senha"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Nova senha
        </label>
        <input
          id="nova-senha"
          type="password"
          autoComplete="new-password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className={INPUT_CLASSES}
        />
        <p className="mt-1 text-xs text-neutral-400">Mínimo de 6 caracteres.</p>
      </div>

      <div>
        <label
          htmlFor="confirmacao-senha"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirmacao-senha"
          type="password"
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>

      {erro && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {erro}
        </p>
      )}

      {sucesso && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {sucesso}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}