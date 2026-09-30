export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800/80 mt-16 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Identificação Discreta da Plataforma */}
        <div className="flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm shadow-xs">
            🍕
          </div>
          <div>
            <p className="font-extrabold text-sm tracking-tight text-white leading-tight">
              Fornomenu
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Cardápio digital para pizzarias
            </p>
          </div>
        </div>

        {/* Copyright Limpo */}
        <p className="text-[11px] text-neutral-500 font-mono">
          © {new Date().getFullYear()} Fornomenu. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}