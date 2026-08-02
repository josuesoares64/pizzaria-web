"use client";

import { Suspense, useState } from "react";
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
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 flex flex-col gap-4"
    >
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
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}