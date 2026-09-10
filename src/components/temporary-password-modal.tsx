"use client";

import { Check, Copy, KeyRound, X } from "lucide-react";
import { useState } from "react";

export function TemporaryPasswordModal({
  userName,
  password,
  emailSent,
  onClose,
}: {
  userName: string;
  password: string;
  emailSent: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><KeyRound className="h-5 w-5" /></span>
            <div><h2 className="font-bold">Senha temporária criada</h2><p className="mt-1 text-sm text-slate-500">Usuário: {userName}</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">{emailSent ? 'A senha também foi enviada ao e-mail cadastrado.' : 'O e-mail não foi enviado. Copie e entregue a senha por um canal seguro.'} Esta senha não poderá ser consultada novamente.</p>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <code className="min-w-0 flex-1 break-all font-mono text-sm font-bold">{password}</code>
          <button type="button" onClick={copyPassword} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600 text-white" aria-label="Copiar senha temporária">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Concluído</button>
      </div>
    </div>
  );
}
