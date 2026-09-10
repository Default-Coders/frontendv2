'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, CheckCircle, Clock, Filter, Layers, Search, AlertCircle } from 'lucide-react';
import { apiFetch, assetUrl } from '@/lib/api';
import { Pagination, paginate } from '@/components/pagination';
import { useEscapeKey } from '@/hooks/use-escape-key';

const PAGE_SIZE = 9;

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string | null;
  year?: number;
  totalQuantity: number;
  availableQuantity: number;
  category?: Category;
  coverUrl?: string | null;
}

export default function StudentDashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEscapeKey(() => {
    if (!search) return;
    setSearch('');
    setPage(1);
  });

  async function loadData() {
    try {
      setLoading(true);
      const [booksData, catData] = await Promise.all([
        apiFetch<Book[]>('/livros').catch(() => []),
        apiFetch<Category[]>('/categorias').catch(() => []),
      ]);
      setBooks(booksData);
      setCategories(catData);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao carregar dados do catálogo.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchText = `${book.title} ${book.author} ${book.isbn}`.toLowerCase().includes(search.toLowerCase());
      const matchCat = !selectedCategory || book.category?.id === selectedCategory;
      return matchText && matchCat;
    });
  }, [books, search, selectedCategory]);

  async function handleReserve(book: Book) {
    setFeedback(null);
    setActionLoading(book.id);

    try {
      if (book.availableQuantity > 0) {
        await apiFetch('/reservas', {
          method: 'POST',
          body: JSON.stringify({ bookId: book.id }),
        });
        setFeedback({
          type: 'success',
          text: `Reserva do livro "${book.title}" realizada com sucesso! Confira em "Minhas Reservas".`,
        });
      } else {
        // Sem estoque -> Entrar na lista de espera
        await apiFetch('/fila-espera', {
          method: 'POST',
          body: JSON.stringify({ bookId: book.id }),
        });
        setFeedback({
          type: 'success',
          text: `Você foi adicionado à lista de espera do livro "${book.title}".`,
        });
      }
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível processar a solicitação.',
      });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Catálogo de Livros</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pesquise o acervo da escola e solicite sua reserva online.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span className="flex-1">{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Controles de Busca e Filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por título, autor ou ISBN..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="relative min-w-50">
          <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Livros */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">Nenhum livro encontrado</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tente buscar com outros termos ou selecione outra categoria.
          </p>
        </div>
      ) : (
        <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginate(filteredBooks, page, PAGE_SIZE).map((book) => {
            const hasStock = book.availableQuantity > 0;
            const isProcessing = actionLoading === book.id;

            return (
              <article
                key={book.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <Link href={`/livros/${book.id}`} aria-label={`Ver detalhes de ${book.title}`} className="relative -mx-5 -mt-5 mb-4 block h-72 overflow-hidden rounded-t-2xl bg-slate-100 p-3 dark:bg-slate-950">
                    {book.coverUrl ? (
                      <Image
                        src={assetUrl(book.coverUrl)!}
                        alt={`Capa de ${book.title}`}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-3"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
                        <BookOpen className="h-16 w-16" />
                      </div>
                    )}
                  </Link>
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      title={book.category?.name || 'Geral'}
                      className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                    >
                      <Layers className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{book.category?.name || 'Geral'}</span>
                    </span>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                        hasStock
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {hasStock ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {book.availableQuantity} {book.availableQuantity === 1 ? 'disponível' : 'disponíveis'}
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          Lista de espera
                        </>
                      )}
                    </span>
                  </div>

                  <Link href={`/livros/${book.id}`} className="mt-3 block text-lg font-bold text-slate-900 hover:text-blue-600 hover:underline dark:text-white dark:hover:text-blue-400 line-clamp-2">
                    {book.title}
                  </Link>
                  <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">{book.author}</p>

                  <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {book.publisher && <p>Editora: {book.publisher}</p>}
                    <p>ISBN: {book.isbn}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => handleReserve(book)}
                    disabled={isProcessing}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      hasStock
                        ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
                        : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.99]'
                    } disabled:opacity-50`}
                  >
                    {isProcessing ? (
                      'Processando...'
                    ) : hasStock ? (
                      'Solicitar Reserva'
                    ) : (
                      'Entrar na Fila de Espera'
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <Pagination page={page} totalItems={filteredBooks.length} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="livros" />
        </div>
        </>
      )}
    </div>
  );
}
