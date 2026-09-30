"use client";

import { useEffect, useState, useCallback } from "react";
import { tamanhoService } from "@/server/tamanho.service";
import { bordaService } from "@/server/borda.service";
import { Tamanho } from "@/types/tamanho";
import { Borda } from "@/types/borda";
import { FiAlertTriangle, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        checked ? "bg-red-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export default function TamanhosBordasFuncionarioPage() {
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);

    try {
      const [tams, bors] = await Promise.all([
        tamanhoService.listar(),
        bordaService.listar(),
      ]);
      setTamanhos(tams);
      setBordas(bors);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os tamanhos e bordas cadastrados.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleToggleBorda(borda: Borda) {
    const anterior = bordas;
    setBordas((prev) =>
      prev.map((b) => (b.id === borda.id ? { ...b, ativo: !b.ativo } : b))
    );
    try {
      await bordaService.atualizarStatus(borda.id, !borda.ativo);
    } catch {
      setBordas(anterior);
      setErro("Não foi possível atualizar o status da borda recheada.");
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Carregando tamanhos e bordas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Topo da Página */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧀</span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Tamanhos & Bordas (Operação)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visualize os tamanhos oficiais e pause bordas caso os recheios se esgotem no expediente
          </p>
        </div>

        <button
          type="button"
          onClick={() => carregar(true)}
          disabled={atualizando}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 px-3 py-2 rounded-xl shadow-2xs hover:bg-neutral-50 transition-colors disabled:opacity-50"
          title="Recarregar"
        >
          <FiRefreshCw className={atualizando ? "animate-spin text-red-600" : ""} size={13} />
          <span>Atualizar</span>
        </button>
      </header>

      {/* Alerta de Erro */}
      {erro && (
        <div className="flex items-center justify-between gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="shrink-0 text-red-600" size={16} />
            <span className="font-semibold">{erro}</span>
          </div>
          <button
            onClick={() => setErro(null)}
            className="text-xs font-bold underline ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* SEÇÃO 1: TAMANHOS DE PIZZA (Somente Leitura para Funcionário) */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-sm">📏</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Tamanhos Cadastrados na Loja
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {tamanhos.length} {tamanhos.length === 1 ? "tamanho" : "tamanhos"}
          </span>
        </div>

        {tamanhos.length === 0 ? (
          <p className="text-xs text-neutral-400 py-3 text-center italic">
            Nenhum tamanho cadastrado pelo proprietário.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tamanhos.map((tamanho) => (
              <div
                key={tamanho.id}
                className="bg-neutral-50 border border-neutral-200/70 rounded-xl p-3 flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-neutral-400 shrink-0" size={15} />
                  <span className="text-xs sm:text-sm font-bold text-neutral-800">
                    {tamanho.nome}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-white border border-neutral-200 px-2 py-0.5 rounded-md font-mono">
                  Ativo
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEÇÃO 2: BORDAS RECHEADAS (Com Toggle de Disponibilidade) */}
      <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Controle de Bordas Recheadas
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {bordas.length} {bordas.length === 1 ? "borda" : "bordas"}
          </span>
        </div>

        {bordas.length === 0 ? (
          <p className="text-xs text-neutral-400 py-3 text-center italic">
            Nenhuma borda cadastrada no sistema.
          </p>
        ) : (
          <div className="space-y-2">
            {bordas.map((borda) => {
              const ativa = borda.ativo;

              return (
                <div
                  key={borda.id}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    ativa
                      ? "bg-white border-neutral-200/80 shadow-2xs"
                      : "bg-neutral-100/70 border-neutral-200/50 opacity-70"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          ativa ? "text-neutral-900" : "text-neutral-500 line-through"
                        }`}
                      >
                        {borda.nome}
                      </span>
                      {!ativa && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                          Esgotado / Pausado
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-neutral-700 mt-0.5">
                      +{formatarMoeda(borda.preco)}
                    </p>
                  </div>

                  {/* Toggle Operacional */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-semibold hidden sm:inline ${
                        ativa ? "text-emerald-700" : "text-neutral-400"
                      }`}
                    >
                      {ativa ? "Disponível" : "Pausada"}
                    </span>
                    <Toggle
                      checked={ativa}
                      onChange={() => handleToggleBorda(borda)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}