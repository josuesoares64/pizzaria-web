"use client";

import { Order } from "@/types/order";

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ReciboPedido({
  pedido,
  larguraCupom,
  nomePizzaria,
}: {
  pedido: Order;
  larguraCupom: "58mm" | "80mm";
  nomePizzaria: string;
}) {
  const horario = new Date(pedido.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalNumero = Number(pedido.total);
  const trocoParaNumero = pedido.troco_para ? Number(pedido.troco_para) : null;

  const temEndereco = Boolean(pedido.endereco_rua && pedido.endereco_numero);

  const subtotalNumero = pedido.itens.reduce((soma, item) => soma + Number(item.subtotal), 0);
  const taxaEntregaNumero =
    pedido.tipo_pedido === "entrega" && pedido.taxa_entrega !== undefined
      ? Number(pedido.taxa_entrega)
      : null;

  return (
    <div
      className={`font-mono text-black bg-white mx-auto leading-tight select-none ${
        larguraCupom === "58mm" ? "w-[56mm] text-[10px]" : "w-[78mm] text-[11px]"
      }`}
      style={{ padding: "3mm", boxSizing: "border-box" }}
    >
      {/* Cabeçalho da Pizzaria */}
      <div className="text-center mb-1.5">
        <p className="font-bold text-sm tracking-wide uppercase">{nomePizzaria || "PIZZARIA"}</p>
        <p className="text-[10px] text-neutral-600 mt-0.5">{horario}</p>
        <p className="font-bold text-xs mt-1">
          PEDIDO #{pedido.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Tipo de Pedido em Destaque */}
      <div className="text-center py-0.5 font-bold uppercase text-xs">
        {pedido.tipo_pedido === "entrega" && "🚚 ENTREGA / DELIVERY"}
        {pedido.tipo_pedido === "retirada" && "🏪 RETIRADA NO BALCÃO"}
        {pedido.tipo_pedido === "mesa" && `🍽️ CONSUMO NA MESA ${pedido.numero_mesa || "—"}`}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Dados do Cliente */}
      {pedido.cliente && (
        <div className="mb-1 space-y-0.5">
          <p>
            <span className="font-bold">Cliente:</span> {pedido.cliente.nome}
          </p>
          {pedido.cliente.telefone && (
            <p>
              <span className="font-bold">Tel:</span> {pedido.cliente.telefone}
            </p>
          )}
        </div>
      )}

      {/* Endereço de Entrega */}
      {pedido.tipo_pedido === "entrega" && temEndereco && (
        <div className="mt-1 pt-1 border-t border-dotted border-black/40 space-y-0.5">
          <p className="font-bold">Endereço de Entrega:</p>
          <p>
            {pedido.endereco_rua}, {pedido.endereco_numero}
          </p>
          {pedido.endereco_bairro && <p>Bairro: {pedido.endereco_bairro}</p>}
          {pedido.endereco_complemento && <p>Compl: {pedido.endereco_complemento}</p>}
          {pedido.endereco_referencia && <p>Ref: {pedido.endereco_referencia}</p>}
        </div>
      )}

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Itens do Pedido */}
      <div className="mb-1 space-y-2">
        <p className="font-bold uppercase text-[9px] tracking-wider text-neutral-600">
          ITENS DO PEDIDO
        </p>
        {pedido.itens.map((item) => (
          <div key={item.id} className="space-y-0.5">
            <div className="flex justify-between items-start font-bold">
              <span className="pr-1">
                {item.quantidade}x {item.produto.nome}
                {item.produtoSegundoSabor ? ` / ${item.produtoSegundoSabor.nome}` : ""}
              </span>
              <span className="shrink-0">{formatarMoeda(Number(item.subtotal))}</span>
            </div>
            {item.tamanho && <p className="pl-3">• Tam: {item.tamanho.nome}</p>}
            {item.borda && <p className="pl-3">• Borda: {item.borda.nome}</p>}
            {item.observacoes && (
              <p className="pl-3 font-semibold">• Obs item: {item.observacoes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Observações Gerais do Pedido */}
      {pedido.observacoes && (
        <>
          <div className="border-t border-dashed border-black my-1.5" />
          <div className="p-1 border border-black my-1">
            <p className="font-bold uppercase text-[9px]">OBSERVAÇÃO GERAL:</p>
            <p className="font-bold">{pedido.observacoes}</p>
          </div>
        </>
      )}

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Totalizadores e Taxas */}
      <div className="space-y-0.5">
        {taxaEntregaNumero !== null && (
          <>
            <div className="flex justify-between">
              <span>Subtotal dos itens</span>
              <span>{formatarMoeda(subtotalNumero)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega</span>
              <span>
                {taxaEntregaNumero === 0 ? "Grátis" : formatarMoeda(taxaEntregaNumero)}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-black/40">
          <span>TOTAL A PAGAR</span>
          <span>{formatarMoeda(totalNumero)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Pagamento e Troco */}
      <div className="space-y-0.5">
        <p>
          <span className="font-bold">Forma de Pagamento:</span>{" "}
          {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento] || pedido.forma_pagamento}
        </p>

        {pedido.forma_pagamento === "dinheiro" && (
          <div className="mt-1 pt-1 border-t border-dotted border-black/40">
            {trocoParaNumero ? (
              <>
                <p>Valor pago em dinheiro: {formatarMoeda(trocoParaNumero)}</p>
                <p className="font-bold text-xs mt-0.5">
                  LEVAR DE TROCO: {formatarMoeda(trocoParaNumero - totalNumero)}
                </p>
              </>
            ) : (
              <p className="font-bold">Não precisa de troco (valor exato)</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2" />
      <p className="text-center text-[9px]">Obrigado pela preferência!</p>
    </div>
  );
}