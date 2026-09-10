'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { apiFetch } from '@/lib/api';
import { completeFirstLogin, getUserRole, isAuthenticated, isFirstLogin } from '@/lib/auth';

export default function FirstAccessPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/');
    else if (!isFirstLogin()) {
      router.replace(getUserRole() === 'ROLE_ADMIN' ? '/admin/dashboard' : '/aluno/dashboard');
    }
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmation) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Escolha uma senha diferente da senha inicial.');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/auth/first-access/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      completeFirstLogin();
      router.replace(getUserRole() === 'ROLE_ADMIN' ? '/admin/dashboard' : '/aluno/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <Image src="/ete-logo.png" alt="ETE" width={120} height={65} className="mx-auto h-14 w-auto object-contain" priority />
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <p className="text-sm">Este é seu primeiro acesso. Por segurança, altere a senha padrão antes de continuar.</p>
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold">Crie sua nova senha</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Use a senha temporária fornecida pelo administrador e escolha uma nova senha pessoal.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Senha atual" value={currentPassword} setValue={setCurrentPassword} autoComplete="current-password" />
          <Field label="Nova senha" value={newPassword} setValue={setNewPassword} autoComplete="new-password" />
          <Field label="Confirmar nova senha" value={confirmation} setValue={setConfirmation} autoComplete="new-password" />
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            <KeyRound className="h-4 w-4" />{saving ? 'Alterando...' : 'Alterar senha e continuar'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, value, setValue, autoComplete }: { label: string; value: string; setValue: (value: string) => void; autoComplete: string }) {
  return <div><label className="text-xs font-semibold uppercase text-slate-500">{label}</label><PasswordInput required minLength={6} value={value} onChange={(e) => setValue(e.target.value)} autoComplete={autoComplete} containerClassName="mt-1" className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-slate-700" /></div>;
}
