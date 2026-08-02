"use client";

import { useEffect, useState, useCallback } from "react";
import { authService } from "@/server/auth.service";
import { Funcionario } from "@/types/auth";

function ModalShell({
  titulo,
  onFechar,
  children,
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-800">{titulo}</h2>
          <button onClick={onFechar} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function NovoFuncionarioModal({
  onCriado,
  onFechar,
}: {
  onCriado: (funcionario: Funcionario) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim() || !email.trim() || senha.length < 6 || !telefone.trim()) {
      setErro("Preencha nome, e-mail, telefone e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const novo = await authService.registerFuncionario({ nome, email, senha, telefone });
      onCriado(novo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível cadastrar o funcionário.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell titulo="Novo funcionário" onFechar={onFechar}>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="Telefone"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Senha (mín. 6 caracteres)"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <p className="text-xs text-neutral-400">
        Passe essa senha pro funcionário — ele usa o e-mail e essa senha pra entrar em{" "}
        <span className="font-medium text-neutral-500">/login</span>.
      </p>
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleSalvar}
          disabled={enviando}
          className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          Salvar
        </button>
        <button onClick={onFechar} className="text-xs text-neutral-500">
          Cancelar
        </button>
      </div>
    </ModalShell>
  );
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await authService.listarFuncionarios();
      setFuncionarios(dados);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os funcionários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) return <p className="text-sm text-neutral-500">Carregando funcionários...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-neutral-800">Funcionários</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700"
        >
          + Funcionário
        </button>
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}

      {funcionarios.length === 0 && (
        <p className="text-sm text-neutral-400">Nenhum funcionário cadastrado ainda.</p>
      )}

      <div className="flex flex-col gap-2">
        {funcionarios.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between text-sm border border-neutral-200 rounded-lg px-4 py-3 bg-white"
          >
            <div>
              <p className="font-medium text-neutral-800">{f.nome}</p>
              <p className="text-xs text-neutral-400">{f.email} · {f.telefone}</p>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <NovoFuncionarioModal
          onCriado={(novo) => {
            setFuncionarios((prev) => [...prev, novo]);
            setModalAberto(false);
          }}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}