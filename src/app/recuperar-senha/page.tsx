"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock, Mail, Moon, Sun } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { apiFetch } from "@/lib/api";
import { toggleTheme } from "@/lib/theme";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmation) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/recover-password", {
        method: "POST",
        body: JSON.stringify({ email, newPassword }),
      });
      setCompleted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4 transition-colors dark:bg-zinc-950">
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

      <section className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <Image
            src="/ete-logo.png"
            alt="Logo da ETE - Escola Técnica Estadual"
            width={180}
            height={98}
            priority
            className="mx-auto h-24 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Redefinir senha
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Informe o e-mail cadastrado e escolha uma nova senha.
          </p>
        </div>

        {completed ? (
          <div className="space-y-5 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8" />
              <p className="font-medium">Senha redefinida com sucesso.</p>
              <p className="mt-1 text-sm">
                Você já pode entrar usando a nova senha.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="recovery-email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  id="recovery-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Nova senha
              </label>
              <PasswordInput
                id="new-password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                leftIcon={
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                }
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password-confirmation"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Confirmar nova senha
              </label>
              <PasswordInput
                id="password-confirmation"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="Repita a nova senha"
                leftIcon={
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                }
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
