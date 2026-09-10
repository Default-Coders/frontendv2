"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle, Clock, Layers, Search } from "lucide-react";
import { apiFetch, assetUrl } from "@/lib/api";
import { maskIsbn } from "@/lib/masks";
import { PublicHeader } from "@/components/public-header";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { Pagination, paginate } from "@/components/pagination";

const PAGE_SIZE = 4;

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string | null;
  publicationYear?: number;
  totalQuantity: number;
  availableQuantity: number;
  coverUrl?: string | null;
  category?: { id: string; name: string };
}

export default function ShowcasePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    apiFetch<Book[]>("/public/livros")
      .then((data) => active && setBooks(data))
      .catch((err) => active && setError(err instanceof Error ? err.message : "Não foi possível carregar os livros."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEscapeKey(() => {
    if (search) {
      setSearch("");
      setPage(1);
    }
  });

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return books;
    return books.filter((book) =>
      [book.title, book.author, book.publisher, book.isbn, book.category?.name]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase("pt-BR").includes(query)),
    );
  }, [books, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur dark:bg-slate-900/95"><PublicHeader /></div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Nosso acervo</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Vitrine de livros</h1><p className="mt-2 text-slate-600 dark:text-slate-400">Conheça os títulos disponíveis na biblioteca.</p></div>
          <div className="relative w-full sm:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por título, autor, ISBN..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-900" /></div>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[470px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center text-red-600 dark:border-red-900 dark:bg-slate-900">{error}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"><BookOpen className="mx-auto h-12 w-12 text-slate-400" /><p className="mt-4 font-semibold">Nenhum livro encontrado.</p></div>
        ) : (
          <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginate(filteredBooks, page, PAGE_SIZE).map((book) => {
              const available = book.availableQuantity > 0;
              return <Link key={book.id} href={`/livros/${book.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700">
                <div className="relative h-72 bg-slate-100 dark:bg-slate-950">{book.coverUrl ? <Image src={assetUrl(book.coverUrl)!} alt={`Capa de ${book.title}`} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-20 w-20 text-slate-300 dark:text-slate-700" /></div>}</div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2"><span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Layers className="h-3 w-3 shrink-0" /><span className="truncate">{book.category?.name || "Geral"}</span></span><span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${available ? "text-emerald-600" : "text-amber-600"}`}>{available ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}{available ? "Disponível" : "Indisponível"}</span></div>
                  <h2 className="mt-4 line-clamp-2 text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">{book.title}</h2><p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-400">{book.author}</p><p className="mt-4 text-xs text-slate-500">ISBN: {maskIsbn(book.isbn)}</p>
                </div>
              </Link>;
            })}
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Pagination
              page={page}
              totalItems={filteredBooks.length}
              pageSize={PAGE_SIZE}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              itemLabel="livros"
            />
          </div>
          </>
        )}
      </div>
    </main>
  );
}
