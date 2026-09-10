"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle,
  Hash,
  Layers,
  Library,
  Package,
  UserRound,
} from "lucide-react";
import { apiFetch, assetUrl } from "@/lib/api";
import { maskIsbn } from "@/lib/masks";
import { PublicHeader } from "@/components/public-header";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string | null;
  publicationYear?: number;
  totalQuantity: number;
  availableQuantity: number;
  qrcodeUrl?: string;
  coverUrl?: string | null;
  category?: { id: string; name: string; description?: string };
}

export default function PublicBookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<Book>(`/public/livros/${id}`)
      .then((data) => active && setBook(data))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Não foi possível carregar o livro."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <PublicHeader maxWidth="max-w-6xl" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <button type="button" onClick={() => history.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        {loading ? (
          <div className="grid animate-pulse gap-8 lg:grid-cols-[360px_1fr]">
            <div className="h-125 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-5"><div className="h-10 rounded bg-slate-200 dark:bg-slate-800" /><div className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" /></div>
          </div>
        ) : error || !book ? (
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center dark:border-red-900 dark:bg-slate-900">
            <BookOpen className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-bold">Livro não encontrado</h1>
            <p className="mt-2 text-sm text-slate-500">{error || "Este livro não está disponível no acervo."}</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950">
                {book.coverUrl ? <Image src={assetUrl(book.coverUrl)!} alt={`Capa de ${book.title}`} fill unoptimized priority className="object-contain p-4" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-24 w-24 text-slate-300 dark:text-slate-700" /></div>}
              </div>
            </div>

            <section>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Layers className="h-3.5 w-3.5" />{book.category?.name || "Sem categoria"}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${book.availableQuantity > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}><CheckCircle className="h-3.5 w-3.5" />{book.availableQuantity > 0 ? "Disponível" : "Indisponível"}</span>
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{book.title}</h1>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">por {book.author}</p>

              <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                <Info icon={UserRound} label="Autor" value={book.author} />
                <Info icon={Building2} label="Editora" value={book.publisher || "Não informada"} />
                <Info icon={CalendarDays} label="Ano de publicação" value={book.publicationYear?.toString() || "Não informado"} />
                <Info icon={Hash} label="ISBN" value={maskIsbn(book.isbn)} />
                <Info icon={Library} label="Categoria" value={book.category?.name || "Sem categoria"} />
                <Info icon={Package} label="Exemplares" value={`${book.availableQuantity} disponíveis de ${book.totalQuantity}`} />
              </div>

              {book.category?.description && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">Sobre a categoria</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{book.category.description}</p></div>}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-medium">{value}</p></div></div>;
}
