"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { produtoService } from "@/server/produto.service";
import { tamanhoService } from "@/server/tamanho.service";
import { produtoPrecoService } from "@/server/produtoPreco.service";
import { Produto } from "@/types/produto";
import { Tamanho } from "@/types/tamanho";
import { ProdutoPreco } from "@/types/produtoPreco";

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
      setErro("Não foi possível carregar os dados de preços.");
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
    setLinhas((prev) =>
      prev.map((l) => (l.tamanho.id === tamanhoId ? { ...l, preco: valor } : l))
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
      setErro("Marque ao menos um tamanho e informe o preço antes de salvar.");
      return;
    }

    setSalvando(true);
    try {
      await produtoPrecoService.atualizarPrecos(produto.id, precosParaSalvar);
      setSucesso("Preços salvos com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar os preços.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p className="text-sm text-neutral-500">Carregando...</p>;

  if (!produto) {
    return (
      <div className="max-w-xl">
        <p className="text-sm text-red-600">Produto não encontrado.</p>
        <button onClick={() => router.back()} className="text-xs text-neutral-500 mt-2">
          ← Voltar
        </button>
      </div>
    );
  }

  if (produto.tipo !== "pizza") {
    return (
      <div className="max-w-xl">
        <p className="text-sm text-neutral-600">
          Preços por tamanho só se aplicam a produtos do tipo pizza.
        </p>
        <button onClick={() => router.back()} className="text-xs text-neutral-500 mt-2">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <button onClick={() => router.back()} className="text-xs text-neutral-500 mb-3">
        ← Voltar ao cardápio
      </button>

      <h1 className="text-xl font-semibold text-neutral-800 mb-1">{produto.nome}</h1>
      <p className="text-sm text-neutral-500 mb-5">Defina os tamanhos e preços dessa pizza.</p>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2 mb-4">
          {sucesso}
        </p>
      )}

      {linhas.length === 0 && (
        <p className="text-sm text-neutral-400">
          Nenhum tamanho cadastrado ainda. Cadastre tamanhos em &quot;Tamanhos e bordas&quot; primeiro.
        </p>
      )}

      <div className="flex flex-col gap-2 mb-6">
        {linhas.map((linha) => (
          <div
            key={linha.tamanho.id}
            className="flex items-center justify-between border border-neutral-200 rounded-md px-3 py-2"
          >
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={linha.vinculado}
                onChange={() => handleToggleTamanho(linha)}
                disabled={processandoTamanhoId === linha.tamanho.id}
              />
              {linha.tamanho.nome}
            </label>

            {linha.vinculado && (
              <input
                value={linha.preco}
                onChange={(e) => handlePrecoChange(linha.tamanho.id, e.target.value)}
                placeholder="Preço (ex: 45.90)"
                type="number"
                step="0.01"
                className="border border-neutral-200 rounded-md px-2 py-1 text-sm w-36"
              />
            )}
          </div>
        ))}
      </div>

      {linhas.some((l) => l.vinculado) && (
        <button
          onClick={handleSalvarPrecos}
          disabled={salvando}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar preços"}
        </button>
      )}
    </div>
  );
}