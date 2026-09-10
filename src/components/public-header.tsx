"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserName, getUserRole } from "@/lib/auth";
import { toggleTheme } from "@/lib/theme";

export function PublicHeader({ maxWidth = "max-w-7xl" }: { maxWidth?: "max-w-6xl" | "max-w-7xl" }) {
  const [user, setUser] = useState<{ name: string; dashboard: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const role = getUserRole();
      if (!role) return;
      setUser({
        name: getUserName() || (role === "ROLE_ADMIN" ? "Administrador" : "Aluno"),
        dashboard: role === "ROLE_ADMIN" ? "/admin/dashboard" : "/aluno/dashboard",
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className={`mx-auto flex h-16 ${maxWidth} items-center justify-between px-4 sm:px-6`}>
        <Link href="/" className="flex items-center gap-3" aria-label="Biblioteca Virtual">
          <Image src="/ete-logo.png" alt="ETE" width={66} height={42} className="h-10 w-auto" />
          <div><p className="font-bold leading-tight">Biblioteca Virtual</p><p className="text-xs text-slate-500 dark:text-slate-400">Bem-vindo!</p></div>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href={user.dashboard} className="rounded-xl px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50">
              {user.name} · Painel
            </Link>
          ) : (
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50">Entrar</Link>
          )}
          <button type="button" onClick={toggleTheme} aria-label="Alternar tema" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Sun className="hidden h-4 w-4 dark:block" /><Moon className="h-4 w-4 dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
