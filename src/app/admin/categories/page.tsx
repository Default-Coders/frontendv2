'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Tags, Plus, Search, Edit, Trash2, ShieldAlert, X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Pagination, paginate } from '@/components/pagination';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { toast } from 'react-toastify';
import { confirmToast } from '@/components/confirm-toast';

const PAGE_SIZE = 6;

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEscapeKey(() => {
    if (editingCategory) setEditingCategory(null);
    else if (showCreateModal) setShowCreateModal(false);
    else if (search) {
      setSearch('');
      setPage(1);
    }
  });

  async function loadCategories(query = '') {
    try {
      setLoading(true);
      const endpoint = query.trim()
        ? `/categorias/search?name=${encodeURIComponent(query)}`
        : '/categorias';
      const data = await apiFetch<Category[]>(endpoint);
      setCategories(data);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao carregar categorias.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCategories(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function openCreateModal() {
    setName('');
    setDescription('');
    setShowCreateModal(true);
  }

  function openEditModal(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      await apiFetch('/categorias', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      setFeedback({ type: 'success', text: 'Categoria criada com sucesso!' });
      setShowCreateModal(false);
      await loadCategories(search);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao criar categoria.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setFeedback(null);
    setSaving(true);
    try {
      await apiFetch(`/categorias/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });
      setFeedback({ type: 'success', text: 'Categoria atualizada com sucesso!' });
      setEditingCategory(null);
      await loadCategories(search);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao atualizar categoria.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSoftDelete(id: string, catName: string) {
    if (!(await confirmToast({ message: `Deseja desativar a categoria “${catName}”?`, confirmLabel: 'Desativar' }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
      toast.success('Categoria desativada com sucesso.');
      await loadCategories(search);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desativar categoria.');
    }
  }

  async function handlePermanentDelete(id: string, catName: string) {
    if (!(await confirmToast({ message: `Excluir definitivamente a categoria “${catName}”? Esta ação não pode ser desfeita.`, confirmLabel: 'Excluir' }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/categorias/${id}/permanent`, { method: 'DELETE' });
      toast.success('Categoria excluída permanentemente.');
      await loadCategories(search);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria definitivamente.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="h-6 w-6 text-blue-600" />
            Gestão de Categorias
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize o catálogo por temas e áreas do conhecimento.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
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
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            Fechar
          </button>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Pesquisar categoria por nome..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Grid de Categorias */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Tags className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">Nenhuma categoria encontrada.</p>
        </div>
      ) : (
        <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginate(categories, page, PAGE_SIZE).map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(cat)}
                  title="Editar Categoria"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSoftDelete(cat.id, cat.name)}
                  title="Desativar Categoria"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePermanentDelete(cat.id, cat.name)}
                  title="Excluir Definitivamente"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <ShieldAlert className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <Pagination page={page} totalItems={categories.length} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="categorias" />
        </div>
        </>
      )}

      {/* Modal Criar */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Criar Categoria</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Literatura Brasileira"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrição da categoria..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Editar Categoria</h3>
              <button onClick={() => setEditingCategory(null)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nome</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Atualizando...' : 'Atualizar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
