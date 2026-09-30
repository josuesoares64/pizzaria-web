"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/server/auth.service";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiArrowRight,
} from "react-icons/fi";

function RegisterForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const senhasIguais = confirmarSenha.length > 0 && senha === confirmarSenha;
  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      await authService.register({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.trim(),
      });

      // Redireciona para o login preservando redirect/produto se existirem
      const redirect = searchParams.get("redirect");
      const produto = searchParams.get("produto");

      const params = new URLSearchParams();
      if (redirect) params.set("redirect", redirect);
      if (produto) params.set("produto", produto);

      const query = params.toString();
      router.push(query ? `/login?${query}` : "/login");
    } catch (err) {
      const mensagem = (err as { message?: string })?.message;
      setErro(mensagem || "Não foi possível criar sua conta. Verifique os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Identidade / Logo */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-red-500/20 mb-2">
            🍕
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Crie sua conta
          </h1>
          <p className="text-xs text-neutral-500">
            Cadastre-se para pedir suas pizzas favoritas e salvar seus endereços
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="flex items-center gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 animate-in fade-in duration-150">
                <FiAlertTriangle className="shrink-0 text-red-600" size={16} />
                <span className="font-semibold leading-tight">{erro}</span>
              </div>
            )}

            {/* Campo Nome */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                  required
                />
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
              </div>
            </div>

            {/* Campo E-mail */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                  required
                />
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
              </div>
            </div>

            {/* Campo Telefone */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Telefone / WhatsApp *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400 font-mono"
                  required
                />
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Senha de Acesso (Mín. 6 caracteres) *
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400 font-mono"
                  required
                />
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarSenha ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  placeholder="Repita sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none transition-all placeholder-neutral-400 font-mono ${
                    senhasIguais
                      ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      : senhasDiferentes
                      ? "border-red-400 focus:ring-2 focus:ring-red-500/10"
                      : "border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  }`}
                  required
                />
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  title={mostrarConfirmar ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarConfirmar ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

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

            {/* Botão de Criar Conta */}
            <button
              type="submit"
              disabled={carregando || !nome.trim() || !email.trim() || senha.length < 6 || !senhasIguais}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group active:scale-98 mt-2"
            >
              <span>{carregando ? "Criando sua conta..." : "Finalizar Cadastro"}</span>
              {!carregando && (
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              Já tem uma conta cadastrada?{" "}
              <Link
                href="/login"
                className="text-red-600 font-bold hover:underline"
              >
                Entrar agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-neutral-400 font-semibold">
          Carregando formulário de cadastro...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}