"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { categoriaService } from "@/server/categoria.service";
import { produtoService } from "@/server/produto.service";
import { Categoria } from "@/types/categoria";
import { Produto, TipoProduto } from "@/types/produto";
import Link from "next/link";

function pizzaSemPreco(produto: Produto): boolean {
  if (produto.tipo !== "pizza") return false;
  if (!produto.precos || produto.precos.length === 0) return true;
  return produto.precos.every((p) => p.preco === null || p.preco === "");
}

// Converte string com vírgula ou ponto para número válido
function tratarValorMoeda(valor: string | number | undefined | null): number | undefined {
  if (valor === undefined || valor === null || valor === "") return undefined;
  const str = String(valor).replace(",", ".");
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
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

function ModalShell({
  titulo,
  onFechar,
  children,
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  // Fecha com ESC
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
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-100"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-neutral-200"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
          <h2 className="text-sm font-semibold text-neutral-800">{titulo}</h2>
          <button
            onClick={onFechar}
            className="text-neutral-400 hover:text-neutral-600 text-lg leading-none p-1"
          >
            ×
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

function EditarCategoriaModal({
  categoria,
  onSalvo,
  onFechar,
}: {
  categoria: Categoria;
  onSalvo: (categoria: Categoria) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(categoria.nome);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const atualizada = await categoriaService.atualizar(categoria.id, {
        nome: nome.trim(),
        ativo: categoria.ativo,
      });
      onSalvo(atualizada);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível salvar a categoria.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell titulo="Editar categoria" onFechar={onFechar}>
      {erro && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {erro}
        </p>
      )}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da categoria"
        className="border border-neutral-300 focus:border-red-500 rounded-md px-2.5 py-1.5 text-sm focus:outline-none"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onFechar}
          className="text-xs text-neutral-600 hover:bg-neutral-100 px-3 py-1.5 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={enviando || !nome.trim()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </ModalShell>
  );
}

function EditarProdutoModal({
  produto,
  onSalvo,
  onFechar,
}: {
  produto: Produto;
  onSalvo: (produto: Produto) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(produto.nome);
  const [descricao, setDescricao] = useState(produto.descricao ?? "");
  const [preco, setPreco] = useState(
    produto.preco !== undefined && produto.preco !== null ? String(produto.preco) : "",
  );
  const [imagemUrl, setImagemUrl] = useState(produto.imagem_url ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    let precoNumerico: number | undefined = undefined;
    if (produto.tipo === "simples") {
      precoNumerico = tratarValorMoeda(preco);
      if (precoNumerico === undefined || precoNumerico <= 0) {
        setErro("Para produtos simples, informe um preço válido (ex: 12.90).");
        return;
      }
    }

    setEnviando(true);
    setErro(null);
    try {
      const atualizado = await produtoService.atualizar(produto.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        preco: precoNumerico,
      });
      onSalvo(atualizado);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível salvar o produto.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleSelecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setEnviandoImagem(true);
    setErro(null);
    try {
      const atualizado = await produtoService.uploadImagem(produto.id, file);
      setImagemUrl(atualizado.imagem_url ?? "");
      onSalvo(atualizado);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível enviar a imagem.",
      );
    } finally {
      setEnviandoImagem(false);
    }
  }

  return (
    <ModalShell titulo="Editar produto" onFechar={onFechar}>
      {erro && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
          {imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagemUrl}
              alt={produto.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] text-neutral-400 text-center px-1">
              Sem foto
            </span>
          )}
        </div>
        <div>
          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            onChange={handleSelecionarImagem}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputImagemRef.current?.click()}
            disabled={enviandoImagem}
            className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            {enviandoImagem ? "Enviando..." : "Alterar foto"}
          </button>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-medium text-neutral-500 mb-0.5 block">
          Nome do produto *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Pizza Calabresa Especial"
          className="w-full border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[11px] font-medium text-neutral-500 mb-0.5 block">
          Descrição (opcional)
        </label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ingredientes ou detalhes do item..."
          rows={2}
          className="w-full border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none resize-none"
        />
      </div>

      {produto.tipo === "simples" && (
        <div>
          <label className="text-[11px] font-medium text-neutral-500 mb-0.5 block">
            Preço (R$) *
          </label>
          <input
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Ex: 12.90"
            type="text"
            inputMode="decimal"
            className="w-full border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
      )}

      {produto.tipo === "pizza" && (
        <div className="pt-1">
          <Link
            href={`/dashboard/dono/produtos/${produto.id}/precos`}
            className="block text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2 text-center transition-colors"
          >
            Configurar preços por tamanho →
          </Link>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onFechar}
          className="text-xs text-neutral-600 hover:bg-neutral-100 px-3 py-1.5 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={enviando || !nome.trim()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </ModalShell>
  );
}

export default function CardapioPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [produtoFormAberto, setProdutoFormAberto] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [excluindoCategoriaId, setExcluindoCategoriaId] = useState<string | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null);
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);

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

  async function handleCriarCategoria() {
    if (!novaCategoriaNome.trim()) return;
    try {
      const nova = await categoriaService.criar({
        nome: novaCategoriaNome.trim(),
        ativo: true,
      });
      setCategorias((prev) => [...prev, nova]);
      setNovaCategoriaNome("");
      setExpandida(nova.id);
    } catch {
      setErro("Não foi possível criar a categoria.");
    }
  }

  async function handleToggleCategoria(categoria: Categoria) {
    const anterior = categorias;
    setCategorias((prev) =>
      prev.map((c) => (c.id === categoria.id ? { ...c, ativo: !c.ativo } : c)),
    );
    try {
      await categoriaService.atualizarStatus(categoria.id, !categoria.ativo);
    } catch {
      setCategorias(anterior);
      setErro("Não foi possível atualizar o status da categoria.");
    }
  }

  async function handleExcluirCategoria(categoria: Categoria) {
    const prodsDaCat = produtos.filter((p) => p.categoria_id === categoria.id);
    if (prodsDaCat.length > 0) {
      alert(`Esta categoria possui ${prodsDaCat.length} produto(s). Exclua ou mova os produtos antes de excluir a categoria.`);
      return;
    }

    const confirmado = window.confirm(`Deseja realmente excluir a categoria "${categoria.nome}"?`);
    if (!confirmado) return;

    const anterior = categorias;
    setExcluindoCategoriaId(categoria.id);
    setCategorias((prev) => prev.filter((c) => c.id !== categoria.id));
    try {
      if ("excluir" in categoriaService && typeof categoriaService.excluir === "function") {
        await categoriaService.excluir(categoria.id);
      }
    } catch {
      setCategorias(anterior);
      setErro("Não foi possível excluir a categoria.");
    } finally {
      setExcluindoCategoriaId(null);
    }
  }

  async function handleToggleDisponivel(produto: Produto) {
    const anterior = produtos;
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p,
      ),
    );
    try {
      await produtoService.atualizarStatus(produto.id, !produto.disponivel);
    } catch {
      setProdutos(anterior);
      setErro("Não foi possível atualizar a disponibilidade do produto.");
    }
  }

  async function handleExcluirProduto(produto: Produto) {
    const confirmado = window.confirm(
      `Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`,
    );
    if (!confirmado) return;

    const anterior = produtos;
    setExcluindoId(produto.id);
    setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
    try {
      await produtoService.excluir(produto.id);
    } catch {
      setProdutos(anterior);
      setErro("Não foi possível excluir o produto.");
    } finally {
      setExcluindoId(null);
    }
  }

  if (carregando) {
    return <p className="text-sm text-neutral-500">Carregando cardápio...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Cardápio</h1>
          <p className="text-xs text-neutral-500">
            Gerencie categorias, produtos, disponibilidade e fotos
          </p>
        </div>
      </div>

      {erro && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4 flex justify-between items-center">
          <span>{erro}</span>
          <button onClick={() => setErro(null)} className="text-xs underline font-semibold ml-2">
            Fechar
          </button>
        </div>
      )}

      {/* Criação Rápida de Categoria */}
      <div className="flex gap-2 mb-6">
        <input
          value={novaCategoriaNome}
          onChange={(e) => setNovaCategoriaNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCriarCategoria()}
          placeholder="Nome da nova categoria (ex: Pizzas Salgadas, Bebidas...)"
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none bg-white shadow-2xs"
        />
        <button
          type="button"
          onClick={handleCriarCategoria}
          disabled={!novaCategoriaNome.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs"
        >
          + Categoria
        </button>
      </div>

      {/* Lista de Categorias */}
      <div className="flex flex-col gap-2.5">
        {categorias.length === 0 && (
          <p className="text-sm text-neutral-400 py-6 text-center border border-dashed border-neutral-300 rounded-lg">
            Nenhuma categoria cadastrada ainda. Adicione a primeira acima!
          </p>
        )}

        {categorias.map((categoria) => {
          const produtosDaCategoria = produtos.filter(
            (p) => p.categoria_id === categoria.id,
          );
          const aberta = expandida === categoria.id;

          return (
            <div
              key={categoria.id}
              className="border border-neutral-200/90 rounded-xl bg-white shadow-2xs overflow-hidden"
            >
              {/* Barra da Categoria */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-neutral-50/80 transition-colors select-none"
                onClick={() => setExpandida(aberta ? null : categoria.id)}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs text-neutral-500 transition-transform duration-150 ${
                      aberta ? "rotate-90" : ""
                    }`}
                  >
                    ▸
                  </span>
                  <span className="text-sm font-bold text-neutral-800">
                    {categoria.nome}
                  </span>
                  <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {produtosDaCategoria.length}
                  </span>
                </div>

                <div
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setEditandoCategoria(categoria)}
                    className="text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExcluirCategoria(categoria)}
                    disabled={excluindoCategoriaId === categoria.id}
                    className="text-xs font-medium text-neutral-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                    title="Excluir categoria"
                  >
                    Excluir
                  </button>

                  <div className="w-px h-3.5 bg-neutral-200" />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {categoria.ativo ? "Ativa" : "Pausada"}
                    </span>
                    <Toggle
                      checked={categoria.ativo}
                      onChange={() => handleToggleCategoria(categoria)}
                    />
                  </div>
                </div>
              </div>

              {/* Corpo da Categoria (Produtos) */}
              {aberta && (
                <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50/40">
                  {produtosDaCategoria.length === 0 && (
                    <p className="text-xs text-neutral-400 mb-3 italic">
                      Nenhum produto cadastrado nessa categoria.
                    </p>
                  )}

                  <div className="flex flex-col gap-2 mb-3">
                    {produtosDaCategoria.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm border border-neutral-200 bg-white rounded-lg p-2.5 shadow-2xs"
                      >
                        {/* Identificação e Miniatura do Produto */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                            {produto.imagem_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={produto.imagem_url}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] text-neutral-300">
                                🍕
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-neutral-800 truncate">
                                {produto.nome}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.2 rounded">
                                {produto.tipo === "pizza" ? "Pizza" : "Simples"}
                              </span>

                              {produto.tipo === "simples" && produto.preco && (
                                <span className="text-xs font-mono font-bold text-neutral-700">
                                  R${" "}
                                  {Number(produto.preco)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </span>
                              )}

                              {pizzaSemPreco(produto) && (
                                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.2">
                                  ⚠ Sem preço definido
                                </span>
                              )}
                            </div>

                            {produto.descricao && (
                              <p className="text-xs text-neutral-400 truncate max-w-sm mt-0.5">
                                {produto.descricao}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Ações do Produto */}
                        <div className="flex items-center gap-3 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                          {produto.tipo === "pizza" && (
                            <Link
                              href={`/dashboard/dono/produtos/${produto.id}/precos`}
                              className={
                                pizzaSemPreco(produto)
                                  ? "text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md px-2.5 py-1 shadow-2xs"
                                  : "text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md px-2.5 py-1"
                              }
                            >
                              Preços →
                            </Link>
                          )}

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-neutral-500">
                              {produto.disponivel ? "Ativo" : "Esgotado"}
                            </span>
                            <Toggle
                              checked={produto.disponivel}
                              onChange={() => handleToggleDisponivel(produto)}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditandoProduto(produto)}
                            className="text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExcluirProduto(produto)}
                            disabled={excluindoId === produto.id}
                            className="text-xs font-medium text-neutral-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                            title="Excluir produto"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setProdutoFormAberto(categoria.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 py-1"
                  >
                    <span>+</span>
                    <span>Adicionar produto</span>
                  </button>

                  {produtoFormAberto === categoria.id && (
                    <NovoProdutoForm
                      categoriaId={categoria.id}
                      onCriado={(novo) => {
                        setProdutos((prev) => [...prev, novo]);
                        setProdutoFormAberto(null);
                      }}
                      onCancelar={() => setProdutoFormAberto(null)}
                      onAvisoImagem={(mensagem) => setErro(mensagem)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editandoCategoria && (
        <EditarCategoriaModal
          categoria={editandoCategoria}
          onSalvo={(atualizada) => {
            setCategorias((prev) =>
              prev.map((c) => (c.id === atualizada.id ? atualizada : c)),
            );
            setEditandoCategoria(null);
          }}
          onFechar={() => setEditandoCategoria(null)}
        />
      )}

      {editandoProduto && (
        <EditarProdutoModal
          produto={editandoProduto}
          onSalvo={(atualizado) => {
            setProdutos((prev) =>
              prev.map((p) => (p.id === atualizado.id ? atualizado : p)),
            );
            setEditandoProduto(null);
          }}
          onFechar={() => setEditandoProduto(null)}
        />
      )}
    </div>
  );
}

function NovoProdutoForm({
  categoriaId,
  onCriado,
  onCancelar,
  onAvisoImagem,
}: {
  categoriaId: string;
  onCriado: (produto: Produto) => void;
  onCancelar: () => void;
  onAvisoImagem: (mensagem: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<TipoProduto>("simples");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  // Limpa a URL em memória ao desmontar ou trocar de foto
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleSelecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImagem(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    let precoNumerico: number | undefined = undefined;
    if (tipo === "simples") {
      precoNumerico = tratarValorMoeda(preco);
      if (precoNumerico === undefined || precoNumerico <= 0) {
        setErro("Para produtos simples, informe um preço válido (ex: 12.90).");
        return;
      }
    }

    setEnviando(true);
    setErro(null);
    try {
      const novo = await produtoService.criar({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        tipo,
        categoria_id: categoriaId,
        preco: precoNumerico,
      });

      if (imagem) {
        try {
          const comImagem = await produtoService.uploadImagem(novo.id, imagem);
          onCriado(comImagem);
        } catch {
          onAvisoImagem(
            `"${novo.nome}" foi criado, mas a imagem não pôde ser enviada. Edite o produto pra tentar de novo.`,
          );
          onCriado(novo);
        }
        return;
      }

      onCriado(novo);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : "Não foi possível criar o produto.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-3 border border-neutral-200 bg-white rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xs">
      {erro && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-neutral-400 text-center px-1">
              Sem foto
            </span>
          )}
        </div>
        <div>
          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            onChange={handleSelecionarImagem}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputImagemRef.current?.click()}
            className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            {previewUrl ? "Trocar foto" : "Adicionar foto"}
          </button>
        </div>
      </div>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do produto *"
        className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
      />

      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none"
      />

      <div className="flex gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoProduto)}
          className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none bg-white"
        >
          <option value="simples">Simples (Refrigerante, Sobremesa...)</option>
          <option value="pizza">Pizza (Vários tamanhos)</option>
        </select>

        {tipo === "simples" && (
          <input
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Preço (ex: 12.90) *"
            type="text"
            inputMode="decimal"
            className="border border-neutral-300 rounded-md px-2.5 py-1.5 text-sm focus:border-red-500 focus:outline-none flex-1"
          />
        )}
      </div>

      {tipo === "pizza" && (
        <p className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-200">
          💡 Os preços por tamanho (Broto, Grande, Família) serão configurados logo após salvar.
        </p>
      )}

      <div className="flex justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={onCancelar}
          className="text-xs text-neutral-600 hover:bg-neutral-100 px-3 py-1.5 rounded-md"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={enviando || !nome.trim()}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar produto"}
        </button>
      </div>
    </div>
  );
}