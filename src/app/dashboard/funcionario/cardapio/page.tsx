"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { categoriaService } from "@/server/categoria.service";
import { produtoService } from "@/server/produto.service";
import { Categoria } from "@/types/categoria";
import { Produto } from "@/types/produto";
import {
  FiChevronDown,
  FiSearch,
  FiX,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

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

export default function CardapioFuncionarioPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);

    try {
      const [cats, prods] = await Promise.all([
        categoriaService.listar(),
        produtoService.listar(),
      ]);
      setCategorias(cats);
      setProdutos(prods);
      // Auto-expande a primeira categoria por conveniência
      if (cats.length > 0 && !isRefresh) {
        setExpandida(cats[0].id);
      }
      setErro(null);
    } catch {
      setErro("Não foi possível carregar o cardápio da pizzaria.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
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
      prev.map((p) =>
        p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p
      )
    );
    try {
      await produtoService.atualizarStatus(produto.id, !produto.disponivel);
    } catch {
      setProdutos(anterior);
      setErro("Não foi possível atualizar a disponibilidade do produto.");
    }
  }

  // Filtro inteligente de produtos e categorias
  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    const termo = busca.toLowerCase().trim();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo)
    );
  }, [produtos, busca]);

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Carregando cardápio operacional...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Topo com Título e Ação de Atualizar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Controle de Cardápio (Operação)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pause ou ative produtos e categorias de acordo com o estoque da cozinha
          </p>
        </div>

        <button
          type="button"
          onClick={() => carregar(true)}
          disabled={atualizando}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 px-3 py-2 rounded-xl shadow-2xs hover:bg-neutral-50 transition-colors disabled:opacity-50"
          title="Recarregar cardápio"
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

      {/* Barra de Busca de Produtos Rápida */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto para pausar ou ativar..."
          className="w-full bg-white border border-neutral-300 focus:border-red-500 rounded-xl pl-9 pr-9 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all shadow-2xs"
        />
        <FiSearch
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
            title="Limpar busca"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* Listagem das Categorias */}
      <div className="space-y-3">
        {categorias.map((categoria) => {
          const produtosDaCategoria = produtosFiltrados.filter(
            (p) => p.categoria_id === categoria.id
          );

          // Se estiver buscando e a categoria não tem produtos correspondentes, oculta
          if (busca.trim() && produtosDaCategoria.length === 0) return null;

          const aberta = expandida === categoria.id || busca.trim().length > 0;

          return (
            <div
              key={categoria.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all ${
                !categoria.ativo
                  ? "border-neutral-200/60 bg-neutral-50/50 opacity-75"
                  : "border-neutral-200/90"
              }`}
            >
              {/* Topo da Categoria */}
              <div
                className="flex items-center justify-between px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-neutral-50/70 transition-colors select-none"
                onClick={() => setExpandida(aberta ? null : categoria.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-neutral-400 transition-transform duration-200 ${
                      aberta ? "rotate-180 text-neutral-700 bg-neutral-100" : ""
                    }`}
                  >
                    <FiChevronDown size={15} />
                  </div>
                  <span
                    className={`text-sm font-bold truncate ${
                      categoria.ativo ? "text-neutral-900" : "text-neutral-500 line-through"
                    }`}
                  >
                    {categoria.nome}
                  </span>
                  <span className="text-xs font-mono font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.2 rounded-full">
                    {produtosDaCategoria.length}
                  </span>
                </div>

                {/* Status da Categoria Inteira */}
                <div
                  className="flex items-center gap-2.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] font-semibold text-neutral-500 hidden sm:inline">
                    {categoria.ativo ? "Categoria Ativa" : "Pausada"}
                  </span>
                  <Toggle
                    checked={categoria.ativo}
                    onChange={() => handleToggleCategoria(categoria)}
                  />
                </div>
              </div>

              {/* Produtos da Categoria */}
              {aberta && (
                <div className="border-t border-neutral-100 p-3 sm:p-4 bg-neutral-50/40 space-y-2">
                  {produtosDaCategoria.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-3 text-center italic">
                      Nenhum produto cadastrado nesta categoria.
                    </p>
                  ) : (
                    produtosDaCategoria.map((produto) => {
                      const disponivel = produto.disponivel;

                      return (
                        <div
                          key={produto.id}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                            disponivel
                              ? "bg-white border-neutral-200/80 shadow-2xs"
                              : "bg-neutral-100/70 border-neutral-200/50 opacity-70"
                          }`}
                        >
                          {/* Info do Produto */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-bold truncate ${
                                  disponivel
                                    ? "text-neutral-900"
                                    : "text-neutral-500 line-through"
                                }`}
                              >
                                {produto.nome}
                              </span>

                              <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded">
                                {produto.tipo === "pizza" ? "Pizza" : "Simples"}
                              </span>

                              {!disponivel && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                                  Esgotado / Pausado
                                </span>
                              )}
                            </div>

                            {produto.tipo === "simples" && produto.preco && (
                              <p className="text-xs font-mono font-bold text-neutral-700 mt-1">
                                {formatarMoeda(produto.preco)}
                              </p>
                            )}

                            {produto.descricao && (
                              <p className="text-[11px] text-neutral-400 truncate mt-0.5 max-w-md">
                                {produto.descricao}
                              </p>
                            )}
                          </div>

                          {/* Toggle de Disponibilidade */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-semibold hidden sm:inline ${
                                disponivel ? "text-emerald-700" : "text-neutral-400"
                              }`}
                            >
                              {disponivel ? "Disponível" : "Pausado"}
                            </span>
                            <Toggle
                              checked={disponivel}
                              onChange={() => handleToggleDisponivel(produto)}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}