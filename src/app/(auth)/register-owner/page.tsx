"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FiMapPin,
  FiGlobe,
} from "react-icons/fi";

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

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const senhasIguais = confirmarSenha.length > 0 && senha === confirmarSenha;
  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha;

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

    if (senha.length < 6) {
      setErro("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    if (!slug.trim()) {
      setErro("Informe o link curto (slug) da sua pizzaria.");
      return;
    }

    setEnviando(true);
    try {
      await authService.registerOwner({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.trim(),
        nomePizzaria: nomePizzaria.trim(),
        slug: slug.trim(),
        endereco: endereco.trim(),
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

  // Tela de Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-3xl p-8 text-center shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border border-emerald-200">
            🎉
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-900">
              Pizzaria Cadastrada com Sucesso!
            </h1>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Sua conta de administrador foi criada. Redirecionando para o login...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Identidade / Cabeçalho */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-red-500/20 mb-2">
            🍕
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Cadastre sua Pizzaria
          </h1>
          <p className="text-xs text-neutral-500">
            Crie seu cardápio digital, receba pedidos em tempo real e imprima cupons
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && (
              <div className="flex items-center gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 animate-in fade-in duration-150">
                <FiAlertTriangle className="shrink-0 text-red-600" size={16} />
                <span className="font-semibold leading-tight">{erro}</span>
              </div>
            )}

            {/* SEÇÃO 1: SEUS DADOS DE ACESSO */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="text-sm">👤</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  1. Dados do Administrador
                </h2>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                  />
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    E-mail de Login *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <input
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400 font-mono"
                    />
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={mostrarSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full border border-neutral-300 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400 font-mono"
                    />
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                      title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                    >
                      {mostrarSenha ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={mostrarConfirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita sua senha"
                      className={`w-full border rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none transition-all placeholder-neutral-400 font-mono ${
                        senhasIguais
                          ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                          : senhasDiferentes
                          ? "border-red-400 focus:ring-2 focus:ring-red-500/10"
                          : "border-neutral-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      }`}
                    />
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                      title={mostrarConfirmar ? "Ocultar senha" : "Ver senha"}
                    >
                      {mostrarConfirmar ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {senhasIguais && (
                <p className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <FiCheck /> As senhas coincidem!
                </p>
              )}
              {senhasDiferentes && (
                <p className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                  <FiX /> As senhas não coincidem.
                </p>
              )}
            </div>

            {/* SEÇÃO 2: DADOS DA PIZZARIA */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="text-sm">🏪</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  2. Dados do Estabelecimento
                </h2>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Nome da Pizzaria *
                </label>
                <input
                  required
                  value={nomePizzaria}
                  onChange={(e) => handleNomePizzariaChange(e.target.value)}
                  placeholder="Ex: Bella Pizza Napolitana"
                  className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Link do seu Cardápio Digital (Slug) *
                </label>
                <div className="flex rounded-xl border border-neutral-300 overflow-hidden focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 bg-neutral-50">
                  <span className="flex items-center gap-1 px-3 text-xs font-mono text-neutral-500 border-r border-neutral-200 select-none bg-neutral-100">
                    <FiGlobe size={13} />
                    <span>app.com/</span>
                  </span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="bella-pizza"
                    className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none bg-white text-neutral-900"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Este será o endereço público onde seus clientes farão os pedidos.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Endereço da Pizzaria (Loja Física) *
                </label>
                <div className="relative">
                  <input
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Número, Bairro e Cidade"
                    className="w-full border border-neutral-300 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all placeholder-neutral-400"
                  />
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Botão de Submeter */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={enviando || !nome.trim() || !email.trim() || !nomePizzaria.trim() || senha.length < 6 || !senhasIguais}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>{enviando ? "Cadastrando sua pizzaria..." : "Criar Minha Pizzaria"}</span>
                {!enviando && (
                  <FiArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
          </form>

          {/* Link para Login */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              Já possui uma pizzaria cadastrada?{" "}
              <Link
                href="/login"
                className="text-red-600 font-bold hover:underline"
              >
                Entrar no painel
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}