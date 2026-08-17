import { FiMail, FiMessageCircle } from 'react-icons/fi';

export function DashboardFooter() {
  return (
    <footer className="bg-gray-900 mt-10">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white/10">JS</div>
          <div>
            <p className="text-sm font-semibold text-white">Fornomenu</p>
            <p className="text-xs text-white/40">Desenvolvido e mantido por Josué Soares</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="mailto:josue.bezerra.2020@gmail.com" className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-full px-3.5 py-2 transition-colors">
            <FiMail size={14} />
            <span>E-mail</span>
          </a>
          <a href="https://wa.me/5588981185172" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-500 rounded-full px-3.5 py-2 transition-colors">
            <FiMessageCircle size={14} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
}