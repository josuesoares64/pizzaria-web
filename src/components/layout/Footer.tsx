export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-bold text-lg">Fornohub</p>
          <p className="text-sm text-white/50 mt-0.5">Cardápio digital para pizzarias</p>
        </div>
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Fornohub. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}