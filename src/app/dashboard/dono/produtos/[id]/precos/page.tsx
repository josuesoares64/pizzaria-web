"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { produtoService } from "@/server/produto.service";
import { tamanhoService } from "@/server/tamanho.service";
import { produtoPrecoService } from "@/server/produtoPreco.service";
import { Produto } from "@/types/produto";
import { Tamanho } from "@/types/tamanho";
import { ProdutoPreco } from "@/types/produtoPreco";
import {
  FiArrowLeft,
  FiCheck,
  FiAlertTriangle,
  FiLoader,
  FiSave,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";

interface LinhaTamanho {
  tamanho: Tamanho;
  vinculado: boolean;
  produtoPrecoId: string | null;
  preco: string; // valor em edição no input
}

export default function PrecosProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [linhas, setLinhas] = useState<LinhaTamanho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoTamanhoId, setProcessandoTamanhoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const montarLinhas = useCallback((tamanhos: Tamanho[], precos: ProdutoPreco[]): LinhaTamanho[] => {
    return tamanhos
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((tamanho) => {
        const vinculo = precos.find((p) => p.tamanho.id === tamanho.id);
        return {
          tamanho,
          vinculado: !!vinculo,
          produtoPrecoId: vinculo?.id ?? null,
          preco: vinculo?.preco != null ? String(vinculo.preco) : "",
        };
      });
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [produtos, tamanhos] = await Promise.all([
        produtoService.listar(),
        tamanhoService.listar(),
      ]);
      const encontrado = produtos.find((p) => p.id === id) ?? null;
      setProduto(encontrado);

      if (encontrado) {
        const precos = await produtoPrecoService.listar(encontrado.id);
        setLinhas(montarLinhas(tamanhos, precos));
      }
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os dados de preços da pizza.");
    } finally {
      setCarregando(false);
    }
  }, [id, montarLinhas]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleToggleTamanho(linha: LinhaTamanho) {
    if (!produto) return;
    setErro(null);
    setSucesso(null);
    setProcessandoTamanhoId(linha.tamanho.id);

    try {
      if (!linha.vinculado) {
        await produtoPrecoService.vincularTamanhos(produto.id, [linha.tamanho.id]);
        setLinhas((prev) =>
          prev.map((l) =>
            l.tamanho.id === linha.tamanho.id ? { ...l, vinculado: true } : l
          )
        );
      } else {
        await produtoPrecoService.desvincularTamanho(produto.id, linha.tamanho.id);
        setLinhas((prev) =>
          prev.map((l) =>
            l.tamanho.id === linha.tamanho.id
              ? { ...l, vinculado: false, produtoPrecoId: null, preco: "" }
              : l
          )
        );
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível atualizar o vínculo do tamanho.");
    } finally {
      setProcessandoTamanhoId(null);
    }
  }

  function handlePrecoChange(tamanhoId: string, valor: string) {
    // Permite trocar vírgula por ponto para não quebrar no envio
    setLinhas((prev) =>
      prev.map((l) => (l.tamanho.id === tamanhoId ? { ...l, preco: valor.replace(",", ".") } : l))
    );
  }

  async function handleSalvarPrecos() {
    if (!produto) return;
    setErro(null);
    setSucesso(null);

    const precosParaSalvar = linhas
      .filter((l) => l.vinculado && l.preco.trim() !== "")
      .map((l) => ({ tamanho_id: l.tamanho.id, preco: Number(l.preco) }));

    if (precosParaSalvar.length === 0) {
      setErro("Habilite ao menos um tamanho e informe o preço correspondente antes de salvar.");
      return;
    }

    setSalvando(true);
    try {
      await produtoPrecoService.atualizarPrecos(produto.id, precosParaSalvar);
      setSucesso("Tabela de preços salva com sucesso!");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar os preços.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Carregando tabela de preços...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <FiAlertTriangle size={24} />
        </div>
        <p className="text-sm font-bold text-neutral-800">Produto não encontrado.</p>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
        >
          <FiArrowLeft /> Voltar ao cardápio
        </button>
      </div>
    );
  }

  if (produto.tipo !== "pizza") {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <FiInfo size={24} />
        </div>
        <p className="text-sm font-bold text-neutral-800">
          Preços por tamanho só se aplicam a produtos do tipo pizza.
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
        >
          <FiArrowLeft /> Voltar ao cardápio
        </button>
      </div>
    );
  }

  const temTamanhoVinculado = linhas.some((l) => l.vinculado);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Botão Voltar & Cabeçalho */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 inline-flex items-center gap-1 mb-2 transition-colors"
        >
          <FiArrowLeft /> Voltar ao cardápio
        </button>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🍕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-neutral-900 tracking-tight">
                {produto.nome}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                Pizza
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Habilite os tamanhos disponíveis para esta pizza e defina o valor de cada um
            </p>
          </div>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {erro && (
        <div className="flex items-center gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-2xs animate-in fade-in duration-150">
          <FiAlertTriangle className="shrink-0 text-red-600" size={16} />
          <span className="font-semibold leading-tight">{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 shadow-2xs animate-in fade-in duration-150">
          <FiCheck className="shrink-0 text-emerald-600" size={16} />
          <span className="font-semibold leading-tight">{sucesso}</span>
        </div>
      )}

      {/* Caso não haja nenhum tamanho cadastrado no sistema */}
      {linhas.length === 0 && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 text-center shadow-2xs space-y-2">
          <p className="text-xs text-neutral-500">
            Nenhum tamanho cadastrado ainda na pizzaria.
          </p>
          <p className="text-[11px] text-neutral-400">
            Acesse a aba <strong>&quot;Tamanhos e bordas&quot;</strong> primeiro para cadastrar (ex: Pequena, Média, Grande).
          </p>
        </div>
      )}

      {/* Lista de Tamanhos e Preços */}
      <div className="space-y-3">
        {linhas.map((linha) => {
          const isProcessando = processandoTamanhoId === linha.tamanho.id;

          return (
            <div
              key={linha.tamanho.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                linha.vinculado
                  ? "bg-white border-red-300/80 shadow-2xs"
                  : "bg-neutral-50/70 border-neutral-200/80 opacity-75"
              }`}
            >
              {/* Checkbox & Nome do Tamanho */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linha.vinculado}
                  onChange={() => handleToggleTamanho(linha)}
                  disabled={isProcessando}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300 cursor-pointer disabled:opacity-50"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 block leading-tight">
                    {linha.tamanho.nome}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {linha.vinculado ? "Disponível para venda" : "Desmarcado (Não vende este tamanho)"}
                  </span>
                </div>
                {isProcessando && (
                  <FiLoader className="animate-spin text-neutral-400 text-xs ml-1" />
                )}
              </label>

              {/* Input de Preço (visível quando vinculado) */}
              {linha.vinculado && (
                <div className="flex items-center gap-2 self-end sm:self-auto animate-in fade-in duration-150">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold font-mono">
                      R$
                    </span>
                    <input
                      value={linha.preco}
                      onChange={(e) => handlePrecoChange(linha.tamanho.id, e.target.value)}
                      placeholder="0.00"
                      type="text"
                      inputMode="decimal"
                      className="w-32 bg-white border border-neutral-300 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all text-right"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão de Salvar Preços */}
      {temTamanhoVinculado && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSalvarPrecos}
            disabled={salvando}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {salvando ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Salvando preços...</span>
              </>
            ) : (
              <>
                <FiSave size={16} />
                <span>Salvar Tabela de Preços</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}