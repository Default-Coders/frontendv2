'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, ShieldPlus, ShieldAlert, Search, Edit, Trash2, KeyRound, RefreshCw, X, CheckCircle, AlertCircle, CalendarClock, Clock, Eye } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Pagination, paginate } from '@/components/pagination';
import { PasswordInput } from '@/components/password-input';
import { maskPhone, onlyDigits } from '@/lib/masks';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { toast } from 'react-toastify';
import { confirmToast } from '@/components/confirm-toast';
import { TemporaryPasswordModal } from '@/components/temporary-password-modal';

const PAGE_SIZE = 4;

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: string;
  schoolClass?: string;
  active?: boolean;
  firstLogin?: boolean;
}

interface CreatedUser {
  name: string;
  temporaryPassword: string;
  emailSent: boolean;
}

interface Reservation {
  id: string;
  book: { title: string };
  createdAt: string;
  status: string;
  student?: { id: string };
}

interface WaitingItem {
  id: string;
  book: { title: string };
  position: number;
  status: string;
  student?: { id: string };
}

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

function courseToApi(value?: string) {
  if (value === 'Desenvolvimento de Sistemas') return 'SYSTEMS_DEVELOPMENT';
  if (value === 'Nutrição e Dietética') return 'NUTRITION_AND_DIETETICS';
  return value || 'SYSTEMS_DEVELOPMENT';
}

function classToApi(value?: string) {
  const labels: Record<string, string> = {
    '1º A': 'FIRST_A', '1º B': 'FIRST_B',
    '2º A': 'SECOND_A', '2º B': 'SECOND_B',
    '3º A': 'THIRD_A', '3º B': 'THIRD_B',
  };
  return labels[value || ''] || value || 'FIRST_A';
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [courseFilter, setCourseFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modais
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [temporaryCredential, setTemporaryCredential] = useState<{ name: string; password: string; emailSent: boolean } | null>(null);

  // Histórico do Aluno
  const [studentReservations, setStudentReservations] = useState<Reservation[]>([]);
  const [studentWaitlist, setStudentWaitlist] = useState<WaitingItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states (Student Create/Edit)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('SYSTEMS_DEVELOPMENT');
  const [schoolClass, setSchoolClass] = useState('FIRST_A');

  // Form states (Admin Create)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEscapeKey(() => {
    if (temporaryCredential) setTemporaryCredential(null);
    else if (historyStudent) setHistoryStudent(null);
    else if (resetPasswordStudent) setResetPasswordStudent(null);
    else if (editingStudent) setEditingStudent(null);
    else if (showAdminModal) setShowAdminModal(false);
    else if (showStudentModal) setShowStudentModal(false);
    else if (search) {
      setSearch('');
      setPage(1);
    }
  });

  // Form states (Password Reset)
  const [newPassword, setNewPassword] = useState('');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('query', search.trim());
      params.append('includeInactive', 'true');
      if (courseFilter) params.append('course', courseFilter);
      if (classFilter) params.append('schoolClass', classFilter);

      const data = await apiFetch<Student[]>(`/alunos?${params.toString()}`);
      setStudents(data);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao carregar alunos.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, classFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter === 'ACTIVE') return s.active !== false;
      if (statusFilter === 'INACTIVE') return s.active === false;
      return true;
    });
  }, [students, statusFilter]);

  function openCreateStudentModal() {
    setName('');
    setEmail('');
    setPhone('');
    setCourse('SYSTEMS_DEVELOPMENT');
    setSchoolClass('FIRST_A');
    setShowStudentModal(true);
  }

  function openCreateAdminModal() {
    setAdminName('');
    setAdminEmail('');
    setShowAdminModal(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setName(student.name);
    setEmail(student.email);
    setPhone(maskPhone(student.phone));
    setCourse(courseToApi(student.course));
    setSchoolClass(classToApi(student.schoolClass));
  }

  function openResetPasswordModal(student: Student) {
    setResetPasswordStudent(student);
    setNewPassword('');
  }

  async function openHistoryModal(student: Student) {
    setHistoryStudent(student);
    setHistoryLoading(true);
    try {
      const [resAll, waitAll] = await Promise.all([
        apiFetch<Reservation[]>('/reservas').catch(() => []),
        apiFetch<WaitingItem[]>('/fila-espera').catch(() => []),
      ]);
      setStudentReservations(resAll.filter((r) => r.student?.id === student.id));
      setStudentWaitlist(waitAll.filter((w) => w.student?.id === student.id));
    } catch {
      setStudentReservations([]);
      setStudentWaitlist([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleCreateStudent(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const created = await apiFetch<CreatedUser>('/alunos', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone: onlyDigits(phone, 11),
          course,
          schoolClass,
        }),
      });
      setTemporaryCredential({ name: created.name, password: created.temporaryPassword, emailSent: created.emailSent });
      setFeedback({ type: 'success', text: 'Aluno cadastrado com senha temporária.' });
      setShowStudentModal(false);
      await loadStudents();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao cadastrar aluno.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAdmin(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const created = await apiFetch<CreatedUser>('/administradores', {
        method: 'POST',
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
        }),
      });
      setTemporaryCredential({ name: created.name, password: created.temporaryPassword, emailSent: created.emailSent });
      setFeedback({ type: 'success', text: 'Administrador cadastrado com senha temporária.' });
      setShowAdminModal(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao cadastrar administrador.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEditStudent(e: FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;
    setFeedback(null);
    setSaving(true);
    try {
      await apiFetch(`/alunos/${editingStudent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          phone: onlyDigits(phone, 11),
          course,
          schoolClass,
        }),
      });
      setFeedback({ type: 'success', text: 'Dados do aluno atualizados com sucesso!' });
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao atualizar aluno.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetPasswordStudent) return;
    setFeedback(null);
    setSaving(true);
    try {
      const result = await apiFetch<{ emailSent: boolean }>(`/alunos/${resetPasswordStudent.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });
      setFeedback({
        type: 'success',
        text: result.emailSent ? `Senha de "${resetPasswordStudent.name}" redefinida e enviada por e-mail.` : 'Senha redefinida, mas o e-mail não foi enviado. Entregue-a por outro canal seguro.',
      });
      setResetPasswordStudent(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao redefinir senha do aluno.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivateStudent(id: string, sName: string) {
    if (!confirm(`Deseja reativar a conta do aluno "${sName}"?`)) return;
    setFeedback(null);
    try {
      await apiFetch(`/alunos/${id}/reactivate`, { method: 'PATCH' });
      setFeedback({ type: 'success', text: 'Conta do aluno reativada com sucesso.' });
      await loadStudents();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao reativar aluno.',
      });
    }
  }

  async function handleDeleteStudent(id: string, sName: string) {
    if (!(await confirmToast({ message: `Deseja desativar o cadastro de “${sName}”?`, confirmLabel: 'Desativar' }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/alunos/${id}`, { method: 'DELETE' });
      toast.success('Aluno desativado com sucesso.');
      await loadStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao desativar aluno.');
    }
  }

  async function handlePermanentDeleteStudent(id: string, sName: string) {
    if (!(await confirmToast({
      message: `Excluir definitivamente o aluno “${sName}”? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
    }))) return;
    setFeedback(null);
    try {
      await apiFetch(`/alunos/${id}/permanent`, { method: 'DELETE' });
      toast.success('Aluno excluído.');
      await loadStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir aluno definitivamente.');
    }
  }

  function getClassLabel(val?: string) {
    const cl = CLASSES.find((item) => item.value === val);
    return cl ? cl.label : val || 'Não informada';
  }

  function getClassSummary(course?: string, schoolClass?: string) {
    const courseCode = /NUTRI|NUTRITION/i.test(course || '') ? 'NUT' : 'DS';
    const classLabel = getClassLabel(schoolClass);
    const year = classLabel.match(/[123]/)?.[0];
    const group = classLabel.match(/([AB])$/i)?.[1]?.toUpperCase();
    return year && group ? `${year}${courseCode}${group}` : '—';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestão de Alunos
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cadastre, edite, redefina senhas, consulte históricos e gerencie o status dos alunos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">          
          <button
            onClick={openCreateStudentModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <UserPlus className="h-4 w-4" />
            Novo Aluno
          </button>
        </div>
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

      {/* Controles de Filtros Avançados */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">Todos os cursos</option>
          {COURSES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Todas as turmas</option>
            {CLASSES.map((cl) => (
              <option key={cl.value} value={cl.value}>
                {cl.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'); setPage(1); }}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Status: Todos</option>
            <option value="ACTIVE">Apenas Ativos</option>
            <option value="INACTIVE">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">Aluno & E-mail</th>
                <th className="px-6 py-3 font-semibold">Turma</th>
                <th className="px-6 py-3 font-semibold">Telefone</th>
                <th className="px-6 py-3 font-semibold text-center">Primeiro acesso</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Carregando lista de alunos...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum aluno encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginate(filteredStudents, page, PAGE_SIZE).map((student) => {
                  const isActive = student.active !== false;

                  return (
                    <tr
                      key={student.id}
                      className={`transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${
                        !isActive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {getClassSummary(student.course, student.schoolClass)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                        {maskPhone(student.phone) || '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-medium">
                        {student.firstLogin ? 'Pendente' : 'Concluído'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openHistoryModal(student)}
                            title="Ver Reservas & Fila"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openResetPasswordModal(student)}
                            title="Redefinir Senha"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            title="Editar Aluno"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {isActive ? (
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              title="Desativar Aluno"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateStudent(student.id, student.name)}
                              title="Reativar Aluno"
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePermanentDeleteStudent(student.id, student.name)}
                            title="Excluir Aluno Definitivamente"
                            aria-label={`Excluir ${student.name} definitivamente`}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalItems={filteredStudents.length} pageSize={PAGE_SIZE} onPageChange={setPage} itemLabel="alunos" />
      </div>

      {/* Modal Criar Aluno */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cadastrar Novo Aluno</h3>
              <button onClick={() => setShowStudentModal(false)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">E-mail Institucional</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                  />
                </div>

              </div>

              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Uma senha temporária aleatória será exibida uma única vez após o cadastro.</p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(81) 99999-9999"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Curso Técnico</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {COURSES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Turma</label>
                  <select
                    value={schoolClass}
                    onChange={(e) => setSchoolClass(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {CLASSES.map((cl) => (
                      <option key={cl.value} value={cl.value}>
                        {cl.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Cadastrando...' : 'Cadastrar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar Administrador</h3>
              <button onClick={() => setShowAdminModal(false)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">E-mail</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Uma senha temporária aleatória será exibida uma única vez após o cadastro.</p>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Cadastrando...' : 'Cadastrar Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Aluno */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Aluno</h3>
              <button onClick={() => setEditingStudent(null)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Curso Técnico</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {COURSES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Turma</label>
                  <select
                    value={schoolClass}
                    onChange={(e) => setSchoolClass(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {CLASSES.map((cl) => (
                      <option key={cl.value} value={cl.value}>
                        {cl.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Redefinir Senha */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Redefinir Senha do Aluno</h3>
              <button onClick={() => setResetPasswordStudent(null)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redefinir senha para: <strong>{resetPasswordStudent.name}</strong> ({resetPasswordStudent.email})
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nova Senha (min. 6 car.)</label>
                <PasswordInput
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha..."
                  autoComplete="new-password"
                  containerClassName="mt-1"
                  className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResetPasswordStudent(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico do Aluno */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Histórico do Aluno</h3>
                <p className="text-xs text-slate-500">{historyStudent.name} · {historyStudent.email}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {/* Reservas */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <CalendarClock className="h-4 w-4 text-blue-600" />
                  Reservas do Aluno ({studentReservations.length})
                </h4>

                {historyLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Carregando...</p>
                ) : studentReservations.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">Nenhuma reserva encontrada para este aluno.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {studentReservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                        <div>
                          <strong className="block text-slate-900 dark:text-white">{r.book?.title}</strong>
                          <span className="text-slate-500">Solicitado em: {new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <span className="font-semibold text-blue-600">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fila de Espera */}
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Posições na Fila de Espera ({studentWaitlist.length})
                </h4>

                {historyLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Carregando...</p>
                ) : studentWaitlist.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">Aluno não está em nenhuma lista de espera no momento.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {studentWaitlist.map((w) => (
                      <div key={w.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                        <div>
                          <strong className="block text-slate-900 dark:text-white">{w.book?.title}</strong>
                          <span className="text-slate-500">Status: {w.status}</span>
                        </div>
                        <span className="font-extrabold text-blue-600">#{w.position} na fila</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {temporaryCredential && (
        <TemporaryPasswordModal
          userName={temporaryCredential.name}
          password={temporaryCredential.password}
          emailSent={temporaryCredential.emailSent}
          onClose={() => setTemporaryCredential(null)}
        />
      )}
    </div>
  );
}
