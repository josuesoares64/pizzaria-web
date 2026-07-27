'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { enderecoService } from '@/server/endereco.service';
import { orderService } from '@/server/order.service';
import { Endereco } from '@/types/endereco';
import { FormaPagamento } from '@/types/order';
import { FiMapPin, FiLoader, FiAlertTriangle } from 'react-icons/fi';

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const enderecoVazio: Endereco = {
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  complemento: '',
  referencia: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const pizzariaId = useAppSelector((state) => state.cart.pizzariaId);

  const [endereco, setEndereco] = useState<Endereco>(enderecoVazio);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [observacoes, setObservacoes] = useState('');

  const [carregandoEndereco, setCarregandoEndereco] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const total = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  useEffect(() => {
    async function carregarEndereco() {
      try {
        const data = await enderecoService.buscarMeu();
        setEndereco(data);
      } catch {
        // Sem endereço cadastrado ainda — mantém o formulário vazio pro cliente preencher
      } finally {
        setCarregandoEndereco(false);
      }
    }
    carregarEndereco();
  }, []);

  function atualizarCampo(campo: keyof Endereco, valor: string) {
    setEndereco((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    // DEBUG temporário — pode remover depois de confirmar a causa
    console.log('[checkout] submit disparado', { pizzariaId, itemsLength: items.length, endereco });

    if (!pizzariaId) {
      setErro('Não foi possível identificar a pizzaria do carrinho. Volte ao cardápio e tente novamente.');
      return;
    }

    if (items.length === 0) {
      setErro('Seu carrinho está vazio.');
      return;
    }

    if (!endereco.cep || !endereco.numero || !endereco.rua || !endereco.bairro) {
      setErro('Preencha CEP, número, rua e bairro para continuar.');
      return;
    }

    setEnviando(true);

    try {
      await enderecoService.salvar(endereco);

      await orderService.criarPedido({
        pizzaria_id: pizzariaId,
        forma_pagamento: formaPagamento,
        observacoes: observacoes || undefined,
        endereco,
        itens: items.map((item) => ({
          produto_id: item.produtoId,
          produto_id_2: item.produtoId2,
          tamanho_id: item.tamanhoId,
          borda_id: item.bordaId,
          quantidade: item.quantidade,
        })),
      });

      router.push('/pedidos');
      dispatch(clearCart());
    } catch (err) {
      const mensagem = (err as { message?: string })?.message;
      setErro(mensagem || 'Erro ao finalizar o pedido. Tente novamente.');
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-400 text-center px-4">
        <p>Seu carrinho está vazio.</p>
        <button onClick={() => router.push('/')} className="text-red-600 font-medium hover:underline">
          Voltar ao início
        </button>
      </div>
    );
  }

  if (carregandoEndereco) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-400">
        <FiLoader className="animate-spin" size={28} />
        <p>Carregando checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar pedido</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        {/* Resumo do carrinho */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumo do pedido</h2>
          <div className="border rounded-lg divide-y">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between p-3 text-sm">
                <div>
                  <p className="font-medium">{item.quantidade}x {item.nomeExibicao}</p>
                  {(item.tamanhoNome || item.bordaNome) && (
                    <p className="text-xs text-gray-500">
                      {[item.tamanhoNome, item.bordaNome].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </div>
                <p className="font-semibold">{formatarPreco(item.precoUnitario * item.quantidade)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-1">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">{formatarPreco(total)}</span>
          </div>
        </section>

        {/* Endereço de entrega */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <FiMapPin className="text-red-600" size={18} />
            Endereço de entrega
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="CEP"
              value={endereco.cep}
              onChange={(e) => atualizarCampo('cep', e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Número"
              value={endereco.numero}
              onChange={(e) => atualizarCampo('numero', e.target.value)}
              className="col-span-1 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Rua"
              value={endereco.rua}
              onChange={(e) => atualizarCampo('rua', e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Bairro"
              value={endereco.bairro}
              onChange={(e) => atualizarCampo('bairro', e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Complemento (opcional)"
              value={endereco.complemento || ''}
              onChange={(e) => atualizarCampo('complemento', e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Ponto de referência (opcional)"
              value={endereco.referencia || ''}
              onChange={(e) => atualizarCampo('referencia', e.target.value)}
              className="col-span-2 border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </section>

        {/* Forma de pagamento */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Forma de pagamento</h2>
          <div className="flex gap-3">
            {(['pix', 'cartao', 'dinheiro'] as FormaPagamento[]).map((forma) => (
              <button
                type="button"
                key={forma}
                onClick={() => setFormaPagamento(forma)}
                className={`flex-1 border rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
                  formaPagamento === forma
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 hover:border-red-300'
                }`}
              >
                {forma}
              </button>
            ))}
          </div>
        </section>

        {/* Observações */}
        <section>
          <label className="block text-lg font-semibold text-gray-900 mb-3">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: sem cebola, troco para R$50..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
        </section>

        {erro && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
            <FiAlertTriangle size={16} className="shrink-0" />
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {enviando ? 'Enviando pedido...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}