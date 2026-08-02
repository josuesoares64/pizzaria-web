"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/server/auth.service";

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RegisterOwnerPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomePizzaria, setNomePizzaria] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [endereco, setEndereco] = useState("");

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function handleNomePizzariaChange(valor: string) {
    setNomePizzaria(valor);
    if (!slugEditadoManualmente) {
      setSlug(gerarSlug(valor));
    }
  }

  function handleSlugChange(valor: string) {
    setSlugEditadoManualmente(true);
    setSlug(gerarSlug(valor));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await authService.registerOwner({
        nome,
        email,
        senha,
        telefone,
        nomePizzaria,
        slug,
        endereco,
        logo_url: "",
      });
      setSucesso(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar sua conta.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-sm text-center">
          <p className="text-lg font-semibold text-neutral-800 mb-1">Conta criada com sucesso!</p>
          <p className="text-sm text-neutral-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-neutral-200 rounded-lg p-6"
      >
        <h1 className="text-xl font-semibold text-red-600 mb-1">Bella Pizza</h1>
        <p className="text-sm text-neutral-500 mb-6">Crie sua conta e cadastre sua pizzaria</p>

        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-3 mb-5">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Seus dados</p>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Seu telefone"
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirmar senha"
              className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Sua pizzaria</p>
          <input
            required
            value={nomePizzaria}
            onChange={(e) => handleNomePizzariaChange(e.target.value)}
            placeholder="Nome da pizzaria"
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
          />
          <div>
            <input
              required
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="slug-da-pizzaria"
              className="border border-neutral-200 rounded-md px-3 py-2 text-sm w-full"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Seu cardápio ficará em: /{slug || "slug-da-pizzaria"}
            </p>
          </div>
          <input
            required
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço da pizzaria"
            className="border border-neutral-200 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-red-600 text-white text-sm font-medium py-2.5 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {enviando ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-xs text-neutral-500 text-center mt-4">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-red-600 font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}