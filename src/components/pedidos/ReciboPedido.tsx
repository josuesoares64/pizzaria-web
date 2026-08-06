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
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalNumero = Number(pedido.total);
  const trocoParaNumero = pedido.troco_para ? Number(pedido.troco_para) : null;

  const temEndereco = Boolean(pedido.endereco_rua && pedido.endereco_numero);

  return (
    <div
      className={`font-mono text-black bg-white mx-auto ${
        larguraCupom === "58mm" ? "w-[58mm] text-[10px]" : "w-[80mm] text-[11px]"
      }`}
      style={{ padding: "4mm" }}
    >
      <div className="text-center mb-2">
        <p className="font-bold text-sm">{nomePizzaria}</p>
        <p>{horario}</p>
        <p className="mt-1">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="border-t border-dashed border-black my-1" />

      {pedido.cliente && (
        <div className="mb-1">
          <p>{pedido.cliente.nome}</p>
          <p>{pedido.cliente.telefone}</p>
        </div>
      )}

      {temEndereco && (
        <div className="mb-1">
          <p>
            {pedido.endereco_rua}, {pedido.endereco_numero}
          </p>
          <p>{pedido.endereco_bairro}</p>
          {pedido.endereco_complemento && <p>{pedido.endereco_complemento}</p>}
          {pedido.endereco_referencia && <p>Ref: {pedido.endereco_referencia}</p>}
        </div>
      )}

      <div className="border-t border-dashed border-black my-1" />

      <div className="mb-1">
        {pedido.itens.map((item) => (
          <div key={item.id} className="mb-1">
            <p className="font-bold">
              {item.quantidade}x {item.produto.nome}
              {item.produtoSegundoSabor ? ` / ${item.produtoSegundoSabor.nome}` : ""}
            </p>
            {item.tamanho && <p className="pl-2">Tam: {item.tamanho.nome}</p>}
            {item.borda && <p className="pl-2">Borda: {item.borda.nome}</p>}
            {item.observacoes && <p className="pl-2">Obs: {item.observacoes}</p>}
            <p className="text-right">{formatarMoeda(Number(item.subtotal))}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-1" />

      {pedido.observacoes && (
        <div className="mb-1">
          <p className="font-bold">Obs. do pedido:</p>
          <p>{pedido.observacoes}</p>
        </div>
      )}

      <div className="border-t border-dashed border-black my-1" />

      <div className="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>{formatarMoeda(totalNumero)}</span>
      </div>

      <p className="mt-1">Pagamento: {FORMA_PAGAMENTO_LABEL[pedido.forma_pagamento]}</p>

      {pedido.forma_pagamento === "dinheiro" && (
        <>
          {trocoParaNumero ? (
            <>
              <p>Troco para: {formatarMoeda(trocoParaNumero)}</p>
              <p className="font-bold">Levar: {formatarMoeda(trocoParaNumero - totalNumero)}</p>
            </>
          ) : (
            <p>Não precisa de troco</p>
          )}
        </>
      )}
    </div>
  );
}