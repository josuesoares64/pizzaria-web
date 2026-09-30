"use client";

import { useEffect, useState, useCallback } from "react";
import { authService } from "@/server/auth.service";
import { Funcionario } from "@/types/auth";

// Extrai as iniciais do nome para o Avatar (ex: "Carlos Silva" -> "CS")
function obterIniciais(nome: string): string {
  const partes = nome.trim().split(" ");
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function ModalShell({
  titulo,
  subtitulo,
  onFechar,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFechar]);

  return (
    <div
      onClick={onFechar}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-200"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-[11px] text-neutral-400 mt-0.5">{subtitulo}</p>
            )}
          </div>
          <button
            onClick={onFechar}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors text-sm"
          >
            ×
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3.5">{children}</div>
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim() || !email.trim() || senha.length < 6 || !telefone.trim()) {
      setErro("Preencha nome, e-mail, telefone e uma senha com no mínimo 6 caracteres.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const novo = await authService.registerFuncionario({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.trim(),
      });
      onCriado(novo);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível cadastrar o funcionário.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell
      titulo="Novo Colaborador"
      subtitulo="Cadastre quem terá acesso ao painel de pedidos e cozinha"
      onFechar={onFechar}
    >
      {erro && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
          {erro}
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Nome Completo *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Carlos Eduardo Silva"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            E-mail de Acesso *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@pizzaria.com"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Telefone / WhatsApp *
          </label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Senha de Acesso *
        </label>
        <div className="relative">
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full border border-neutral-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-600"
          >
            {mostrarSenha ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
        💡 <strong>Oriente o colaborador:</strong> Ele deve acessar a tela de login utilizando este e-mail e a senha cadastrada para entrar na operação.
      </div>

      <div className="flex justify-end gap-2.5 mt-2 pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={onFechar}
          className="text-xs font-semibold text-neutral-600 hover:bg-neutral-100 px-3.5 py-2 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={enviando || !nome.trim() || !email.trim() || senha.length < 6}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          {enviando ? "Salvando..." : "Cadastrar Colaborador"}
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
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

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

  async function handleExcluir(funcionario: Funcionario) {
    const confirmado = window.confirm(
      `Deseja realmente revogar o acesso e remover "${funcionario.nome}" da equipe?`,
    );
    if (!confirmado) return;

    const anterior = funcionarios;
    setExcluindoId(funcionario.id);
    setFuncionarios((prev) => prev.filter((f) => f.id !== funcionario.id));

    try {
      if ("excluirFuncionario" in authService && typeof authService.excluirFuncionario === "function") {
        await authService.excluirFuncionario(funcionario.id);
      }
    } catch {
      setFuncionarios(anterior);
      setErro("Não foi possível excluir o funcionário.");
    } finally {
      setExcluindoId(null);
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Carregando equipe...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Topo com Título e Estatísticas */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Equipe & Funcionários
            </h1>
            <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {funcionarios.length} {funcionarios.length === 1 ? "membro" : "membros"}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pessoas autorizadas a operar o painel de pedidos e cozinha
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <span>+</span>
          <span>Novo Funcionário</span>
        </button>
      </header>

      {erro && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span>{erro}</span>
          <button onClick={() => setErro(null)} className="underline font-semibold ml-2">
            Fechar
          </button>
        </div>
      )}

      {/* Lista de Colaboradores */}
      <div className="flex flex-col gap-3">
        {funcionarios.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
            <span className="text-3xl block mb-2 opacity-50">👨‍🍳</span>
            <p className="text-sm font-semibold text-neutral-700">
              Nenhum colaborador cadastrado
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Cadastre atendentes, garçons ou pizzaiolos para que eles acessem o painel com login próprio.
            </p>
            <button
              onClick={() => setModalAberto(true)}
              className="mt-4 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              + Adicionar primeiro colaborador
            </button>
          </div>
        ) : (
          funcionarios.map((f) => {
            const apenasDigitos = f.telefone.replace(/\D/g, "");
            const telWhatsapp =
              apenasDigitos.length === 10 || apenasDigitos.length === 11
                ? `55${apenasDigitos}`
                : apenasDigitos;

            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 bg-white border border-neutral-200/90 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Avatar e Informações */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs tracking-wider">
                    {obterIniciais(f.nome)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-neutral-900 leading-tight truncate">
                        {f.nome}
                      </p>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                        Ativo
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                      <span className="text-neutral-600 truncate">{f.email}</span>
                      <span className="text-neutral-300">•</span>
                      {f.telefone ? (
                        <a
                          href={`https://wa.me/${telWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Falar no WhatsApp"
                          className="hover:text-emerald-700 inline-flex items-center gap-1 group font-medium"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] group-hover:scale-110 transition-transform">
                            ✓
                          </span>
                          <span>{f.telefone}</span>
                        </a>
                      ) : (
                        <span>Sem telefone</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExcluir(f)}
                    disabled={excluindoId === f.id}
                    className="text-xs font-semibold text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                    title="Remover acesso"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
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