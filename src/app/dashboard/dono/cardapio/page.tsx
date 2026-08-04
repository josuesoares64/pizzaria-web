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
          <button
            onClick={onFechar}
            className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
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
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      const atualizada = await categoriaService.atualizar(categoria.id, {
        nome,
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
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da categoria"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
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
  const [preco, setPreco] = useState(produto.preco ?? "");
  const [imagemUrl, setImagemUrl] = useState(produto.imagem_url ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  async function handleSalvar() {
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      const atualizado = await produtoService.atualizar(produto.id, {
        nome,
        descricao: descricao || undefined,
        preco:
          produto.tipo === "simples" && preco !== ""
            ? Number(preco)
            : undefined,
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
      {erro && <p className="text-xs text-red-600">{erro}</p>}

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
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
            className="text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-md px-2.5 py-1.5"
          >
            {enviandoImagem ? "Enviando..." : "Alterar foto"}
          </button>
        </div>
      </div>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do produto"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      {produto.tipo === "simples" && (
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Preço (ex: 12.90)"
          type="number"
          step="0.01"
          className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
        />
      )}
      {produto.tipo === "pizza" && (
        <Link
          href={`/dashboard/dono/produtos/${produto.id}/precos`}
          className="text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md px-3 py-1.5 text-center"
        >
          Definir preços →
        </Link>
      )}
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

export default function CardapioPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [produtoFormAberto, setProdutoFormAberto] = useState<string | null>(
    null,
  ); // categoria_id
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(
    null,
  );
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
        nome: novaCategoriaNome,
        ativo: true,
      });
      setCategorias((prev) => [...prev, nova]);
      setNovaCategoriaNome("");
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

  if (carregando)
    return <p className="text-sm text-neutral-500">Carregando cardápio...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-800 mb-5">Cardápio</h1>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">
          {erro}
        </p>
      )}

      <div className="flex gap-2 mb-6">
        <input
          value={novaCategoriaNome}
          onChange={(e) => setNovaCategoriaNome(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1 border border-neutral-200 rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={handleCriarCategoria}
          className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700"
        >
          + Categoria
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {categorias.map((categoria) => {
          const produtosDaCategoria = produtos.filter(
            (p) => p.categoria_id === categoria.id,
          );
          const aberta = expandida === categoria.id;

          return (
            <div
              key={categoria.id}
              className="border border-neutral-200 rounded-lg bg-white"
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpandida(aberta ? null : categoria.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${aberta ? "rotate-90" : ""} transition-transform`}
                  >
                    ▸
                  </span>
                  <span className="text-sm font-medium text-neutral-800">
                    {categoria.nome}
                  </span>
                  <span className="text-xs text-neutral-400">
                    ({produtosDaCategoria.length})
                  </span>
                </div>

                <div
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditandoCategoria(categoria)}
                    className="text-xs text-neutral-400 hover:text-red-600"
                  >
                    Editar
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Ativa</span>
                    <Toggle
                      checked={categoria.ativo}
                      onChange={() => handleToggleCategoria(categoria)}
                    />
                  </div>
                </div>
              </div>

              {aberta && (
                <div className="border-t border-neutral-100 px-4 py-3">
                  {produtosDaCategoria.length === 0 && (
                    <p className="text-xs text-neutral-400 mb-2">
                      Nenhum produto nessa categoria ainda.
                    </p>
                  )}
                  <div className="flex flex-col gap-2 mb-3">
                    {produtosDaCategoria.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2"
                      >
                        <div>
                          <span className="font-medium text-neutral-800">
                            {produto.nome}
                          </span>
                          <span className="text-xs text-neutral-400 ml-2">
                            {produto.tipo === "pizza" ? "Pizza" : "Simples"}
                          </span>
                          {produto.tipo === "simples" && produto.preco && (
                            <span className="text-xs text-neutral-500 ml-2">
                              R${" "}
                              {Number(produto.preco)
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          )}
                          {pizzaSemPreco(produto) && (
                            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 ml-2">
                              ⚠ Sem preço definido
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {produto.tipo === "pizza" && (
                            <Link
                              href={`/dashboard/dono/produtos/${produto.id}/precos`}
                              className={
                                pizzaSemPreco(produto)
                                  ? "text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md px-2.5 py-1"
                                  : "text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md px-2.5 py-1"
                              }
                            >
                              Definir preços →
                            </Link>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500">
                              Disponível
                            </span>
                            <Toggle
                              checked={produto.disponivel}
                              onChange={() => handleToggleDisponivel(produto)}
                            />
                          </div>
                          <button
                            onClick={() => setEditandoProduto(produto)}
                            className="text-xs text-neutral-400 hover:text-red-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluirProduto(produto)}
                            disabled={excluindoId === produto.id}
                            className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50"
                            title="Excluir produto"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setProdutoFormAberto(categoria.id)}
                    className="text-xs text-red-600 font-medium"
                  >
                    + Adicionar produto
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
            setEditandoProduto(atualizado);
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

  function handleSelecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImagem(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!nome.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      const novo = await produtoService.criar({
        nome,
        descricao: descricao || undefined,
        tipo,
        categoria_id: categoriaId,
        preco: tipo === "simples" ? Number(preco) : undefined,
      });

      // Produto criado. Se uma imagem foi escolhida, sobe ela agora num segundo
      // passo (o endpoint de upload precisa do id do produto, que só existe
      // depois de criado). Se esse passo falhar, o produto NÃO é perdido —
      // ele já existe, só fica sem foto até o dono tentar de novo editando.
      if (imagem) {
        try {
          const comImagem = await produtoService.uploadImagem(novo.id, imagem);
          onCriado(comImagem);
        } catch {
          // O form fecha ao chamar onCriado, então o aviso precisa subir pro
          // banner da página (que continua visível), não ficar num estado local daqui.
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
    <div className="mt-3 border border-neutral-200 rounded-md p-3 flex flex-col gap-2">
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
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
            className="text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md px-2.5 py-1.5"
          >
            {previewUrl ? "Trocar foto" : "Adicionar foto"}
          </button>
        </div>
      </div>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do produto"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoProduto)}
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      >
        <option value="simples">Simples</option>
        <option value="pizza">Pizza</option>
      </select>
      {tipo === "simples" && (
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Preço (ex: 12.90)"
          type="number"
          step="0.01"
          className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
        />
      )}
      {tipo === "pizza" && (
        <p className="text-xs text-neutral-400">
          Preços por tamanho são definidos depois de criar o produto.
        </p>
      )}
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
        <button onClick={onCancelar} className="text-xs text-neutral-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}