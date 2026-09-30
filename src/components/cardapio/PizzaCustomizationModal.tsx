'use client';

import { useMemo, useState, useEffect } from 'react';
import { Produto } from '@/types/produto';
import { Borda } from '@/types/borda';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { FiX, FiCheck } from 'react-icons/fi';

interface PizzaCustomizationModalProps {
  produto: Produto;
  todasPizzas: Produto[];
  bordas: Borda[];
  pizzariaId: string;
  aoFechar: () => void;
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PizzaCustomizationModal({
  produto,
  todasPizzas,
  bordas,
  pizzariaId,
  aoFechar,
}: PizzaCustomizationModalProps) {
  const dispatch = useAppDispatch();

  const [modo, setModo] = useState<'inteira' | 'meio'>('inteira');
  const [segundoSaborId, setSegundoSaborId] = useState('');
  const [tamanhoId, setTamanhoId] = useState('');
  const [bordaId, setBordaId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  // Fecha o modal ao pressionar a tecla ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aoFechar]);

  const outrasPizzas = todasPizzas.filter((p) => p.id !== produto.id);
  const segundoSabor = outrasPizzas.find((p) => p.id === segundoSaborId);

  const tamanhosDisponiveis = useMemo(() => {
    const tamanhosProduto = (produto.precos ?? []).filter((p) => p.preco !== null && p.preco !== '');

    if (modo === 'inteira' || !segundoSabor) {
      return tamanhosProduto.map((p) => ({
        tamanhoId: p.tamanho.id,
        nome: p.tamanho.nome,
        ordem: p.tamanho.ordem,
        preco: parseFloat(p.preco as string),
        precoSegundo: undefined as number | undefined,
      }));
    }

    const tamanhosSegundo = (segundoSabor.precos ?? []).filter((p) => p.preco !== null && p.preco !== '');

    return tamanhosProduto
      .map((p) => {
        const correspondente = tamanhosSegundo.find((s) => s.tamanho.id === p.tamanho.id);
        if (!correspondente) return null;
        return {
          tamanhoId: p.tamanho.id,
          nome: p.tamanho.nome,
          ordem: p.tamanho.ordem,
          preco: parseFloat(p.preco as string),
          precoSegundo: parseFloat(correspondente.preco as string),
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [produto, segundoSabor, modo]);

  const tamanhoSelecionado = tamanhosDisponiveis.find((t) => t.tamanhoId === tamanhoId);
  const bordaSelecionada = bordas.find((b) => b.id === bordaId);

  // Auto-seleciona o primeiro tamanho se houver apenas 1 ou se o atual foi resetado
  useEffect(() => {
    if (tamanhosDisponiveis.length === 1 && !tamanhoId) {
      setTamanhoId(tamanhosDisponiveis[0].tamanhoId);
    }
  }, [tamanhosDisponiveis, tamanhoId]);

  const precoUnitario = useMemo(() => {
    if (!tamanhoSelecionado) return 0;
    const precoBase =
      modo === 'meio' && tamanhoSelecionado.precoSegundo !== undefined
        ? (tamanhoSelecionado.preco + tamanhoSelecionado.precoSegundo) / 2
        : tamanhoSelecionado.preco;

    const precoBorda = bordaSelecionada ? parseFloat(bordaSelecionada.preco as unknown as string) : 0;
    return precoBase + precoBorda;
  }, [tamanhoSelecionado, bordaSelecionada, modo]);

  function handleMudarModo(novoModo: 'inteira' | 'meio') {
    setModo(novoModo);
    setSegundoSaborId('');
    setTamanhoId('');
  }

  function handleMudarSegundoSabor(id: string) {
    setSegundoSaborId(id);
    setTamanhoId('');
  }

  function handleConfirmar() {
    if (!tamanhoSelecionado) return;

    const nomeExibicao =
      modo === 'meio' && segundoSabor
        ? `1/2 ${produto.nome} + 1/2 ${segundoSabor.nome}`
        : produto.nome;

    dispatch(
      addItem({
        pizzariaId,
        produtoId: produto.id,
        produtoId2: modo === 'meio' ? segundoSaborId : undefined,
        nomeExibicao,
        tamanhoId: tamanhoSelecionado.tamanhoId,
        tamanhoNome: tamanhoSelecionado.nome,
        bordaId: bordaSelecionada?.id,
        bordaNome: bordaSelecionada?.nome,
        precoUnitario,
        quantidade,
      })
    );

    aoFechar();
  }

  const podeConfirmar =
    tamanhoSelecionado !== undefined && (modo === 'inteira' || segundoSaborId !== '');

  return (
    <div
      onClick={aoFechar}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200"
      >
        {/* Topo do Modal com Foto e Título */}
        <div className="relative px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3 min-w-0 pr-6">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl shrink-0">
              🍕
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-neutral-900 truncate">
                {produto.nome}
              </h2>
              <p className="text-[11px] text-neutral-400 truncate">
                {produto.descricao || 'Personalize os sabores, tamanho e borda'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
            title="Fechar (ESC)"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* 1. Escolha de Modo (Inteira vs Meio a Meio) */}
          <div>
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              1. Quantidade de Sabores
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-neutral-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleMudarModo('inteira')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modo === 'inteira'
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>🟡</span>
                <span>1 Sabor (Inteira)</span>
              </button>
              <button
                type="button"
                onClick={() => handleMudarModo('meio')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modo === 'meio'
                    ? 'bg-white text-red-600 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>🌓</span>
                <span>2 Sabores (1/2 a 1/2)</span>
              </button>
            </div>
          </div>

          {/* 2. Seleção do Segundo Sabor (apenas se meio a meio) */}
          {modo === 'meio' && (
            <div className="animate-in fade-in duration-200">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                2. Escolha o Segundo Sabor *
              </label>
              <div className="relative">
                <select
                  value={segundoSaborId}
                  onChange={(e) => handleMudarSegundoSabor(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione o segundo sabor da pizza...</option>
                  {outrasPizzas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none text-xs">
                  ▼
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1.5">
                💡 O valor da pizza meio a meio é calculado pela média dos preços de cada sabor.
              </p>
            </div>
          )}

          {/* 3. Seleção de Tamanho */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                {modo === 'meio' ? '3.' : '2.'} Escolha o Tamanho *
              </label>
              <span className="text-[10px] text-neutral-400">Obrigatório</span>
            </div>

            {tamanhosDisponiveis.length === 0 ? (
              <div className="py-4 px-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-500">
                {modo === 'meio' && !segundoSabor
                  ? '👆 Selecione o segundo sabor acima para ver os tamanhos disponíveis.'
                  : 'Nenhum tamanho disponível para esta combinação.'}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {tamanhosDisponiveis
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((t) => {
                    const precoDoTamanho =
                      modo === 'meio' && t.precoSegundo !== undefined
                        ? (t.preco + t.precoSegundo) / 2
                        : t.preco;

                    const selecionado = tamanhoId === t.tamanhoId;

                    return (
                      <button
                        type="button"
                        key={t.tamanhoId}
                        onClick={() => setTamanhoId(t.tamanhoId)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                          selecionado
                            ? 'border-red-600 bg-red-50/40 shadow-xs'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        {selecionado && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                            <FiCheck />
                          </span>
                        )}
                        <span className="font-bold text-xs text-neutral-900 block leading-tight">
                          {t.nome}
                        </span>
                        <span className="text-xs font-mono font-bold text-red-600 mt-2 block">
                          {formatarPreco(precoDoTamanho)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* 4. Bordas Recheadas (Opcional) */}
          {bordas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  {modo === 'meio' ? '4.' : '3.'} Borda Recheada
                </label>
                <span className="text-[10px] text-neutral-400">Opcional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBordaId('')}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                    bordaId === ''
                      ? 'border-red-600 bg-red-50/50 text-red-700 font-bold'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>Massa Tradicional (Sem borda)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Grátis</span>
                </button>

                {bordas.map((b) => {
                  const selecionada = bordaId === b.id;
                  const valorBorda = parseFloat(b.preco as unknown as string);

                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setBordaId(b.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        selecionada
                          ? 'border-red-600 bg-red-50/50 text-red-700 font-bold'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="truncate pr-1">{b.nome}</span>
                      <span className="text-xs font-mono font-bold text-neutral-900 shrink-0">
                        +{formatarPreco(valorBorda)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Contador e Botão de Confirmação */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white flex items-center gap-3">
          {/* Seletor de Quantidade */}
          <div className="flex items-center border border-neutral-200 rounded-2xl p-1 bg-neutral-50 shrink-0">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/60 text-neutral-700 font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-40"
              disabled={quantidade <= 1}
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-mono font-bold text-neutral-800">
              {quantidade}
            </span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/60 text-neutral-700 font-bold text-sm flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>

          {/* Botão de Adicionar */}
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!podeConfirmar}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-xs transition-all flex items-center justify-between"
          >
            <span>Adicionar ao Pedido</span>
            <span className="font-mono font-extrabold">
              {podeConfirmar ? formatarPreco(precoUnitario * quantidade) : '—'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}