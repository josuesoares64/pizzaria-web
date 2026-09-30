import { useEffect, useRef } from "react";
import { Order } from "@/types/order";

interface ImpressaoAutomaticaProps {
  pedidos: Order[];
  ativo: boolean;
  larguraCupom: "58mm" | "80mm";
  nomePizzaria: string;
  onImprimir: (pedido: Order) => void;
}

export default function ImpressaoAutomatica({
  pedidos,
  ativo,
  onImprimir,
}: ImpressaoAutomaticaProps) {
  const jaProcessadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ativo) return;

    // Procura pedidos pendentes ou confirmados que ainda não foram impressos
    const novosNaoImpressos = pedidos.filter(
      (p) =>
        !p.impresso_em &&
        (p.status === "pendente" || p.status === "confirmado") &&
        !jaProcessadosRef.current.has(p.id)
    );

    if (novosNaoImpressos.length > 0) {
      novosNaoImpressos.forEach((p) => {
        jaProcessadosRef.current.add(p.id);
        onImprimir(p);
      });
    }
  }, [pedidos, ativo, onImprimir]);

  return null;
}
