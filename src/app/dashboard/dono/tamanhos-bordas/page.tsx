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
          <button onClick={onFechar} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">{children}</div>
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
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      const atualizado = await tamanhoService.atualizarNome(tamanho.id, nome);
      onSalvo(atualizado);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o tamanho.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell titulo="Editar tamanho" onFechar={onFechar}>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do tamanho"
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
    if (!nome.trim() || preco === "") return;
    setEnviando(true);
    try {
      const atualizada = await bordaService.atualizar(borda.id, { nome, preco: Number(preco) });
      onSalvo(atualizada);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar a borda.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ModalShell titulo="Editar borda" onFechar={onFechar}>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da borda"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        placeholder="Preço (ex: 6.90)"
        type="number"
        step="0.01"
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

function NovoTamanhoForm({
  onCriado,
  onCancelar,
}: {
  onCriado: (tamanho: Tamanho) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit() {
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      const novo = await tamanhoService.criar({ nome });
      onCriado(novo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o tamanho.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-2 border border-neutral-200 rounded-md p-3 flex flex-col gap-2">
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do tamanho (ex: Grande)"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          Salvar
        </button>
        <button onClick={onCancelar} className="text-xs text-neutral-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function NovaBordaForm({
  onCriada,
  onCancelar,
}: {
  onCriada: (borda: Borda) => void;
  onCancelar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit() {
    if (!nome.trim() || preco === "") return;
    setEnviando(true);
    try {
      const nova = await bordaService.criar({ nome, preco: Number(preco) });
      onCriada(nova);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar a borda.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-2 border border-neutral-200 rounded-md p-3 flex flex-col gap-2">
      {erro && <p className="text-xs text-red-600">{erro}</p>}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da borda (ex: Catupiry)"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <input
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        placeholder="Preço (ex: 6.90)"
        type="number"
        step="0.01"
        className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className="bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          Salvar
        </button>
        <button onClick={onCancelar} className="text-xs text-neutral-500">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function SortableTamanhoRow({
  tamanho,
  onEditar,
  onExcluir,
  excluindo,
}: {
  tamanho: Tamanho;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between text-sm border border-neutral-100 rounded-md px-3 py-2 bg-white"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-neutral-400 hover:text-neutral-600 px-1"
          title="Arrastar para reordenar"
        >
          ☰
        </button>
        <span className="font-medium text-neutral-800">{tamanho.nome}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onEditar} className="text-xs text-neutral-400 hover:text-red-600">
          Editar
        </button>
        <button
          onClick={onExcluir}
          disabled={excluindo}
          className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50"
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

  const [formTamanhoAberto, setFormTamanhoAberto] = useState(false);
  const [formBordaAberto, setFormBordaAberto] = useState(false);
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
    const confirmado = window.confirm(`Excluir o tamanho "${tamanho.nome}"?`);
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
    const confirmado = window.confirm(`Excluir a borda "${borda.nome}"?`);
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
        <p className="text-xs text-neutral-400 mb-2">Arraste para reordenar.</p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tamanhos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {tamanhos.map((tamanho) => (
                <SortableTamanhoRow
                  key={tamanho.id}
                  tamanho={tamanho}
                  onEditar={() => setEditandoTamanho(tamanho)}
                  onExcluir={() => handleExcluirTamanho(tamanho)}
                  excluindo={excluindoTamanhoId === tamanho.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {!formTamanhoAberto && (
          <button
            onClick={() => setFormTamanhoAberto(true)}
            className="text-xs text-red-600 font-medium mt-3"
          >
            + Adicionar tamanho
          </button>
        )}

        {formTamanhoAberto && (
          <NovoTamanhoForm
            onCriado={(novo) => {
              setTamanhos((prev) => [...prev, novo]);
              setFormTamanhoAberto(false);
            }}
            onCancelar={() => setFormTamanhoAberto(false)}
          />
        )}
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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Ativa</span>
                  <Toggle checked={borda.ativo} onChange={() => handleToggleBorda(borda)} />
                </div>
                <button
                  onClick={() => setEditandoBorda(borda)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluirBorda(borda)}
                  disabled={excluindoBordaId === borda.id}
                  className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {!formBordaAberto && (
          <button
            onClick={() => setFormBordaAberto(true)}
            className="text-xs text-red-600 font-medium mt-3"
          >
            + Adicionar borda
          </button>
        )}

        {formBordaAberto && (
          <NovaBordaForm
            onCriada={(nova) => {
              setBordas((prev) => [...prev, nova]);
              setFormBordaAberto(false);
            }}
            onCancelar={() => setFormBordaAberto(false)}
          />
        )}
      </section>

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