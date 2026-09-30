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
import {
  FiMapPin,
  FiLoader,
  FiAlertTriangle,
  FiShoppingBag,
  FiGrid,
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiZap,
} from 'react-icons/fi';

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function tratarValorMoeda(valor: string | number | undefined | null): number | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const str = String(valor).replace(',', '.');
  const num = Number(str);
  return isNaN(num) ? undefined : num;
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

const tiposPedido: { valor: TipoPedido; label: string; icone: React.ReactNode; descricao: string }[] = [
  {
    valor: 'entrega',
    label: 'Entrega Delivery',
    icone: <FiMapPin size={17} />,
    descricao: 'No conforto da sua casa',
  },
  {
    valor: 'retirada',
    label: 'Retirar no Balcão',
    icone: <FiShoppingBag size={17} />,
    descricao: 'Buscar na pizzaria',
  },
  {
    valor: 'mesa',
    label: 'Consumo na Mesa',
    icone: <FiGrid size={17} />,
    descricao: 'Consumir no local',
  },
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
  const [buscandoCep, setBuscandoCep] = useState(false);

  // ---- Localidade e taxa de entrega segura ----
  const [localidades, setLocalidades] = useState<LocalidadeTaxa[]>([]);
  const [taxaPadrao, setTaxaPadrao] = useState<number | null>(null);
  const [carregandoLocalidades, setCarregandoLocalidades] = useState(true);
  const [selecaoLocalidadeId, setSelecaoLocalidadeId] = useState<string>('');

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const subtotal = items.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  // Taxa efetiva calculada com validação contra burla
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
      } catch {
        // Sem endereço cadastrado ainda
      } finally {
        setCarregandoEndereco(false);
      }
    }
    carregarEndereco();
  }, []);

  // Lista de localidades cadastradas pela pizzaria + taxa padrão
  useEffect(() => {
    async function carregarLocalidades() {
      if (!pizzariaId) return;
      try {
        const dados = await entregaService.listarLocalidades(pizzariaId);
        setLocalidades(dados.localidades);
        setTaxaPadrao(dados.taxaPadrao);

        setEndereco((enderecoAtual) => {
          if (enderecoAtual.bairro) {
            const correspondente = dados.localidades.find(
              (l) => l.bairro.toLowerCase() === enderecoAtual.bairro.toLowerCase()
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

  // Busca rápida de CEP no checkout
  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const cepLimpo = e.target.value.replace(/\D/g, '').slice(0, 8);
    atualizarCampo('cep', cepLimpo);

    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEndereco((prev) => {
            const novoBairro = data.bairro || prev.bairro;
            // Tenta encontrar o bairro retornado na lista da pizzaria
            const correspondente = localidades.find(
              (l) => l.bairro.toLowerCase() === novoBairro.toLowerCase()
            );
            if (correspondente) {
              setSelecaoLocalidadeId(correspondente.id);
            } else {
              setSelecaoLocalidadeId(OUTRO_BAIRRO);
            }

            return {
              ...prev,
              rua: data.logradouro || prev.rua,
              bairro: novoBairro,
            };
          });
        }
      } catch {
        // Fallback silencioso
      } finally {
        setBuscandoCep(false);
      }
    }
  }

  function handleSelecionarLocalidade(valor: string) {
    setSelecaoLocalidadeId(valor);
    if (valor !== OUTRO_BAIRRO) {
      const localidade = localidades.find((l) => l.id === valor);
      setEndereco((prev) => ({ ...prev, bairro: localidade?.bairro || '' }));
    } else {
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
      setErro('Não foi possível identificar a pizzaria. Volte ao cardápio e tente novamente.');
      return;
    }

    if (items.length === 0) {
      setErro('Sua sacola está vazia.');
      return;
    }

    if (tipoPedido === 'entrega') {
      if (!endereco.cep || !endereco.numero || !endereco.rua || !endereco.bairro) {
        setErro('Preencha CEP, número, rua e bairro para prosseguir com a entrega.');
        return;
      }
    }

    if (tipoPedido === 'mesa' && !numeroMesa.trim()) {
      setErro('Informe o número da sua mesa para podermos levar o pedido.');
      return;
    }

    const trocoNum = tratarValorMoeda(trocoPara);
    if (formaPagamento === 'dinheiro' && trocoNum !== undefined && trocoNum < total) {
      setErro(`O valor do troco não pode ser menor que o total do pedido (${formatarPreco(total)}).`);
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
        troco_para: formaPagamento === 'dinheiro' && trocoNum ? trocoNum : undefined,
        observacoes: observacoes.trim() || undefined,
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

      dispatch(clearCart());
      router.push('/pedidos');
    } catch (err) {
      const mensagem = (err as { message?: string })?.message;
      setErro(mensagem || 'Erro ao finalizar o pedido. Verifique seus dados e tente novamente.');
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center text-2xl">
          🛍️
        </div>
        <h1 className="text-base font-bold text-neutral-800">Sua sacola está vazia</h1>
        <p className="text-xs text-neutral-400 max-w-xs">
          Parece que você ainda não escolheu seus produtos. Volte ao cardápio para adicionar suas pizzas!
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-2 transition-colors inline-flex items-center gap-1.5"
        >
          <FiArrowLeft />
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  if (carregandoEndereco) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2.5 text-neutral-500">
        <FiLoader className="animate-spin text-red-600" size={32} />
        <p className="text-xs font-semibold">Carregando dados de finalização...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabeçalho do Checkout */}
        <header className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 inline-flex items-center gap-1 mb-1 transition-colors"
            >
              <FiArrowLeft /> Voltar
            </button>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Finalizar Pedido
            </h1>
          </div>
          <span className="text-xs font-bold font-mono text-neutral-500 bg-white border border-neutral-200 px-3 py-1.5 rounded-full shadow-2xs">
            {items.reduce((s, i) => s + i.quantidade, 0)} itens
          </span>
        </header>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* BLOCO 1: RESUMO DO PEDIDO */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <span>🧾</span> 1. Resumo dos Itens
            </h2>

            <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden bg-neutral-50/40">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                  <div className="pr-3 min-w-0">
                    <p className="font-bold text-neutral-900 truncate">
                      {item.quantidade}x {item.nomeExibicao}
                    </p>
                    {(item.tamanhoNome || item.bordaNome) && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {[item.tamanhoNome, item.bordaNome ? `Borda ${item.bordaNome}` : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-neutral-900 shrink-0">
                    {formatarPreco(item.precoUnitario * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            {/* Linhas de totais */}
            <div className="space-y-1.5 pt-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal dos itens</span>
                <span className="font-mono">{formatarPreco(subtotal)}</span>
              </div>

              {tipoPedido === 'entrega' && (
                <div className="flex justify-between text-neutral-500">
                  <span>Taxa de entrega</span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {!selecaoLocalidadeId
                      ? 'Selecione seu bairro'
                      : taxaEntrega !== null
                      ? formatarPreco(taxaEntrega)
                      : 'Grátis'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-neutral-100 text-sm">
                <span className="font-bold text-neutral-900">Total a pagar</span>
                <span className="font-mono font-extrabold text-lg text-red-600">
                  {formatarPreco(total)}
                </span>
              </div>
            </div>
          </section>

          {/* BLOCO 2: TIPO DE PEDIDO */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <span>🛵</span> 2. Como você quer receber?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {tiposPedido.map((tipo) => {
                const selecionado = tipoPedido === tipo.valor;
                return (
                  <button
                    type="button"
                    key={tipo.valor}
                    onClick={() => handleTrocarTipoPedido(tipo.valor)}
                    className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
                      selecionado
                        ? 'border-red-600 bg-red-50/30 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={selecionado ? 'text-red-600' : 'text-neutral-400'}>
                        {tipo.icone}
                      </span>
                      {selecionado && <FiCheck className="text-red-600" size={14} />}
                    </div>
                    <p className="font-bold text-xs text-neutral-900">{tipo.label}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{tipo.descricao}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* BLOCO 3A: ENDEREÇO DE ENTREGA */}
          {tipoPedido === 'entrega' && (
            <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <FiMapPin className="text-red-600" /> 3. Endereço de Entrega
                </h2>
                <span className="text-[10px] text-neutral-400">
                  {buscandoCep ? 'Buscando CEP...' : 'Preencha os campos'}
                </span>
              </div>

              {/* Seleção Segura de Bairro */}
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Selecione seu Bairro *
                </label>
                {carregandoLocalidades ? (
                  <p className="text-xs text-neutral-400 py-2">Carregando taxas por bairro...</p>
                ) : (
                  <select
                    value={selecaoLocalidadeId}
                    onChange={(e) => handleSelecionarLocalidade(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione o bairro da entrega...
                    </option>
                    {localidades.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.bairro} — {formatarPreco(Number(loc.taxa))} de taxa
                      </option>
                    ))}
                    <option value={OUTRO_BAIRRO}>
                      Meu bairro não está na lista {taxaPadrao !== null ? `(${formatarPreco(taxaPadrao)})` : ''}
                    </option>
                  </select>
                )}
              </div>

              {selecaoLocalidadeId === OUTRO_BAIRRO && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Nome do seu bairro *
                  </label>
                  <input
                    placeholder="Digite o nome do seu bairro"
                    value={endereco.bairro}
                    onChange={(e) => atualizarCampo('bairro', e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-amber-700">
                    💡 Como este bairro não está na tabela cadastrada, será aplicada a taxa padrão da pizzaria.
                  </p>
                </div>
              )}

              {/* Grid de Campos do Endereço */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    CEP {buscandoCep && '...'}
                  </label>
                  <input
                    placeholder="00000-000"
                    value={endereco.cep}
                    onChange={handleCepChange}
                    maxLength={8}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Número *
                  </label>
                  <input
                    placeholder="Ex: 142"
                    value={endereco.numero}
                    onChange={(e) => atualizarCampo('numero', e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    placeholder="Ex: Rua das Flores"
                    value={endereco.rua}
                    onChange={(e) => atualizarCampo('rua', e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Complemento (opcional)
                  </label>
                  <input
                    placeholder="Apto 32, Bloco B..."
                    value={endereco.complemento || ''}
                    onChange={(e) => atualizarCampo('complemento', e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-neutral-400 block mb-1">
                    Ponto de Referência (opcional)
                  </label>
                  <input
                    placeholder="Próximo à padaria..."
                    value={endereco.referencia || ''}
                    onChange={(e) => atualizarCampo('referencia', e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>
          )}

          {/* BLOCO 3B: MESA (Se tipo mesa) */}
          {tipoPedido === 'mesa' && (
            <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-in fade-in duration-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <FiGrid className="text-red-600" /> 3. Identificação da Mesa
              </h2>
              <div>
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Número da Mesa *
                </label>
                <input
                  placeholder="Ex: 08"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  className="w-full max-w-xs border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </section>
          )}

          {/* BLOCO 4: FORMA DE PAGAMENTO */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <span>💳</span> 4. Forma de Pagamento
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { valor: 'pix', label: 'Pix', icone: <FiZap /> },
                { valor: 'cartao', label: 'Cartão', icone: <FiCreditCard /> },
                { valor: 'dinheiro', label: 'Dinheiro', icone: <FiDollarSign /> },
              ].map((item) => {
                const selecionado = formaPagamento === item.valor;
                return (
                  <button
                    type="button"
                    key={item.valor}
                    onClick={() => handleTrocarFormaPagamento(item.valor as FormaPagamento)}
                    className={`py-3 px-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selecionado
                        ? 'border-red-600 bg-red-50/40 text-red-700 font-bold shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700 font-medium'
                    }`}
                  >
                    <span className="text-base">{item.icone}</span>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {formaPagamento === 'dinheiro' && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Precisa de troco? Para quanto?
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 50.00 (deixe em branco se for valor exato)"
                  value={trocoPara}
                  onChange={(e) => setTrocoPara(e.target.value)}
                  className="w-full max-w-sm border border-neutral-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            )}
          </section>

          {/* BLOCO 5: OBSERVAÇÕES */}
          <section className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <span>✍️</span> 5. Observações para a Cozinha
            </h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: tirar a cebola da pizza, mandar guardanapo extra, campainha não funciona..."
              rows={2}
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-xs focus:border-red-500 focus:outline-none resize-none"
            />
          </section>

          {/* Mensagem de Erro com Alerta Visual */}
          {erro && (
            <div className="flex items-center gap-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-xl p-3.5 shadow-2xs animate-in shake">
              <FiAlertTriangle size={18} className="shrink-0 text-red-600" />
              <span className="font-semibold">{erro}</span>
            </div>
          )}

          {/* Botão de Finalização com Total */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-between active:scale-98"
            >
              <span>{enviando ? 'Enviando seu pedido...' : 'Confirmar e Enviar Pedido'}</span>
              <span className="font-mono bg-red-700/60 px-3 py-1 rounded-xl">
                {formatarPreco(total)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}