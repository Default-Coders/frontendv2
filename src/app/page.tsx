'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  GraduationCap,
  Lock,
  Mail,
  Moon,
  Phone,
  Sparkles,
  Sun,
  User,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { setAuthData } from '@/lib/auth';
import { PasswordInput } from '@/components/password-input';
import { toggleTheme } from '@/lib/theme';

const COURSES = [
  { value: 'SYSTEMS_DEVELOPMENT', label: 'Desenvolvimento de Sistemas' },
  { value: 'NUTRITION_AND_DIETETICS', label: 'Nutrição e Dietética' },
];

const CLASSES = [
  { value: 'FIRST_A', label: '1º A' },
  { value: 'FIRST_B', label: '1º B' },
  { value: 'SECOND_A', label: '2º A' },
  { value: 'SECOND_B', label: '2º B' },
  { value: 'THIRD_A', label: '3º A' },
  { value: 'THIRD_B', label: '3º B' },
];

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function LandingPage() {
  const [step, setStep] = useState<'logo' | 'welcome' | 'auth'>('logo');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // State Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Cadastro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCourse, setRegCourse] = useState(COURSES[0].value);
  const [regSchoolClass, setRegSchoolClass] = useState(CLASSES[0].value);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Gerenciamento de rolagem por mouse (wheel) entre Logo e Boas-Vindas
  useEffect(() => {
    let isThrottled = false;

    const handleWheel = (e: WheelEvent) => {
      if (step === 'auth' || isThrottled) return;

      if (e.deltaY > 20 && step === 'logo') {
        isThrottled = true;
        setStep('welcome');
        setTimeout(() => {
          isThrottled = false;
        }, 700);
      } else if (e.deltaY < -20 && step === 'welcome') {
        isThrottled = true;
        setStep('logo');
        setTimeout(() => {
          isThrottled = false;
        }, 700);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [step]);

  // Gerenciamento de gestos touch para mobile
  useEffect(() => {
    let touchStartY = 0;
    let isThrottled = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (step === 'auth' || isThrottled) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (deltaY > 40 && step === 'logo') {
        isThrottled = true;
        setStep('welcome');
        setTimeout(() => {
          isThrottled = false;
        }, 700);
      } else if (deltaY < -40 && step === 'welcome') {
        isThrottled = true;
        setStep('logo');
        setTimeout(() => {
          isThrottled = false;
        }, 700);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [step]);

  // Trava/Libera a rolagem do corpo do documento
  useEffect(() => {
    if (step === 'auth') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [step]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/login`,
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
      setAuthData(data.role, data.name, data.email);
      toast.success(`Bem-vindo(a), ${data.name}!`);

      if (data.role === 'ROLE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/aluno/dashboard');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: regName,
            email: regEmail,
            password: regPassword,
            phone: regPhone,
            course: regCourse,
            schoolClass: regSchoolClass,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || 'Erro ao realizar cadastro. Tente novamente.');
      }

      const data = await response.json();
      setAuthData(data.role, data.name, data.email);
      toast.success('Cadastro realizado com sucesso! Redirecionando...');

      setTimeout(() => {
        router.push('/aluno/dashboard');
      }, 1000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao cadastrar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Botão de Alternar Tema */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar entre tema claro e escuro"
        title="Alternar tema"
        className="fixed right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-600 shadow-sm backdrop-blur transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:right-6 sm:top-6"
      >
        <Sun className="hidden h-4 w-4 dark:block" />
        <Moon className="h-4 w-4 dark:hidden" />
      </button>

      {/* SEÇÃO 1: LOGO E APRESENTAÇÃO INICIAL */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center transition-all duration-700 ease-in-out ${
          step === 'logo'
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 -translate-y-12 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center space-y-6 max-w-lg">
          <div className="relative p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg backdrop-blur-md">
            <Image
              src="/ete-logo.png"
              alt="Logo da ETE - Escola Técnica Estadual"
              width={280}
              height={150}
              priority
              className="h-32 w-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Sistema de Biblioteca
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
              Escola Técnica Estadual — ETE
            </p>
          </div>

          <div className="pt-8 flex flex-col items-center space-y-3">
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline"
            >
              Role para continuar
            </button>
            <button
              onClick={() => setStep('welcome')}
              className="animate-bounce text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: MENSAGEM DE BOAS-VINDAS */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center transition-all duration-700 ease-in-out ${
          step === 'welcome'
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : step === 'logo'
            ? 'opacity-0 scale-90 translate-y-12 pointer-events-none'
            : 'opacity-0 scale-90 -translate-y-12 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center space-y-6 max-w-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Seja Bem-vindo(a)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
            Sua biblioteca escolar em um só lugar
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Explore o acervo completo de livros da ETE, acompanhe seus empréstimos, solicite reservas online e gerencie seu perfil com facilidade e rapidez.
          </p>

          <div className="pt-4 flex flex-col items-center space-y-3">
            <button
              onClick={() => setStep('auth')}
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Acessar o Sistema
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: CARD DE LOGIN E CADASTRO */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center p-4 overflow-y-auto transition-all duration-700 ease-in-out ${
          step === 'auth'
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-12 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 my-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('welcome')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <Image
              src="/ete-logo.png"
              alt="Logo da ETE"
              width={200}
              height={100}
              priority
              className="mx-auto mb-2 h-20 w-auto object-contain"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              Acesse sua conta
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {activeTab === 'login'
                ? 'Insira suas credenciais para entrar no sistema'
                : 'Preencha os campos abaixo para criar sua conta'}
            </p>
          </div>

          {/* Abas Alternáveis: Login / Cadastro */}
          <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/60">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'login'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
                activeTab === 'register'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar-se
            </button>
          </div>

          {/* Formulário de Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.edu.br"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-9 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-zinc-900 mt-2 shadow-sm"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>

              <div className="relative flex items-center justify-center py-2">
                <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 px-2">ou</span>
                <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Ainda não possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-900"
                >
                  Faça seu cadastro
                </button>
              </p>
            </form>
          )}

          {/* Formulário de Cadastro */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@escola.edu.br"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
                  <PasswordInput
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Sua senha (mínimo 6 caracteres)"
                    className="w-full pl-9 pr-10 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8 space-y-1">
                  <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    Curso Técnico
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <select
                      value={regCourse}
                      onChange={(e) => setRegCourse(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                    >
                      {COURSES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-4 space-y-1">
                  <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    Turma
                  </label>
                  <select
                    value={regSchoolClass}
                    onChange={(e) => setRegSchoolClass(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-zinc-900 mt-2 shadow-sm"
              >
                {loading ? 'Cadastrando...' : 'Criar minha conta'}
              </button>

              <div className="relative flex items-center justify-center py-2">
                <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 px-2">ou</span>
                <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-blue-400 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-900"
                >
                  Faça login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
