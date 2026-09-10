'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Moon, Sun } from 'lucide-react';
import { setAuthData } from '@/lib/auth';
import { PasswordInput } from '@/components/password-input';
import { toggleTheme } from '@/lib/theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Credenciais inválidas. Tente novamente.');
      }

      const data = await response.json();
      setAuthData(data.role, data.name, data.email, data.firstLogin);

      if (data.firstLogin) {
        router.push('/primeiro-acesso');
        return;
      }

      if (data.role === 'ROLE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/aluno/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar entre tema claro e escuro"
        title="Alternar tema"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm backdrop-blur transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:right-6 sm:top-6"
      >
        <Sun className="hidden h-4 w-4 dark:block" />
        <Moon className="h-4 w-4 dark:hidden" />
      </button>
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <Image
            src="/ete-logo.png"
            alt="Logo da ETE - Escola Técnica Estadual"
            width={240}
            height={130}
            priority
            className="mx-auto mb-2 h-32 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Biblioteca Virtual
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Acesse sua conta para continuar
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <PasswordInput
                leftIcon={<Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            <div className="flex justify-end pt-1">
              <span
                title="A recuperação segura por e-mail está em configuração."
                className="text-sm text-zinc-400"
              >
                Recuperação de senha indisponível
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="flex items-center gap-3 py-1" aria-hidden="true">
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">ou</span>
            <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Ainda não possui uma conta?{' '}
            <button
              type="button"
              className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-900"
            >
              Faça seu cadastro
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
