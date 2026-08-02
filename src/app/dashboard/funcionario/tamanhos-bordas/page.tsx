"use client";

import { useEffect, useState, useCallback } from "react";
import { tamanhoService } from "@/server/tamanho.service";
import { bordaService } from "@/server/borda.service";
import { Tamanho } from "@/types/tamanho";
import { Borda } from "@/types/borda";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-red-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
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
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [tams, bors] = await Promise.all([tamanhoService.listar(), bordaService.listar()]);
      setTamanhos(tams);
      setBordas(bors);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar tamanhos e bordas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleToggleBorda(borda: Borda) {
    const anterior = bordas;
    setBordas((prev) => prev.map((b) => (b.id === borda.id ? { ...b, ativo: !b.ativo } : b)));
    try {
      await bordaService.atualizarStatus(borda.id, !borda.ativo);
    } catch {
      setBordas(anterior);
      setErro("Não foi possível atualizar o status da borda.");
    }
  }

  if (carregando) return <p className="text-sm text-neutral-500">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-800 mb-5">Tamanhos e bordas</h1>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Tamanhos</h2>
        <div className="flex flex-col gap-2">
          {tamanhos.map((tamanho) => (
            <div
              key={tamanho.id}
              className="text-sm border border-neutral-100 rounded-md px-3 py-2 bg-white font-medium text-neutral-800"
            >
              {tamanho.nome}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Bordas</h2>
        <div className="flex flex-col gap-2">
          {bordas.map((borda) => (
            <div
              key={borda.id}
              className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2 bg-white"
            >
              <div>
                <span className="font-medium text-neutral-800">{borda.nome}</span>
                <span className="text-xs text-neutral-500 ml-2">
                  R$ {Number(borda.preco).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Ativa</span>
                <Toggle checked={borda.ativo} onChange={() => handleToggleBorda(borda)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}