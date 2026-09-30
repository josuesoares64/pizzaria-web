"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "@/server/auth.service";
import { decodeToken } from "@/lib/jwt";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import { FiEye, FiEyeOff, FiAlertTriangle, FiArrowRight, FiLock, FiMail } from "react-icons/fi";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const { accessToken } = await authService.login({
        email: email.trim().toLowerCase(),
        senha,
      });

      Cookies.set("token", accessToken, { expires: 7 });

      const usuario = decodeToken(accessToken);
      if (!usuario) {
        setErro("Erro ao processar autenticação. Tente novamente.");
        return;
      }

      dispatch(login(usuario));

      if (usuario.role === "dono" || usuario.role === "funcionario") {
        router.push(`/dashboard/${usuario.role}`);
        return;
      }

      const redirect = searchParams.get("redirect");
      const produto = searchParams.get("produto");

      if (redirect) {
        router.push(produto ? `${redirect}?produto=${produto}` : redirect);
      } else {
        router.push("/");
      }
    } catch {
      setErro("E-mail ou senha incorretos. Confira os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Identidade / Logo */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-red-500/20 mb-2">
            🍕
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-xs text-neutral-500">
            Acesse sua conta para continuar seus pedidos ou gerenciar sua loja
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

            {/* Campo E-mail */}
            <div>
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                E-mail
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

            {/* Campo Senha */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Senha
                </label>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha secreta"
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

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={carregando || !email.trim() || !senha}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group active:scale-98 mt-2"
            >
              <span>{carregando ? "Entrando..." : "Acessar Conta"}</span>
              {!carregando && (
                <FiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>
          </form>

          {/* Criação de Conta Cliente */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-600">
              Ainda não tem conta de cliente?{" "}
              <Link
                href="/register"
                className="text-red-600 font-bold hover:underline"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Rodapé B2B / Donos de Pizzarias */}
        <div className="text-center pt-2">
          <p className="text-xs text-neutral-400">
            É proprietário de uma pizzaria?{" "}
            <Link
              href="/register-owner"
              className="text-neutral-700 font-bold hover:underline"
            >
              Cadastre sua pizzaria aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-neutral-400 font-semibold">
          Carregando tela de login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}