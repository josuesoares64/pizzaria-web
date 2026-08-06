"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReciboPedido from "./ReciboPedido";
import { orderService } from "@/server/order.service";
import { Order } from "@/types/order";

export default function ImpressaoAutomatica({
  pedidos,
  ativo,
  larguraCupom,
  nomePizzaria,
  onImprimir,
}: {
  pedidos: Order[];
  ativo: boolean;
  larguraCupom: "58mm" | "80mm";
  nomePizzaria: string;
  onImprimir: (pedido: Order) => void;
}) {
  const [montado, setMontado] = useState(false);
  const [fila, setFila] = useState<Order[]>([]);
  const [imprimindo, setImprimindo] = useState<Order | null>(null);
  const jaProcessados = useRef<Set<string>>(new Set());
  const linhaDeBaseDefinida = useRef(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "print-page-size-auto";
    style.innerHTML = `@page { size: ${larguraCupom} auto; margin: 0; }`;
    document.head.appendChild(style);
    return () => {
      document.getElementById("print-page-size-auto")?.remove();
    };
  }, [larguraCupom]);

  useEffect(() => {
    if (!ativo) return;

    if (!linhaDeBaseDefinida.current) {
      pedidos.forEach((p) => jaProcessados.current.add(p.id));
      linhaDeBaseDefinida.current = true;
      return;
    }

    const novos = pedidos.filter(
      (p) => !p.impresso_em && !jaProcessados.current.has(p.id)
    );
    if (novos.length === 0) return;

    novos.forEach((p) => jaProcessados.current.add(p.id));
    setFila((prev) => [...prev, ...novos]);
  }, [pedidos, ativo]);

  useEffect(() => {
    if (!ativo) {
      linhaDeBaseDefinida.current = false;
    }
  }, [ativo]);

  useEffect(() => {
    if (imprimindo || fila.length === 0) return;
    const proximo = fila[0];
    setFila((prev) => prev.slice(1));
    setImprimindo(proximo);
  }, [fila, imprimindo]);

  useEffect(() => {
    if (!imprimindo) return;

    let cancelado = false;

    function finalizar() {
      if (cancelado) return;
      window.removeEventListener("afterprint", finalizar);
      (async () => {
        try {
          await orderService.marcarComoImpresso(imprimindo!.id);
        } catch {
          // se der erro ao marcar, não trava a fila — só não fica registrado como impresso
        }
        onImprimir(imprimindo!);
        setImprimindo(null);
      })();
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelado) return;
        window.addEventListener("afterprint", finalizar);
        window.print();
      });
    });

    return () => {
      cancelado = true;
      window.removeEventListener("afterprint", finalizar);
    };
  }, [imprimindo, onImprimir]);

  if (!montado || !imprimindo) return null;

  return createPortal(
    <div style={{ position: "fixed", left: "-9999px", top: 0 }} className="print-cupom-area">
      <div id="recibo-para-imprimir">
        <ReciboPedido pedido={imprimindo} larguraCupom={larguraCupom} nomePizzaria={nomePizzaria} />
      </div>
    </div>,
    document.body
  );
}