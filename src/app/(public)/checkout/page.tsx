'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { enderecoService } from '@/server/endereco.service';
import { orderService } from '@/server/order.service';
import { entregaService, LocalidadeTaxa } from '@/server/entrega.service';
import { Endereco } from '@/types/endereco';
import { FormaPagamento, TipoPedido } from '@/types/order';
import { FiMapPin, FiLoader, FiAlertTriangle, FiShoppingBag, FiGrid } from 'react-icons/fi';

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

const OUTRO_BAIRRO = '__outro__';

const tiposPedido: { valor: TipoPedido; label: string; icone: React.ReactNode }[] = [
  { valor: 'entrega', label: 'Entrega', icone: <FiMapPin size={16} /> },
  { valor: 'retirada', label: 'Retirada', icone: <FiShoppingBag size={16} /> },
  { valor: 'mesa', label: 'Mesa', icone: <FiGrid size={16} /> },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const pizzariaId = useAppSelector((state) => state.cart.pizzariaId);

  const [tipoPedido, setTipoPedido] = useState<TipoPedido>('entrega');
  const [numeroMesa, setNumeroMesa] = useState('');
  const [endereco, setEndereco] = useState<Endereco>(enderecoVazio);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [carregandoEndereco, setCarregandoEndereco] = useState(true);

  // ---- Localidade e taxa de entrega ----
  // A seleção guarda o ID da localidade cadastrada (nunca o nome/texto do bairro).
  // Isso é o que evita que o cliente "burle" a taxa: só um ID que existe de fato
  // na tabela da pizzaria consegue puxar uma taxa diferente da padrão — o texto
  // digitado no campo "outro bairro" nunca é usado pra calcular nada.
  const [localidades, setLocalidades] = useState<LocalidadeTaxa[]>([]);
  const [taxaPadrao, setTaxaPadrao] = useState<number | null>(null);
  const [carregandoLocalidades, setCarregandoLocalidades] = useState(true);
  const [selecaoLocalidadeId, setSelecaoLocalidadeId] = useState<string>(''); // id cadastrado, ou OUTRO_BAIRRO, ou '' (nada escolhido)

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const subtotal = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  // Taxa efetiva: só existe taxa "de bairro" se o ID escolhido bater com uma
  // localidade cadastrada. "Outro" ou nada selecionado cai na taxa padrão.
  const taxaEntrega = useMemo(() => {
    if (!selecaoLocalidadeId) return null;
    if (selecaoLocalidadeId === OUTRO_BAIRRO) return taxaPadrao;
    const encontrada = localidades.find((l) => l.id === selecaoLocalidadeId);
    return encontrada ? Number(encontrada.taxa) : taxaPadrao;
  }, [selecaoLocalidadeId, localidades, taxaPadrao]);

  const total = tipoPedido === 'entrega' && taxaEntrega ? subtotal + taxaEntrega : subtotal;

  useEffect(() => {
    async function carregarEndereco() {
      try {
        const data = await enderecoService.buscarMeu();
        setEndereco(data);
        // A pré-seleção do dropdown por ID só acontece depois que as localidades
        // carregarem (precisamos casar o bairro salvo com o ID correspondente).
      } catch {
        // Sem endereço cadastrado ainda — mantém o formulário vazio pro cliente preencher
      } finally {
        setCarregandoEndereco(false);
      }
    }
    carregarEndereco();
  }, []);

  // Lista de localidades cadastradas pela pizzaria + taxa padrão, pro cliente escolher no checkout
  useEffect(() => {
    async function carregarLocalidades() {
      if (!pizzariaId) return;
      try {
        const dados = await entregaService.listarLocalidades(pizzariaId);
        setLocalidades(dados.localidades);
        setTaxaPadrao(dados.taxaPadrao);

        // Se o endereço salvo já tem um bairro, tenta achar o ID correspondente
        // pra pré-selecionar o dropdown. Se não achar (bairro não está mais
        // cadastrado, ou nunca esteve), cai em "outro" mantendo o texto salvo.
        setEndereco((enderecoAtual) => {
          if (enderecoAtual.bairro) {
            const correspondente = dados.localidades.find(
              (l) => l.bairro === enderecoAtual.bairro
            );
            setSelecaoLocalidadeId(correspondente ? correspondente.id : OUTRO_BAIRRO);
          }
          return enderecoAtual;
        });
      } catch {
        setLocalidades([]);
        setTaxaPadrao(null);
      } finally {
        setCarregandoLocalidades(false);
      }
    }
    carregarLocalidades();
  }, [pizzariaId]);

  function atualizarCampo(campo: keyof Endereco, valor: string) {
    setEndereco((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleSelecionarLocalidade(valor: string) {
    setSelecaoLocalidadeId(valor);
    if (valor !== OUTRO_BAIRRO) {
      // Localidade veio da lista cadastrada — o nome oficial vai pro endereço
      // (só como informação de exibição/entrega, não é mais usado pra calcular taxa)
      const localidade = localidades.find((l) => l.id === valor);
      setEndereco((prev) => ({ ...prev, bairro: localidade?.bairro || '' }));
    } else {
      // "Outro" — limpa pra o cliente digitar o nome real do bairro dele
      setEndereco((prev) => ({ ...prev, bairro: '' }));
    }
  }

  function handleTrocarTipoPedido(tipo: TipoPedido) {
    setTipoPedido(tipo);
    setErro('');
  }

  function handleTrocarFormaPagamento(forma: FormaPagamento) {
    setFormaPagamento(forma);
    if (forma !== 'dinheiro') {
      setTrocoPara('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (!pizzariaId) {
      setErro('Não foi possível identificar a pizzaria do carrinho. Volte ao cardápio e tente novamente.');
      return;
    }

    if (items.length === 0) {
      setErro('Seu carrinho está vazio.');
      return;
    }

    if (tipoPedido === 'entrega' && (!endereco.cep || !endereco.numero || !endereco.rua || !endereco.bairro)) {
      setErro('Preencha CEP, número, rua e bairro para continuar.');
      return;
    }

    if (tipoPedido === 'mesa' && !numeroMesa.trim()) {
      setErro('Informe o número da mesa para continuar.');
      return;
    }

    if (formaPagamento === 'dinheiro' && trocoPara && Number(trocoPara) < total) {
      setErro('O valor do troco não pode ser menor que o total do pedido.');
      return;
    }

    setEnviando(true);

    try {
      if (tipoPedido === 'entrega') {
        await enderecoService.salvar(endereco);
      }

      const localidadeIdValida =
        selecaoLocalidadeId && selecaoLocalidadeId !== OUTRO_BAIRRO
          ? selecaoLocalidadeId
          : undefined;

      await orderService.criarPedido({
        pizzaria_id: pizzariaId,
        forma_pagamento: formaPagamento,
        troco_para: formaPagamento === 'dinheiro' && trocoPara ? Number(trocoPara) : undefined,
        observacoes: observacoes || undefined,
        tipo_pedido: tipoPedido,
        endereco: tipoPedido === 'entrega' ? endereco : undefined,
        localidade_id: tipoPedido === 'entrega' ? localidadeIdValida : undefined,
        numero_mesa: tipoPedido === 'mesa' ? numeroMesa.trim() : undefined,
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
            <span className="text-gray-600 text-sm">Subtotal</span>
            <span className="text-sm">{formatarPreco(subtotal)}</span>
          </div>
          {tipoPedido === 'entrega' && (
            <div className="flex justify-between px-1">
              <span className="text-gray-600 text-sm">Taxa de entrega</span>
              <span className="text-sm">
                {!selecaoLocalidadeId
                  ? 'Selecione o bairro'
                  : taxaEntrega !== null
                    ? formatarPreco(taxaEntrega)
                    : 'A calcular'}
              </span>
            </div>
          )}
          <div className="flex justify-between mt-1 px-1">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">{formatarPreco(total)}</span>
          </div>
        </section>

        {/* Tipo de pedido */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Como você quer receber?</h2>
          <div className="flex gap-3">
            {tiposPedido.map((tipo) => (
              <button
                type="button"
                key={tipo.valor}
                onClick={() => handleTrocarTipoPedido(tipo.valor)}
                className={`flex-1 flex items-center justify-center gap-2 border rounded-lg py-2 text-sm font-medium transition-colors ${
                  tipoPedido === tipo.valor
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 hover:border-red-300'
                }`}
              >
                {tipo.icone}
                {tipo.label}
              </button>
            ))}
          </div>
        </section>

        {/* Endereço de entrega — só aparece quando tipo_pedido === 'entrega' */}
        {tipoPedido === 'entrega' && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FiMapPin className="text-red-600" size={18} />
              Endereço de entrega
            </h2>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              {carregandoLocalidades ? (
                <p className="text-sm text-gray-400">Carregando bairros...</p>
              ) : (
                <select
                  value={selecaoLocalidadeId}
                  onChange={(e) => handleSelecionarLocalidade(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="" disabled>
                    Selecione seu bairro
                  </option>
                  {localidades.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.bairro}
                    </option>
                  ))}
                  <option value={OUTRO_BAIRRO}>Meu bairro não está na lista</option>
                </select>
              )}
            </div>

            {selecaoLocalidadeId === OUTRO_BAIRRO && (
              <div className="mb-3">
                <input
                  placeholder="Digite o nome do seu bairro"
                  value={endereco.bairro}
                  onChange={(e) => atualizarCampo('bairro', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Como seu bairro não está cadastrado, será cobrada a taxa de entrega padrão.
                </p>
              </div>
            )}

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
        )}

        {/* Número da mesa — só aparece quando tipo_pedido === 'mesa' */}
        {tipoPedido === 'mesa' && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <FiGrid className="text-red-600" size={18} />
              Número da mesa
            </h2>
            <input
              placeholder="Ex: 5"
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </section>
        )}

        {/* Forma de pagamento */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Forma de pagamento</h2>
          <div className="flex gap-3">
            {(['pix', 'cartao', 'dinheiro'] as FormaPagamento[]).map((forma) => (
              <button
                type="button"
                key={forma}
                onClick={() => handleTrocarFormaPagamento(forma)}
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

          {formaPagamento === 'dinheiro' && (
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">
                Troco para quanto? (opcional)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Deixe em branco se não precisar de troco"
                value={trocoPara}
                onChange={(e) => setTrocoPara(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              {trocoPara && Number(trocoPara) < total && (
                <p className="text-xs text-red-600 mt-1">
                  O valor informado é menor que o total do pedido ({formatarPreco(total)}).
                </p>
              )}
            </div>
          )}
        </section>

        {/* Observações */}
        <section>
          <label className="block text-lg font-semibold text-gray-900 mb-3">Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: sem cebola..."
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