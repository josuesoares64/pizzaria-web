"use client";

import { useEffect, useState, useCallback } from "react";
import { categoriaService } from "@/server/categoria.service";
import { produtoService } from "@/server/produto.service";
import { Categoria } from "@/types/categoria";
import { Produto } from "@/types/produto";

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

export default function CardapioFuncionarioPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [cats, prods] = await Promise.all([
        categoriaService.listar(),
        produtoService.listar(),
      ]);
      setCategorias(cats);
      setProdutos(prods);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar o cardápio.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleToggleCategoria(categoria: Categoria) {
    const anterior = categorias;
    setCategorias((prev) =>
      prev.map((c) => (c.id === categoria.id ? { ...c, ativo: !c.ativo } : c))
    );
    try {
      await categoriaService.atualizarStatus(categoria.id, !categoria.ativo);
    } catch {
      setCategorias(anterior);
      setErro("Não foi possível atualizar o status da categoria.");
    }
  }

  async function handleToggleDisponivel(produto: Produto) {
    const anterior = produtos;
    setProdutos((prev) =>
      prev.map((p) => (p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p))
    );
    try {
      await produtoService.atualizarStatus(produto.id, !produto.disponivel);
    } catch {
      setProdutos(anterior);
      setErro("Não foi possível atualizar a disponibilidade do produto.");
    }
  }

  if (carregando) return <p className="text-sm text-neutral-500">Carregando cardápio...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-800 mb-5">Cardápio</h1>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {categorias.map((categoria) => {
          const produtosDaCategoria = produtos.filter((p) => p.categoria_id === categoria.id);
          const aberta = expandida === categoria.id;

          return (
            <div key={categoria.id} className="border border-neutral-200 rounded-lg bg-white">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpandida(aberta ? null : categoria.id)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${aberta ? "rotate-90" : ""} transition-transform`}>▸</span>
                  <span className="text-sm font-medium text-neutral-800">{categoria.nome}</span>
                  <span className="text-xs text-neutral-400">({produtosDaCategoria.length})</span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-neutral-500">Ativa</span>
                  <Toggle checked={categoria.ativo} onChange={() => handleToggleCategoria(categoria)} />
                </div>
              </div>

              {aberta && (
                <div className="border-t border-neutral-100 px-4 py-3">
                  {produtosDaCategoria.length === 0 && (
                    <p className="text-xs text-neutral-400">Nenhum produto nessa categoria ainda.</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {produtosDaCategoria.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2"
                      >
                        <div>
                          <span className="font-medium text-neutral-800">{produto.nome}</span>
                          <span className="text-xs text-neutral-400 ml-2">
                            {produto.tipo === "pizza" ? "Pizza" : "Simples"}
                          </span>
                          {produto.tipo === "simples" && produto.preco && (
                            <span className="text-xs text-neutral-500 ml-2">
                              R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Disponível</span>
                          <Toggle
                            checked={produto.disponivel}
                            onChange={() => handleToggleDisponivel(produto)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}