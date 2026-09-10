"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  RotateCcw,
  PackageCheck,
  Layers,
  Search,
  Check,
  AlertCircle,
  Archive,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ListFilter,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Pagination, paginate } from "@/components/pagination";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { toast } from "react-toastify";
import { confirmToast } from "@/components/confirm-toast";

const PAGE_SIZE = 5;

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
}

interface Reservation {
  id: string;
  active: boolean;
  student: Student;
  book: Book;
  createdAt: string;
  pickupDeadline?: string;
  pickupDate?: string;
  returnDate?: string;
  status:
    | "REQUESTED"
    | "PICKED_UP"
    | "RETURNED"
    | "CANCELLED"
    | "EXPIRED";
}

interface WaitingItem {
  id: string;
  active: boolean;
  student: Student;
  book: Book;
  position: number;
  createdAt: string;
  status: "WAITING" | "NOTIFIED" | "RESERVED" | "EXPIRED" | "CANCELLED";
}

const reservationStatusMap = {
  REQUESTED: {
    label: "Solicitada",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  PICKED_UP: {
    label: "Retirada (Empréstimo Ativo)",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  RETURNED: {
    label: "Devolvida",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  EXPIRED: {
    label: "Expirada",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
};

const waitingStatusMap = {
  WAITING: {
    label: "Aguardando",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  NOTIFIED: {
    label: "Notificado (Liberado)",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  RESERVED: {
    label: "Convertido em Reserva",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  EXPIRED: {
    label: "Expirado",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

export default function AdminReservationsPage() {
  const [activeTab, setActiveTab] = useState<"reservations" | "waiting">(
    "reservations",
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reservationsPage, setReservationsPage] = useState(1);
  const [waitingPage, setWaitingPage] = useState(1);
  const [waitingActivityFilter, setWaitingActivityFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [pickupDeadline, setPickupDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingWaiting, setEditingWaiting] = useState<WaitingItem | null>(null);
  const [waitingPosition, setWaitingPosition] = useState(1);
  const [waitingDate, setWaitingDate] = useState("");

  useEscapeKey(() => {
    if (editingWaiting) {
      setEditingWaiting(null);
      return;
    }
    if (editingReservation) {
      setEditingReservation(null);
      return;
    }
    if (!search) return;
    setSearch("");
    setReservationsPage(1);
    setWaitingPage(1);
  });

  async function loadData() {
    try {
      setLoading(true);
      const [rData, wData] = await Promise.all([
        apiFetch<Reservation[]>("/reservas?includeInactive=true").catch(() => []),
        apiFetch<WaitingItem[]>("/fila-espera?includeInactive=true").catch(() => []),
      ]);
      setReservations(rData);
      setWaitingList(wData);
    } catch (err) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados de reservas.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const requested = reservations.filter(
      (r) => r.status === "REQUESTED",
    ).length;
    const active = reservations.filter((r) => r.status === "PICKED_UP").length;
    const returned = reservations.filter((r) => r.status === "RETURNED").length;
    const inQueue = waitingList.filter(
      (w) => w.active && (w.status === "WAITING" || w.status === "NOTIFIED"),
    ).length;
    return { requested, active, returned, inQueue };
  }, [reservations, waitingList]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchSearch =
        r.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        r.book?.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && r.active) ||
        (statusFilter === "INACTIVE" && !r.active) ||
        r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reservations, search, statusFilter]);

  const filteredWaiting = useMemo(() => {
    return waitingList
      .filter((w) => {
        const matchSearch = (
          w.student?.name.toLowerCase().includes(search.toLowerCase()) ||
          w.book?.title.toLowerCase().includes(search.toLowerCase())
        );
        const matchActivity =
          waitingActivityFilter === "ALL" ||
          (waitingActivityFilter === "ACTIVE" ? w.active : !w.active);
        return matchSearch && matchActivity;
      })
      .sort(
        (first, second) =>
          first.position - second.position ||
          new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
      );
  }, [waitingList, search, waitingActivityFilter]);

  async function handlePickup(id: string) {
    if (!(await confirmToast({
      message: "Confirmar a retirada do livro pelo aluno?",
      confirmLabel: "Registrar retirada",
      danger: false,
    }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/reservas/${id}/pickup`, { method: "PATCH" });
      toast.success("Retirada registrada com sucesso! Empréstimo ativo.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar retirada.");
    }
  }

  async function handleReturn(id: string) {
    if (!(await confirmToast({
      message: "Confirmar a devolução do livro?",
      confirmLabel: "Registrar devolução",
      danger: false,
    }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/reservas/${id}/return`, { method: "PATCH" });
      toast.success("Devolução registrada com sucesso! Estoque recomposto.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar devolução.");
    }
  }

  function toDateTimeLocal(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  function openEditReservation(reservation: Reservation) {
    setEditingReservation(reservation);
    setReservationDate(toDateTimeLocal(reservation.createdAt));
    setPickupDeadline(toDateTimeLocal(reservation.pickupDeadline));
  }

  async function handleUpdateReservation(event: FormEvent) {
    event.preventDefault();
    if (!editingReservation) return;
    setSaving(true);
    try {
      await apiFetch(`/reservas/${editingReservation.id}`, {
        method: "PUT",
        body: JSON.stringify({
          createdAt: new Date(reservationDate).toISOString(),
          pickupDeadline: pickupDeadline ? new Date(pickupDeadline).toISOString() : undefined,
        }),
      });
      toast.success("Reserva atualizada com sucesso.");
      setEditingReservation(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar reserva.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReservation(reservation: Reservation) {
    const confirmed = await confirmToast({
      message: `Excluir definitivamente a reserva de “${reservation.book.title}”? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
    });
    if (!confirmed) return;
    try {
      await apiFetch(`/reservas/${reservation.id}/permanent`, { method: "DELETE" });
      toast.success("Reserva excluída definitivamente com sucesso.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir definitivamente a reserva.");
    }
  }

  function openEditWaiting(item: WaitingItem) {
    setEditingWaiting(item);
    setWaitingPosition(item.position);
    setWaitingDate(toDateTimeLocal(item.createdAt));
  }

  async function handleUpdateWaiting(event: FormEvent) {
    event.preventDefault();
    if (!editingWaiting) return;
    setSaving(true);
    try {
      await apiFetch(`/fila-espera/${editingWaiting.id}`, {
        method: "PUT",
        body: JSON.stringify({
          position: waitingPosition,
          createdAt: new Date(waitingDate).toISOString(),
        }),
      });
      toast.success("Registro da fila atualizado com sucesso.");
      setEditingWaiting(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar a fila de espera.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWaiting(item: WaitingItem, permanent: boolean) {
    const confirmed = await confirmToast({
      message: permanent
        ? `Excluir definitivamente “${item.student.name}” da fila de “${item.book.title}”? Esta ação não pode ser desfeita.`
        : `Desativar “${item.student.name}” na fila de “${item.book.title}”?`,
      confirmLabel: permanent ? "Excluir" : "Desativar",
    });
    if (!confirmed) return;
    try {
      await apiFetch(`/fila-espera/${item.id}${permanent ? "/permanent" : ""}`, { method: "DELETE" });
      toast.success(`Registro ${permanent ? "excluído definitivamente" : "desativado"} com sucesso.`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover o registro da fila.");
    }
  }

  function formatDate(str?: string) {
    if (!str) return "-";
    try {
      return new Date(str).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return str;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-blue-600" />
          Gestão de Reservas & Empréstimos
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie solicitações, retiradas na biblioteca, devoluções e a lista
          de espera global.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span className="flex-1">{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Solicitações pendentes
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.requested}
          </p>
          <p className="mt-1 text-xs text-slate-500">Aguardando retirada</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Empréstimos Ativos
            </span>
            <PackageCheck className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.active}
          </p>
          <p className="mt-1 text-xs text-slate-500">Livros com alunos</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Devoluções Concluídas
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.returned}
          </p>
          <p className="mt-1 text-xs text-slate-500">Exemplares devolvidos</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lista de Espera
            </span>
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.inQueue}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Alunos aguardando estoque
          </p>
        </article>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveTab("reservations");
            setSearch("");
            setStatusFilter("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "reservations"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Reservas ({reservations.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("waiting");
            setSearch("");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "waiting"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          }`}
        >
          <Clock className="h-4 w-4" />
          Lista de Espera ({waitingList.length})
        </button>
      </div>

      {/* Controles de Busca e Filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setReservationsPage(1);
              setWaitingPage(1);
            }}
            placeholder="Buscar por aluno ou livro..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {activeTab === "reservations" && (
          <div className="group relative w-full sm:w-56">
            <ListFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600 transition group-focus-within:text-blue-500 dark:text-blue-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setReservationsPage(1);
              }}
              aria-label="Filtrar reservas por status"
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-blue-300 hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-700 dark:hover:bg-slate-800"
            >
              <option value="ALL">Todas as reservas</option>
              <option value="ACTIVE">Reservas ativas</option>
              <option value="INACTIVE">Reservas inativas</option>
              <option disabled>──────────</option>
              <option value="REQUESTED">Solicitada</option>
              <option value="PICKED_UP">Retirada (Ativo)</option>
              <option value="RETURNED">Devolvida</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="EXPIRED">Expirada</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:rotate-180 group-focus-within:text-blue-500" />
          </div>
        )}
        {activeTab === "waiting" && (
          <div className="group relative w-full sm:w-56">
            <ListFilter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600 transition group-focus-within:text-blue-500 dark:text-blue-400" />
            <select
              value={waitingActivityFilter}
              onChange={(event) => {
                setWaitingActivityFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE");
                setWaitingPage(1);
              }}
              aria-label="Filtrar lista de espera por atividade"
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-blue-300 hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-700 dark:hover:bg-slate-800"
            >
              <option value="ALL">Ativos e inativos</option>
              <option value="ACTIVE">Somente ativos</option>
              <option value="INACTIVE">Somente inativos</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:rotate-180 group-focus-within:text-blue-500" />
          </div>
        )}
      </div>

      {/* Conteúdo da Aba 1: Reservas */}
      {activeTab === "reservations" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="w-16 px-4 py-3 text-center font-semibold">Nº</th>
                  <th className="px-6 py-3 font-semibold">Livro</th>
                  <th className="px-6 py-3 font-semibold">Data Reserva</th>
                  <th className="w-44 px-4 py-3 text-center font-semibold">Status</th>
                  <th className="w-72 px-4 py-3 text-center font-semibold">
                    Ações Rápidas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Carregando reservas...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                ) : (
                  paginate(
                    filteredReservations,
                    reservationsPage,
                    PAGE_SIZE,
                  ).map((res, index) => {
                    const statusInfo = reservationStatusMap[res.status] || {
                      label: res.status,
                      color: "bg-slate-100",
                    };

                    return (
                      <tr
                        key={res.id}
                        className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                          {(reservationsPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {res.book?.title}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                          {formatDate(res.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex h-7 w-36 items-center justify-center whitespace-nowrap rounded-md px-3 text-[10px] font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="grid w-full grid-cols-[9rem_2rem_2rem] items-center justify-between gap-2">
                            <div className="flex h-7 w-36 items-center justify-center">
                              {res.status === "REQUESTED" && (
                              <button
                                onClick={() => handlePickup(res.id)}
                                className="flex h-7 w-full items-center justify-center gap-1 whitespace-nowrap rounded-md bg-emerald-600 px-2 text-[10px] font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                              >
                                <Check className="h-3 w-3" />
                                Registrar Retirada
                              </button>
                              )}
                              {res.status === "PICKED_UP" && (
                              <button
                                onClick={() => handleReturn(res.id)}
                                className="flex h-7 w-full items-center justify-center gap-1 whitespace-nowrap rounded-md bg-blue-600 px-2 text-[10px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Registrar Devolução
                              </button>
                              )}
                            </div>
                            <button onClick={() => openEditReservation(res)} title="Editar reserva" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"><Edit className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDeleteReservation(res)} title="Excluir definitivamente" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={reservationsPage}
            totalItems={filteredReservations.length}
            pageSize={PAGE_SIZE}
            onPageChange={setReservationsPage}
            itemLabel="reservas"
          />
        </div>
      )}

      {/* Conteúdo da Aba 2: Lista de Espera */}
      {activeTab === "waiting" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold text-center">
                    Posição
                  </th>
                  <th className="px-6 py-3 font-semibold">Aluno</th>
                  <th className="px-6 py-3 font-semibold">Livro Solicitado</th>
                  <th className="px-6 py-3 font-semibold">Data de Entrada</th>
                  <th className="w-44 px-4 py-3 text-center font-semibold">Status</th>
                  <th className="w-40 px-4 py-3 text-center font-semibold">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Carregando lista de espera...
                    </td>
                  </tr>
                ) : filteredWaiting.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Nenhum registro na fila de espera.
                    </td>
                  </tr>
                ) : (
                  paginate(filteredWaiting, waitingPage, PAGE_SIZE).map(
                    (item) => {
                      const statusInfo = waitingStatusMap[item.status] || {
                        label: item.status,
                        color: "bg-slate-100",
                      };

                      return (
                        <tr
                          key={item.id}
                          className={`transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${!item.active ? "opacity-65" : ""}`}
                        >
                          <td className="px-6 py-4 text-center font-extrabold text-blue-600 dark:text-blue-400">
                            #{item.position}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {item.student?.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.student?.email}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {item.book?.title}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`inline-flex h-7 w-36 items-center justify-center whitespace-nowrap rounded-md px-3 text-[10px] font-semibold ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                            {!item.active && <span className="inline-flex h-7 items-center rounded-md bg-slate-200 px-2.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">Inativo</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.active && <button onClick={() => openEditWaiting(item)} title="Editar registro" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"><Edit className="h-3.5 w-3.5" /></button>}
                              {item.active && <button onClick={() => handleDeleteWaiting(item, false)} title="Desativar registro" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"><Archive className="h-3.5 w-3.5" /></button>}
                              <button onClick={() => handleDeleteWaiting(item, true)} title="Excluir definitivamente" className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={waitingPage}
            totalItems={filteredWaiting.length}
            pageSize={PAGE_SIZE}
            onPageChange={setWaitingPage}
            itemLabel="registros"
          />
        </div>
      )}

      {editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-reservation-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div><h2 id="edit-reservation-title" className="text-lg font-bold">Editar Reserva</h2><p className="mt-1 text-xs text-slate-500">{editingReservation.student.name} · {editingReservation.book.title}</p></div>
              <button type="button" onClick={() => setEditingReservation(null)} aria-label="Fechar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdateReservation} className="mt-5 space-y-4">
              <div><label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Data da reserva</label><input type="datetime-local" required value={reservationDate} onChange={(event) => setReservationDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-slate-700" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Prazo de retirada</label><input type="datetime-local" value={pickupDeadline} onChange={(event) => setPickupDeadline(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-slate-700" /></div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800"><button type="button" onClick={() => setEditingReservation(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar alterações"}</button></div>
            </form>
          </div>
        </div>
      )}

      {editingWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-waiting-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div><h2 id="edit-waiting-title" className="text-lg font-bold">Editar Lista de Espera</h2><p className="mt-1 text-xs text-slate-500">{editingWaiting.student.name} · {editingWaiting.book.title}</p></div>
              <button type="button" onClick={() => setEditingWaiting(null)} aria-label="Fechar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdateWaiting} className="mt-5 space-y-4">
              <div><label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Posição na fila</label><input type="number" min={1} required value={waitingPosition} onChange={(event) => setWaitingPosition(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-slate-700" /><p className="mt-1.5 text-xs text-slate-500">Ao alterar a posição, os demais alunos serão reordenados automaticamente.</p></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Data de entrada</label><input type="datetime-local" required value={waitingDate} onChange={(event) => setWaitingDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-600 dark:border-slate-700" /></div>
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800"><button type="button" onClick={() => setEditingWaiting(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar alterações"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
