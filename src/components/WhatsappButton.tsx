'use client';

import { FaWhatsapp } from 'react-icons/fa';

interface WhatsappButtonProps {
  telefone?: string | null;
  mensagem?: string;
}

export function WhatsappButton({
  telefone,
  mensagem = 'Olá! Gostaria de tirar uma dúvida sobre o cardápio.',
}: WhatsappButtonProps) {
  if (!telefone) return null;

  const numeroLimpo = telefone.replace(/\D/g, '');
  if (!numeroLimpo) return null;

  const numeroComDDI = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
  const link = `https://wa.me/${numeroComDDI}?text=${encodeURIComponent(mensagem)}`;

  return (
    <div className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 flex items-center gap-2.5 group">
      {/* Tooltip informativo no Desktop */}
      <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full bg-white text-neutral-800 text-xs font-semibold shadow-md border border-neutral-200/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
        Dúvidas? Fale Conosco
      </span>

      {/* Botão Flutuante */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp com a pizzaria"
        className="relative w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all duration-200"
      >
        {/* Radar animado sutil */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-500 opacity-30 animate-ping pointer-events-none" />

        <FaWhatsapp size={30} className="relative z-10" />
      </a>
    </div>
  );
}