'use client';

import { useMemo, useState } from 'react';
import { Produto } from '@/types/produto';
import { Borda } from '@/types/borda';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';

interface PizzaCustomizationModalProps {
  produto: Produto;
  todasPizzas: Produto[];
  bordas: Borda[];
  aoFechar: () => void;
}

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PizzaCustomizationModal({ produto, todasPizzas, bordas, aoFechar }: PizzaCustomizationModalProps) {
  const dispatch = useAppDispatch();

  const [modo, setModo] = useState<'inteira' | 'meio'>('inteira');
  const [segundoSaborId, setSegundoSaborId] = useState('');
  const [tamanhoId, setTamanhoId] = useState('');
  const [bordaId, setBordaId] = useState('');
  const [quantidade, setQuantidade] = useState(1);

  const outrasPizzas = todasPizzas.filter((p) => p.id !== produto.id);
  const segundoSabor = outrasPizzas.find((p) => p.id === segundoSaborId);

  const tamanhosDisponiveis = useMemo(() => {
    const tamanhosProduto = (produto.precos ?? []).filter((p) => p.preco !== null);

    if (modo === 'inteira' || !segundoSabor) {
      return tamanhosProduto.map((p) => ({
        tamanhoId: p.tamanho.id,
        nome: p.tamanho.nome,
        ordem: p.tamanho.ordem,
        preco: parseFloat(p.preco as string),
        precoSegundo: undefined as number | undefined,
      }));
    }

    const tamanhosSegundo = (segundoSabor.precos ?? []).filter((p) => p.preco !== null);

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

  const precoUnitario = useMemo(() => {
    if (!tamanhoSelecionado) return 0;
    const precoBase =
      modo === 'meio' && tamanhoSelecionado.precoSegundo !== undefined
        ? (tamanhoSelecionado.preco + tamanhoSelecionado.precoSegundo) / 2
        : tamanhoSelecionado.preco;
    const precoBorda = bordaSelecionada ? parseFloat(bordaSelecionada.preco) : 0;
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

    const nomeExibicao = modo === 'meio' && segundoSabor ? `${produto.nome} / ${segundoSabor.nome}` : produto.nome;

    dispatch(
      addItem({
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

  const podeConfirmar = tamanhoSelecionado !== undefined && (modo === 'inteira' || segundoSaborId !== '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={aoFechar}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{produto.nome}</h2>
          <button onClick={aoFechar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Como você quer sua pizza?</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleMudarModo('inteira')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${modo === 'inteira' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              Pizza inteira
            </button>
            <button
              onClick={() => handleMudarModo('meio')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${modo === 'meio' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              Meio a meio
            </button>
          </div>
        </div>

        {modo === 'meio' && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Segundo sabor</p>
            <select
              value={segundoSaborId}
              onChange={(e) => handleMudarSegundoSabor(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {outrasPizzas.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Tamanho</p>
          {tamanhosDisponiveis.length === 0 ? (
            <p className="text-sm text-gray-400">
              {modo === 'meio' && !segundoSabor ? 'Escolha o segundo sabor primeiro.' : 'Nenhum tamanho disponível para essa combinação.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tamanhosDisponiveis.sort((a, b) => a.ordem - b.ordem).map((t) => (
                <button
                  key={t.tamanhoId}
                  onClick={() => setTamanhoId(t.tamanhoId)}
                  className={`px-4 py-2 rounded-lg text-sm border ${tamanhoId === t.tamanhoId ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {t.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {bordas.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Borda recheada (opcional)</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBordaId('')}
                className={`px-4 py-2 rounded-lg text-sm border ${bordaId === '' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Sem borda
              </button>
              {bordas.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBordaId(b.id)}
                  className={`px-4 py-2 rounded-lg text-sm border ${bordaId === b.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {b.nome} (+{formatarPreco(parseFloat(b.preco))})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700">Quantidade</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center">−</button>
            <span className="w-6 text-center">{quantidade}</span>
            <button onClick={() => setQuantidade((q) => q + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center">+</button>
          </div>
        </div>

        <button
          onClick={handleConfirmar}
          disabled={!podeConfirmar}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {podeConfirmar ? `Adicionar • ${formatarPreco(precoUnitario * quantidade)}` : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}