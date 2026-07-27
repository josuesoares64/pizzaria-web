'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/server/order.service';
import { Order, StatusPedido } from '@/types/order';
import { FiLoader, FiAlertTriangle, FiChevronDown, FiPackage } from 'react-icons/fi';

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

const statusConfig: Record<StatusPedido, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700' },
  preparando: { label: 'Preparando', className: 'bg-orange-100 text-orange-700' },
  saiu_para_entrega: { label: 'Saiu para entrega', className: 'bg-purple-100 text-purple-700' },
  entregue: { label: 'Entregue', className: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

function nomeItem(item: Order['itens'][number]) {
  if (item.produtoSegundoSabor) {
    return `${item.produto.nome} / ${item.produtoSegundoSabor.nome}`;
  }
  return item.produto.nome;
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPedidos() {
      try {
        const data = await orderService.listarMeusPedidos();
        setPedidos(data);
      } catch {
        setErro('Não foi possível carregar seus pedidos.');
      } finally {
        setCarregando(false);
      }
    }
    carregarPedidos();
  }, []);

  function alternarExpandido(id: string) {
    setExpandidoId((atual) => (atual === id ? null : id));
  }

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-400">
        <FiLoader className="animate-spin" size={28} />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-red-600 text-center px-4">
        <FiAlertTriangle size={28} />
        <p>{erro}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24 text-gray-400 text-center px-4">
        <FiPackage size={28} />
        <p>Você ainda não fez nenhum pedido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus pedidos</h1>

      <div className="flex flex-col gap-4">
        {pedidos.map((pedido) => {
          const aberto = expandidoId === pedido.id;
          const status = statusConfig[pedido.status];

          return (
            <div key={pedido.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => alternarExpandido(pedido.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">{pedido.pizzaria.nome}</p>
                  <p className="text-xs text-gray-500">{formatarData(pedido.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="font-bold text-gray-900">{formatarPreco(pedido.total)}</span>
                  <FiChevronDown
                    className={`text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </div>
              </button>

              {aberto && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex flex-col gap-3 mb-4">
                    {pedido.itens.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.quantidade}x {nomeItem(item)}
                          </p>
                          {(item.tamanho || item.borda) && (
                            <p className="text-xs text-gray-500">
                              {[item.tamanho?.nome, item.borda?.nome].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          {item.observacoes && (
                            <p className="text-xs text-gray-400 italic">Obs: {item.observacoes}</p>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800 shrink-0 ml-3">
                          {formatarPreco(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">Endereço de entrega</p>
                    <p>
                      {pedido.endereco_rua}, {pedido.endereco_numero} — {pedido.endereco_bairro}
                    </p>
                    {pedido.endereco_complemento && <p>{pedido.endereco_complemento}</p>}
                    <p>CEP: {pedido.endereco_cep}</p>
                  </div>

                  {pedido.observacoes && (
                    <div className="border-t mt-3 pt-3 text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Observações do pedido</p>
                      <p>{pedido.observacoes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}