"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReciboPedido from "./ReciboPedido";
import { Order } from "@/types/order";

export default function ReciboModal({
  pedido,
  larguraCupom,
  nomePizzaria,
  onClose,
}: {
  pedido: Order;
  larguraCupom: "58mm" | "80mm";
  nomePizzaria: string;
  onClose: () => void;
}) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  function handleImprimir() {
    window.print();
  }

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "print-page-size";
    style.innerHTML = `@page { size: ${larguraCupom} auto; margin: 0; }`;
    document.head.appendChild(style);

    return () => {
      document.getElementById("print-page-size")?.remove();
    };
  }, [larguraCupom]);

  if (!montado) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print-cupom-area">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col w-fit print-cupom-area">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 no-print">
          <h2 className="text-sm font-semibold text-neutral-800">Preview do cupom</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-4 bg-neutral-100 print-cupom-area">
          <div id="recibo-para-imprimir">
            <ReciboPedido pedido={pedido} larguraCupom={larguraCupom} nomePizzaria={nomePizzaria} />
          </div>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-neutral-200 no-print">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-md py-2"
          >
            Fechar
          </button>
          <button
            onClick={handleImprimir}
            className="flex-1 text-sm font-medium text-white bg-neutral-800 rounded-md py-2"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}