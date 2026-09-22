import Link from 'next/link';
import { Globe, MessageCircle, Gamepad2 } from 'lucide-react';

export default function StudentFooter() {
  return (
    <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold tracking-wide">
            <Link href="/sobre" className="hover:text-blue-500 text-white transition-colors">Sobre o Projeto</Link>
          </div>

          <button className="flex items-center gap-2 border border-gray-600 rounded-md px-4 py-2 hover:bg-white/10 transition-colors text-sm font-semibold">
            <Globe className="w-4 h-4" />
            Português (BR)
          </button>
        </div>

        {/* Middle Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-4 mt-8">

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-gray-300">
            <Link href="/corporativo" className="hover:text-white transition-colors">Corporativo</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Configurações de Cookies</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos e Condições</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Gamepad2 className="w-5 h-5" /></a>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 text-xs text-gray-500 font-medium">
          <div>ETE Integral</div>
          <div className="flex items-center gap-4">
            <span>Recife</span>
            <span>Pernambuco</span>
            <span>Brasil</span>
          </div>
          <div>MCMXCVIII</div>
        </div>

      </div>
    </footer>
  );
}
