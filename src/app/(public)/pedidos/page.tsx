'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { orderService } from '@/server/order.service';
import { Order, StatusPedido } from '@/types/order';
import {
  FiLoader,
  FiAlertTriangle,
  FiChevronDown,
  FiPackage,
  FiMapPin,
  FiShoppingBag,
  FiGrid,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';

function formatarPreco(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusConfig: Record<
  StatusPedido,
  { label: string; className: string; icone?: string; pulse?: boolean }
> = {
  pendente: {
    label: 'Aguardando confirmação',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    pulse: true,
  },
  confirmado: {
    label: 'Confirmado pela pizzaria',
    className: 'bg-blue-50 text-blue-800 border-blue-200',
    pulse: true,
  },
  preparando: {
    label: 'No forno / Preparando',
    className: 'bg-orange-50 text-orange-800 border-orange-200',
    pulse: true,
  },
  saiu_para_entrega: {
    label: 'Saiu para entrega',
    className: 'bg-purple-50 text-purple-800 border-purple-200',
    pulse: true,
  },
  entregue: {
    label: 'Pedido entregue',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pulse: false,
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-50 text-red-800 border-red-200',
    pulse: false,
  },
};

const tipoPedidoConfig: Record<string, { label: string; icone: React.ReactNode }> = {
  entrega: { label: 'Entrega', icone: <FiMapPin size={12} /> },
  retirada: { label: 'Retirada no Balcão', icone: <FiShoppingBag size={12} /> },
  mesa: { label: 'Consumo na Mesa', icone: <FiGrid size={12} /> },
};

function nomeItem(item: Order['itens'][number]) {
  if (item.produtoSegundoSabor) {
    return `1/2 ${item.produto.nome} + 1/2 ${item.produtoSegundoSabor.nome}`;
  }
  return item.produto.nome;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const carregarPedidos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setAtualizando(true);
    else setCarregando(true);

    try {
      const data = await orderService.listarMeusPedidos();
      setPedidos(data);
      // Auto-expande o primeiro pedido se ele estiver ativo
      if (data.length > 0 && !isRefresh) {
        const ativo = data.find((p) =>
          ['pendente', 'confirmado', 'preparando', 'saiu_para_entrega'].includes(p.status)
        );
        if (ativo) setExpandidoId(ativo.id);
      }
      setErro('');
    } catch {
      setErro('Não foi possível carregar o histórico de pedidos.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  function alternarExpandido(id: string) {
    setExpandidoId((atual) => (atual === id ? null : id));
  }

  if (carregando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2.5 text-neutral-500">
        <FiLoader className="animate-spin text-red-600" size={32} />
        <p className="text-xs font-semibold">Carregando seus pedidos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
          <FiAlertTriangle size={26} />
        </div>
        <p className="text-sm font-bold text-neutral-800">{erro}</p>
        <button
          onClick={() => carregarPedidos()}
          className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-2 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center text-3xl">
          🍕
        </div>
        <h1 className="text-base font-bold text-neutral-800">Você ainda não fez nenhum pedido</h1>
        <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
          Quando você pedir uma pizza pelo cardápio, poderá acompanhar o status e o preparo em tempo real por aqui.
        </p>
        <Link
          href="/"
          className="mt-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl px-4 py-2.5 transition-colors shadow-2xs"
        >
          Explorar Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Topo da Página */}
        <header className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              Meus Pedidos
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Acompanhe o status e histórico de compras
            </p>
          </div>

          <button
            type="button"
            onClick={() => carregarPedidos(true)}
            disabled={atualizando}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Atualizar status"
          >
            <FiRefreshCw className={atualizando ? 'animate-spin text-red-600' : ''} size={13} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </header>

        {/* Lista de Pedidos */}
        <div className="space-y-3.5">
          {pedidos.map((pedido) => {
            const aberto = expandidoId === pedido.id;
            const status = statusConfig[pedido.status] || {
              label: pedido.status,
              className: 'bg-neutral-100 text-neutral-700 border-neutral-200',
              pulse: false,
            };
            const tipoPedido = tipoPedidoConfig[pedido.tipo_pedido] ?? tipoPedidoConfig.entrega;

            return (
              <div
                key={pedido.id}
                className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs transition-all hover:shadow-xs"
              >
                {/* Cabeçalho do Card */}
                <button
                  type="button"
                  onClick={() => alternarExpandido(pedido.id)}
                  className="w-full p-4 sm:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors select-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-neutral-900 truncate">
                        {pedido.pizzaria.nome}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        #{pedido.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <FiClock size={12} />
                        {formatarData(pedido.createdAt)}
                      </span>
                      <span className="text-neutral-200">•</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 rounded-md px-2 py-0.5">
                        {tipoPedido.icone}
                        {tipoPedido.label}
                        {pedido.tipo_pedido === 'mesa' && pedido.numero_mesa ? ` ${pedido.numero_mesa}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Status e Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="text-left sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.className}`}
                      >
                        {status.pulse && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        )}
                        {status.label}
                      </span>
                      <p className="font-mono font-black text-sm text-neutral-900 mt-1">
                        {formatarPreco(pedido.total)}
                      </p>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 transition-transform duration-200 ${
                        aberto ? 'rotate-180 bg-neutral-200 text-neutral-700' : ''
                      }`}
                    >
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </button>

                {/* Detalhes do Pedido Expansível */}
                {aberto && (
                  <div className="border-t border-neutral-100 bg-neutral-50/60 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                    {/* Lista de Itens do Pedido */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Itens do Pedido
                      </h3>
                      <div className="space-y-2">
                        {pedido.itens.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-neutral-200/80 rounded-xl p-3 flex justify-between items-start gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs sm:text-sm text-neutral-900">
                                {item.quantidade}x {nomeItem(item)}
                              </p>
                              {(item.tamanho || item.borda) && (
                                <p className="text-[11px] font-medium text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  {item.tamanho && (
                                    <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded font-mono">
                                      {item.tamanho.nome}
                                    </span>
                                  )}
                                  {item.borda && (
                                    <span className="bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                                      Borda {item.borda.nome}
                                    </span>
                                  )}
                                </p>
                              )}
                              {item.observacoes && (
                                <p className="text-[11px] text-neutral-400 italic mt-1">
                                  Obs: {item.observacoes}
                                </p>
                              )}
                            </div>
                            <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900 shrink-0 ml-2">
                              {formatarPreco(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informações de Entrega */}
                    {pedido.tipo_pedido === 'entrega' && (
                      <div className="border-t border-neutral-200/60 pt-3 text-xs text-neutral-600 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Destino da Entrega
                        </span>
                        <p className="font-semibold text-neutral-800">
                          📍 {pedido.endereco_rua}, {pedido.endereco_numero} — {pedido.endereco_bairro}
                        </p>
                        {pedido.endereco_complemento && (
                          <p className="text-neutral-500">Comp: {pedido.endereco_complemento}</p>
                        )}
                        <p className="text-neutral-400 font-mono">CEP: {pedido.endereco_cep}</p>
                      </div>
                    )}

                    {/* Informações de Retirada */}
                    {pedido.tipo_pedido === 'retirada' && (
                      <div className="border-t border-neutral-200/60 pt-3">
                        <div className="flex items-start gap-2.5 bg-blue-50/80 border border-blue-200 rounded-xl p-3">
                          <FiShoppingBag className="text-blue-600 shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs font-bold text-blue-900">Retirada no Balcão</p>
                            <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                              Aguarde a indicação de status pronto e retire diretamente na pizzaria.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informações de Mesa */}
                    {pedido.tipo_pedido === 'mesa' && (
                      <div className="border-t border-neutral-200/60 pt-3">
                        <div className="flex items-start gap-2.5 bg-purple-50/80 border border-purple-200 rounded-xl p-3">
                          <FiGrid className="text-purple-600 shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-xs font-bold text-purple-900">Consumo no Local</p>
                            <p className="text-[11px] text-purple-700 mt-0.5">
                              Mesa identificada: <strong>{pedido.numero_mesa}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Observações Gerais */}
                    {pedido.observacoes && (
                      <div className="border-t border-neutral-200/60 pt-3 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                          Observações do Pedido
                        </span>
                        <p className="text-neutral-700 bg-white p-2.5 rounded-xl border border-neutral-200/70 italic">
                          "{pedido.observacoes}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}