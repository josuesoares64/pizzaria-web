"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tamanhoService } from "@/server/tamanho.service";
import { bordaService } from "@/server/borda.service";
import { Tamanho } from "@/types/tamanho";
import { Borda } from "@/types/borda";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-neutral-200"
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

function EditarTamanhoModal({
  tamanho,
  onSalvo,
  onFechar,
}: {
  tamanho: Tamanho;
  onSalvo: (tamanho: Tamanho) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(tamanho.nome);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro("Informe o nome do tamanho.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const atualizado = await tamanhoService.atualizarNome(tamanho.id, nome.trim());
      onSalvo(atualizado);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o tamanho.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell
      titulo="Editar Tamanho"
      subtitulo="Ex: Grande (8 fatias), Broto (4 fatias)"
      onFechar={onFechar}
    >
      {erro && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
          {erro}
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Nome do Tamanho *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Grande (8 fatias)"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
        />
      </div>

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100">
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
          disabled={enviando || !nome.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </ModalShell>
  );
}

function EditarBordaModal({
  borda,
  onSalvo,
  onFechar,
}: {
  borda: Borda;
  onSalvo: (borda: Borda) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(borda.nome);
  const [preco, setPreco] = useState(String(borda.preco));
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSalvar() {
    const precoNum = tratarValorMoeda(preco);
    if (!nome.trim() || precoNum === undefined) {
      setErro("Informe o nome da borda e um preço adicional válido (ex: 6.90 ou 0 para grátis).");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const atualizada = await bordaService.atualizar(borda.id, {
        nome: nome.trim(),
        preco: precoNum,
      });
      onSalvo(atualizada);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a borda.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell
      titulo="Editar Borda Recheada"
      subtitulo="Adicione o sabor e o valor adicional"
      onFechar={onFechar}
    >
      {erro && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
          {erro}
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Nome da Borda *
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Catupiry Original"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
          Preço Adicional (R$) *
        </label>
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Ex: 8.50"
          type="text"
          inputMode="decimal"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/10 font-mono"
        />
      </div>

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100">
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
          disabled={enviando || !nome.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          {enviando ? "Salvando..." : "Salvar Borda"}
        </button>
      </div>
    </ModalShell>
  );
}

function SortableTamanhoRow({
  tamanho,
  index,
  onEditar,
  onExcluir,
  excluindo,
}: {
  tamanho: Tamanho;
  index: number;
  onEditar: () => void;
  onExcluir: () => void;
  excluindo: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tamanho.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 text-sm border border-neutral-200/90 rounded-xl px-3.5 py-2.5 bg-white shadow-2xs hover:shadow-xs transition-shadow ${
        isDragging ? "ring-2 ring-red-500 z-10" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100 transition-colors select-none"
          title="Segure e arraste para alterar a ordem no cardápio"
        >
          <span className="text-base leading-none">⋮⋮</span>
        </button>

        <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        <span className="font-semibold text-neutral-800 truncate">
          {tamanho.nome}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEditar}
          className="text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onExcluir}
          disabled={excluindo}
          className="text-xs font-semibold text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors disabled:opacity-50"
          title="Excluir tamanho"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

export default function TamanhosBordasPage() {
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados de criação rápida inline
  const [novoTamanhoNome, setNovoTamanhoNome] = useState("");
  const [salvandoTamanho, setSalvandoTamanho] = useState(false);

  const [novaBordaNome, setNovaBordaNome] = useState("");
  const [novaBordaPreco, setNovaBordaPreco] = useState("");
  const [salvandoBorda, setSalvandoBorda] = useState(false);

  const [editandoTamanho, setEditandoTamanho] = useState<Tamanho | null>(null);
  const [editandoBorda, setEditandoBorda] = useState<Borda | null>(null);
  const [excluindoTamanhoId, setExcluindoTamanhoId] = useState<string | null>(null);
  const [excluindoBordaId, setExcluindoBordaId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

  async function handleCriarTamanhoRapido() {
    if (!novoTamanhoNome.trim()) return;
    setSalvandoTamanho(true);
    try {
      const novo = await tamanhoService.criar({ nome: novoTamanhoNome.trim() });
      setTamanhos((prev) => [...prev, novo]);
      setNovoTamanhoNome("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o tamanho.");
    } finally {
      setSalvandoTamanho(false);
    }
  }

  async function handleCriarBordaRapida() {
    const precoNum = tratarValorMoeda(novaBordaPreco);
    if (!novaBordaNome.trim() || precoNum === undefined) {
      setErro("Informe o nome da borda e um preço válido (ex: 6.90).");
      return;
    }
    setSalvandoBorda(true);
    setErro(null);
    try {
      const nova = await bordaService.criar({ nome: novaBordaNome.trim(), preco: precoNum });
      setBordas((prev) => [...prev, nova]);
      setNovaBordaNome("");
      setNovaBordaPreco("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar a borda.");
    } finally {
      setSalvandoBorda(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tamanhos.findIndex((t) => t.id === active.id);
    const newIndex = tamanhos.findIndex((t) => t.id === over.id);
    const anterior = tamanhos;
    const reordenados = arrayMove(tamanhos, oldIndex, newIndex);
    setTamanhos(reordenados);

    try {
      await tamanhoService.reordenar(active.id as string, newIndex + 1);
    } catch {
      setTamanhos(anterior);
      setErro("Não foi possível reordenar os tamanhos.");
    }
  }

  async function handleExcluirTamanho(tamanho: Tamanho) {
    const confirmado = window.confirm(
      `Excluir o tamanho "${tamanho.nome}"? Os preços vinculados a esse tamanho em todas as pizzas também serão removidos.`,
    );
    if (!confirmado) return;
    const anterior = tamanhos;
    setExcluindoTamanhoId(tamanho.id);
    setTamanhos((prev) => prev.filter((t) => t.id !== tamanho.id));
    try {
      await tamanhoService.excluir(tamanho.id);
    } catch (e) {
      setTamanhos(anterior);
      setErro(e instanceof Error ? e.message : "Não foi possível excluir o tamanho.");
    } finally {
      setExcluindoTamanhoId(null);
    }
  }

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

  async function handleExcluirBorda(borda: Borda) {
    const confirmado = window.confirm(`Deseja realmente excluir a borda "${borda.nome}"?`);
    if (!confirmado) return;
    const anterior = bordas;
    setExcluindoBordaId(borda.id);
    setBordas((prev) => prev.filter((b) => b.id !== borda.id));
    try {
      await bordaService.excluir(borda.id);
    } catch (e) {
      setBordas(anterior);
      setErro(e instanceof Error ? e.message : "Não foi possível excluir a borda.");
    } finally {
      setExcluindoBordaId(null);
    }
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2.5 text-neutral-500">
        <div className="w-7 h-7 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Carregando tamanhos e bordas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Topo da Página */}
      <header>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Tamanhos e Bordas
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure as variações de tamanho das pizzas e as opções de bordas recheadas
        </p>
      </header>

      {erro && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <span>{erro}</span>
          <button onClick={() => setErro(null)} className="underline font-semibold ml-2">
            Fechar
          </button>
        </div>
      )}

      {/* Grid com as duas seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* SEÇÃO 1: TAMANHOS DE PIZZA */}
        <section className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍕</span>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Tamanhos de Pizza
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Arraste para definir a ordem no cardápio
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {tamanhos.length}
            </span>
          </div>

          {/* Criação Rápida Inline */}
          <div className="flex gap-2 mb-4">
            <input
              value={novoTamanhoNome}
              onChange={(e) => setNovoTamanhoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCriarTamanhoRapido()}
              placeholder="Ex: Grande (8 fatias)..."
              className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none bg-neutral-50/50 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleCriarTamanhoRapido}
              disabled={salvandoTamanho || !novoTamanhoNome.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shrink-0 shadow-2xs"
            >
              {salvandoTamanho ? "..." : "+ Adicionar"}
            </button>
          </div>

          {/* Lista com Drag & Drop */}
          {tamanhos.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-8 border border-dashed border-neutral-200 rounded-xl">
              Nenhum tamanho cadastrado ainda.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tamanhos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {tamanhos.map((tamanho, index) => (
                    <SortableTamanhoRow
                      key={tamanho.id}
                      tamanho={tamanho}
                      index={index}
                      onEditar={() => setEditandoTamanho(tamanho)}
                      onExcluir={() => handleExcluirTamanho(tamanho)}
                      excluindo={excluindoTamanhoId === tamanho.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* SEÇÃO 2: BORDAS RECHEADAS */}
        <section className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧀</span>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Bordas Recheadas
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Opcionais cobrados à parte no pedido
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
              {bordas.length}
            </span>
          </div>

          {/* Criação Rápida Inline com Preço */}
          <div className="flex gap-2 mb-4">
            <input
              value={novaBordaNome}
              onChange={(e) => setNovaBordaNome(e.target.value)}
              placeholder="Nome da borda (ex: Catupiry)"
              className="flex-1 border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none bg-neutral-50/50 focus:bg-white min-w-0"
            />
            <input
              value={novaBordaPreco}
              onChange={(e) => setNovaBordaPreco(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCriarBordaRapida()}
              placeholder="R$ 8,50"
              type="text"
              inputMode="decimal"
              className="w-20 border border-neutral-300 rounded-xl px-2.5 py-2 text-xs focus:border-red-500 focus:outline-none bg-neutral-50/50 focus:bg-white font-mono text-center shrink-0"
            />
            <button
              type="button"
              onClick={handleCriarBordaRapida}
              disabled={salvandoBorda || !novaBordaNome.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0 shadow-2xs"
            >
              {salvandoBorda ? "..." : "+"}
            </button>
          </div>

          {/* Lista de Bordas */}
          {bordas.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-8 border border-dashed border-neutral-200 rounded-xl">
              Nenhuma borda cadastrada ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {bordas.map((borda) => (
                <div
                  key={borda.id}
                  className="flex items-center justify-between gap-3 text-sm border border-neutral-200/90 rounded-xl px-3.5 py-2.5 bg-white shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-800 truncate leading-tight">
                      {borda.nome}
                    </p>
                    <p className="text-xs font-mono font-bold text-neutral-600 mt-0.5">
                      +{formatarMoeda(Number(borda.preco))}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 mr-1">
                      <span className="text-[11px] text-neutral-400 hidden sm:inline">
                        {borda.ativo ? "Ativa" : "Pausada"}
                      </span>
                      <Toggle
                        checked={borda.ativo}
                        onChange={() => handleToggleBorda(borda)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditandoBorda(borda)}
                      className="text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluirBorda(borda)}
                      disabled={excluindoBordaId === borda.id}
                      className="text-xs font-semibold text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg px-1.5 py-1.5 transition-colors disabled:opacity-50"
                      title="Excluir borda"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modais de Edição */}
      {editandoTamanho && (
        <EditarTamanhoModal
          tamanho={editandoTamanho}
          onSalvo={(atualizado) => {
            setTamanhos((prev) => prev.map((t) => (t.id === atualizado.id ? atualizado : t)));
            setEditandoTamanho(null);
          }}
          onFechar={() => setEditandoTamanho(null)}
        />
      )}

      {editandoBorda && (
        <EditarBordaModal
          borda={editandoBorda}
          onSalvo={(atualizada) => {
            setBordas((prev) => prev.map((b) => (b.id === atualizada.id ? atualizada : b)));
            setEditandoBorda(null);
          }}
          onFechar={() => setEditandoBorda(null)}
        />
      )}
    </div>
  );
}