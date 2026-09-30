import { FiMail, FiMessageCircle } from 'react-icons/fi';

export function DashboardFooter() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800/80 mt-12 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Identificação do Desenvolvedor e Plataforma */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-white/10 shadow-md">
            JS
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-extrabold tracking-tight text-white">
                Fornomenu
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Suporte Ativo
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Desenvolvido e mantido por <span className="text-neutral-300 font-medium">Josué Soares</span>
            </p>
          </div>
        </div>

        {/* Botões de Ação Rápida / Suporte */}
        <div className="flex items-center gap-2.5">
          <a
            href="mailto:josue.bezerra.2020@gmail.com"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 rounded-xl px-3.5 py-2 transition-all shadow-2xs hover:scale-102 active:scale-95"
            title="Enviar e-mail de suporte"
          >
            <FiMail size={14} className="text-neutral-300" />
            <span>E-mail</span>
          </a>

          <a
            href="https://wa.me/5588981185172"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl px-3.5 py-2 transition-all shadow-md shadow-emerald-950/20 hover:scale-102 active:scale-95"
            title="Falar no WhatsApp com o desenvolvedor"
          >
            <FiMessageCircle size={14} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
}