'use client';

import { FaWhatsapp } from 'react-icons/fa';

interface WhatsappButtonProps {
  telefone: string;
  mensagem: string;
}

export function WhatsappButton({ telefone, mensagem }: WhatsappButtonProps) {
  if (!telefone) return null;

  const numeroLimpo = telefone.replace(/\D/g, '');
  const numeroComDDI = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
  const link = `https://wa.me/${numeroComDDI}?text=${encodeURIComponent(mensagem)}`;

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200">
      <FaWhatsapp size={28} />
    </a>
  );
}