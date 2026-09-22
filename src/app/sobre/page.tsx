'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SobrePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Espaço reservado para a animação GSAP futura
    // import gsap from 'gsap';
    // if (containerRef.current) {
    //   gsap.from(containerRef.current.children, {
    //     y: 50,
    //     opacity: 0,
    //     stagger: 0.2,
    //     duration: 1,
    //     ease: "power3.out"
    //   });
    // }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 sm:p-12 transition-colors duration-500">
      
      <div className="w-full max-w-3xl absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      <div ref={containerRef} className="max-w-3xl w-full flex flex-col gap-12 mt-16">
        
        {/* Cabeçalho */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Sobre o Projeto</h1>
          <p className="text-lg text-gray-400">
            A Biblioteca Virtual da ETE Integral é um sistema moderno de gestão de acervo desenvolvido para facilitar o acesso à leitura.
          </p>
        </div>

        {/* Nossa Missão */}
        <section className="space-y-4 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
          <h2 className="text-2xl font-bold">Nossa Missão</h2>
          <p className="text-gray-300 leading-relaxed">
            Criar uma plataforma rápida, acessível e intuitiva onde os alunos possam consultar o catálogo, fazer reservas e acompanhar seus históricos de leitura, tudo de forma digital e integrada.
          </p>
        </section>

        {/* Integrantes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Equipe de Desenvolvimento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Card de Integrante - Exemplo 1 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                E
              </div>
              <h3 className="font-semibold text-lg">Emerson</h3>
              <p className="text-sm text-gray-400">Desenvolvedor</p>
            </div>

            {/* Card de Integrante - Exemplo 2 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                I
              </div>
              <h3 className="font-semibold text-lg">Integrante 2</h3>
              <p className="text-sm text-gray-400">Design / UX</p>
            </div>

            {/* Card de Integrante - Exemplo 3 */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                I
              </div>
              <h3 className="font-semibold text-lg">Integrante 3</h3>
              <p className="text-sm text-gray-400">Backend / Banco</p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
