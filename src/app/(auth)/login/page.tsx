"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "@/server/auth.service";
import { decodeToken } from "@/lib/jwt";
import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
      const { accessToken } = await authService.login({ email, senha });

      Cookies.set("token", accessToken, { expires: 7 });

      const usuario = decodeToken(accessToken);
      if (!usuario) {
        setErro("Erro ao processar autenticação.");
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
      setErro("Email ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Entrar</h1>

        {erro && <p className="text-red-600 text-sm">{erro}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={carregando}
          className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Não tem conta?{" "}
        <Link href="/register" className="text-red-600 font-medium hover:underline">
          Criar conta
        </Link>
      </p>

      <div className="mt-6 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          Tem um negócio?{" "}
          <Link href="/register-owner" className="text-gray-700 font-medium hover:underline">
            Cadastre sua pizzaria aqui
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}