import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Plus, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Search,
  Filter, TrendingDown, TrendingUp, Settings, Loader2, Edit2, Wallet,
  Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { getCategoryInfo, CategoryIcon } from '../components/CategoryIcons';
import iconMap from '../components/CategoryIcons';

const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Expenses() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  
  // New States for Edit & Delete and Pagination
  const [showEditModal, setShowEditModal] = useState(false);
  const [txToEdit, setTxToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '', description: '', deadline: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'alimentacion', budget: '' });
  const [fundData, setFundData] = useState({ goalId: null, amount: '' });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search term to prevent extra network calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: transactionsData, isLoading: isLoadingTx } = useQuery({
    queryKey: ['transactions', currentPage, activeTab, debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/finance/transactions/', {
        params: {
          page: currentPage,
          type: activeTab,
          search: debouncedSearch
        }
      });
      return res.data;
    }
  });

  const transactions = transactionsData?.results || [];
  const totalCount = transactionsData?.count || 0;

  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => { const res = await api.get('/finance/goals/'); return res.data; }
  });

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => { const res = await api.get('/finance/dashboard/'); return res.data; }
  });

  const addGoalMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/finance/goals/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Meta creada!', description: 'La meta de ahorro se guardó exitosamente.', variant: 'success' });
      setShowGoalModal(false);
      setNewGoal({ title: '', target_amount: '', description: '', deadline: '' });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo crear la meta.', variant: 'error' })
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/finance/budgets/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: 'Presupuesto actualizado', description: 'El límite se ha configurado correctamente.', variant: 'success' });
      setShowBudgetModal(false);
      setBudgetForm({ category: 'alimentacion', budget: '' });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo actualizar el presupuesto.', variant: 'error' })
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ goalId, amount }) => {
      const res = await api.post(`/finance/goals/${goalId}/add_funds/`, { amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Aporte realizado!', description: 'Has sumado a tu meta exitosamente.', variant: 'success' });
      setShowAddFundsModal(false);
      setFundData({ goalId: null, amount: '' });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo realizar el aporte.', variant: 'error' })
  });

  const editTxMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/finance/transactions/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Actualizado!', description: 'Movimiento guardado exitosamente.', variant: 'success' });
      setShowEditModal(false);
      setTxToEdit(null);
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.[0] || 'No se pudo guardar la transacción.';
      toast({ title: 'Error', description: errMsg, variant: 'error' });
    }
  });

  const deleteTxMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/finance/transactions/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Eliminado!', description: 'El movimiento ha sido borrado.', variant: 'success' });
      setShowDeleteModal(false);
      setTxToDelete(null);
    },
    onError: (err) => {
      const errMsg = err?.response?.data?.[0] || 'No se pudo eliminar el movimiento.';
      toast({ title: 'Error', description: errMsg, variant: 'error' });
    }
  });

  const canModify = (createdAtString) => {
    if (!createdAtString) return true;
    const createdAt = new Date(createdAtString);
    const now = new Date();
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays < 2;
  };

  const filteredTx = (tab) => {
    if (tab !== activeTab) return [];
    return transactions;
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) return toast({ title: 'Error', description: 'Completa todos los campos requeridos.', variant: 'error' });
    const payload = { ...newGoal };
    if (!payload.deadline) delete payload.deadline;
    addGoalMutation.mutate(payload);
  };

  const handleSaveBudget = () => {
    if (!budgetForm.budget) return toast({ title: 'Error', description: 'Ingresa un límite válido.', variant: 'error' });
    updateBudgetMutation.mutate(budgetForm);
  };

  const handleAddFunds = () => {
    if (!fundData.amount) return toast({ title: 'Error', description: 'Ingresa un monto a aportar.', variant: 'error' });
    addFundsMutation.mutate(fundData);
  };

  if (isLoadingTx || isLoadingGoals || isLoadingDashboard) {
    return <div className="flex justify-center items-center h-[70vh]"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  const categoriesData = dashboardData?.categories || [];

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* HEADER BANNER */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-brand-blue to-indigo-700 text-white p-8 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet size={20} className="text-white" />
              </div>
              <span className="font-bold tracking-wider uppercase text-xs text-blue-100">Panel de Control</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-sm">Gestión Inteligente</h1>
            <p className="text-blue-50 max-w-lg text-sm md:text-base leading-relaxed">
              Maneja tus presupuestos mensuales, revisa cada movimiento y construye un fondo sólido cumpliendo tus metas.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl px-6 py-6 h-auto flex flex-col items-center justify-center gap-2 transition-all backdrop-blur-sm"
              onClick={() => setShowBudgetModal(true)}
            >
              <Settings size={22} />
              <span className="text-xs font-semibold">Presupuestos</span>
            </Button>
            <Button 
              className="bg-brand-yellow hover:bg-amber-400 text-slate-900 border-none rounded-2xl px-6 py-6 h-auto flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={22} className="stroke-[3]" />
              <span className="text-xs font-bold uppercase tracking-wider">Transacción</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CATEGORIES BUDGETS */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Filter size={24} className="text-indigo-500" /> Presupuestos por Categoría
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriesData.map(cat => {
            const isOver = cat.spent > cat.budget && cat.budget > 0;
            const catInfo = getCategoryInfo(cat.id);
            const CatIcon = catInfo.icon;
            const pct = cat.budget > 0 ? Math.min(100, (cat.spent / cat.budget) * 100) : 0;
            
            return (
              <div key={cat.id} className={`group bg-white rounded-2xl p-5 border shadow-sm transition-all relative overflow-hidden ${isOver ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 hover:border-slate-300'}`}>
                <button 
                  onClick={() => {
                    setBudgetForm({ category: cat.id, budget: cat.budget > 0 ? cat.budget : '' });
                    setShowBudgetModal(true);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-brand-blue hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                  title="Editar límite"
                >
                  <Edit2 size={14} />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${catInfo.bgClass}`}>
                    <CatIcon size={18} className={catInfo.color} />
                  </div>
                  <span className="font-bold text-slate-700 text-sm truncate">{cat.name}</span>
                </div>
                
                <div className="mb-4">
                  <p className={`text-2xl font-black mb-1 ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatCurrency(cat.spent)}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Límite: {cat.budget > 0 ? formatCurrency(cat.budget) : 'Sin límite'}</span>
                  </div>
                </div>

                {cat.budget > 0 && (
                  <div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : (pct > 80 ? 'bg-amber-400' : catInfo.hex || 'bg-brand-blue')}`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {isOver ? (
                      <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><AlertTriangle size={12}/> Te has excedido</p>
                    ) : (
                      <p className="text-[10px] font-semibold text-emerald-600">Quedan {formatCurrency(cat.budget - cat.spent)} disponibles</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {categoriesData.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              Registra transacciones para ver tus categorías aquí.
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200/60 my-10"></div>

      {/* TRANSACTIONS HISTORY */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Historial de Movimientos
        </h2>
        
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Buscar movimientos..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)} icon={<Plus size={16}/>} className="w-full sm:w-auto rounded-xl">Registrar</Button>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }} className="p-6">
            {({ active, setActive }) => (
              <>
                <TabsList active={active} setActive={setActive} className="mb-6 bg-slate-100 p-1 rounded-xl inline-flex">
                  <TabsTrigger value="all" active={active} setActive={setActive} className="rounded-lg px-6">Todos</TabsTrigger>
                  <TabsTrigger value="expense" active={active} setActive={setActive} className="rounded-lg px-6">Gastos</TabsTrigger>
                  <TabsTrigger value="income" active={active} setActive={setActive} className="rounded-lg px-6">Ingresos</TabsTrigger>
                </TabsList>

                {['all', 'expense', 'income'].map(tab => (
                  <TabsContent key={tab} value={tab} active={active}>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow className="border-b-2 border-slate-100">
                            <TableHead className="py-4 text-slate-400 uppercase text-[11px] font-bold tracking-wider">Descripción</TableHead>
                            <TableHead className="py-4 text-slate-400 uppercase text-[11px] font-bold tracking-wider">Categoría</TableHead>
                            <TableHead className="py-4 text-slate-400 uppercase text-[11px] font-bold tracking-wider">Fecha</TableHead>
                            <TableHead className="py-4 text-slate-400 uppercase text-[11px] font-bold tracking-wider text-right">Monto</TableHead>
                            <TableHead className="py-4 text-slate-400 uppercase text-[11px] font-bold tracking-wider text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTx(tab).map(tx => {
                            const catInfo = getCategoryInfo(tx.category);
                            const isIncome = tx.transaction_type === 'ingreso';
                            return (
                              <TableRow key={tx.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : catInfo.bgClass}`}>
                                      <CategoryIcon categoryId={tx.category} size={18} className={isIncome ? '' : catInfo.color} />
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">{tx.description}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Badge variant="outline" className={`font-semibold bg-white ${isIncome ? 'text-emerald-600 border-emerald-200' : ''}`}>
                                    {catInfo.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 font-medium text-slate-500 text-xs">
                                  {formatDate(tx.date)}
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                  <span className={`font-black text-sm flex items-center justify-end gap-1 ${isIncome ? 'text-emerald-500' : 'text-slate-800'}`}>
                                    {isIncome ? <ArrowUpRight size={16} className="stroke-[3]" /> : <ArrowDownRight size={16} className="text-slate-400" />}
                                    {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                  <div className="flex justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    {canModify(tx.created_at) ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            setTxToEdit(tx);
                                            setShowEditModal(true);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-brand-blue hover:bg-blue-50 transition-colors cursor-pointer"
                                          title="Editar movimiento"
                                        >
                                          <Edit2 size={13} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setTxToDelete(tx);
                                            setShowDeleteModal(true);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                          title="Eliminar movimiento"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic bg-slate-100 px-2 py-1 rounded" title="Solo modificable durante las primeras 48 horas">
                                        Bloqueado (&gt;2d)
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredTx(tab).length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No se encontraron movimientos.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>

          {/* PAGINATION CONTROLS */}
          {totalCount > 10 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-500">
                Mostrando <span className="text-slate-800 font-bold">{Math.min(totalCount, (currentPage - 1) * 10 + 1)}-{Math.min(totalCount, currentPage * 10)}</span> de <span className="text-slate-800 font-bold">{totalCount}</span> movimientos
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="rounded-xl px-3 py-2 border-slate-200"
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: Math.ceil(totalCount / 10) }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer
                      ${currentPage === pageNum 
                        ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20' 
                        : 'text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}
                  >
                    {pageNum}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= Math.ceil(totalCount / 10)}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / 10), prev + 1))}
                  className="rounded-xl px-3 py-2 border-slate-200"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-slate-200/60 my-10"></div>

      {/* METAS DE AHORRO (GOALS) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target size={24} className="text-brand-blue" /> 
            Mis Metas de Ahorro
          </h2>
          <Button variant="outline" size="sm" icon={<Plus size={16} />} onClick={() => setShowGoalModal(true)} className="rounded-xl font-bold border-slate-200">
            Nueva Meta
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
            return (
              <div key={goal.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full transition-all group-hover:scale-150 ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand-blue'}`}></div>
                
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-slate-400 mt-1">{goal.description}</p>}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-sm ${pct >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-brand-blue'}`}>
                    {pct}%
                  </div>
                </div>

                <div className="relative z-10 mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-800">{formatCurrency(goal.current_amount)}</span>
                    <span className="text-slate-400">Meta: {formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand-blue'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {goal.target_amount > goal.current_amount && (
                    <p className="text-[10px] font-medium text-slate-500 mt-2 text-right">Faltan {formatCurrency(goal.target_amount - goal.current_amount)}</p>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  {goal.deadline ? (
                    <div className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                      Límite: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </div>
                  ) : <div />}
                  {pct < 100 ? (
                    <button 
                      onClick={() => { setFundData({ goalId: goal.id, amount: '' }); setShowAddFundsModal(true); }}
                      className="text-sm font-bold text-brand-blue hover:text-white bg-blue-50 hover:bg-brand-blue px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Aportar
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-emerald-500 px-4 py-2 bg-emerald-50 rounded-xl">¡Logrado! 🎉</span>
                  )}
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="col-span-full p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Target size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Aún no has trazado metas de ahorro.</p>
              <Button onClick={() => setShowGoalModal(true)} className="mt-4" variant="outline">Crear mi primera meta</Button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS (Reused logic, updated styling subtly) --- */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Nueva Meta de Ahorro">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la meta</label>
              <input type="text" placeholder="Ej: Viaje a San Andrés" value={newGoal.title}
                onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto objetivo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="0" value={newGoal.target_amount}
                  onChange={e => setNewGoal(p => ({ ...p, target_amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-black bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción (opcional)</label>
              <input type="text" placeholder="¿Para qué estás ahorrando?" value={newGoal.description}
                onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha Límite (opcional)</label>
              <input type="date" value={newGoal.deadline}
                onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowGoalModal(false)}>Cancelar</Button>
          <Button onClick={handleAddGoal} disabled={addGoalMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700">
            {addGoalMutation.isPending ? 'Creando...' : 'Crear Meta'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Límite Mensual">
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4 font-medium">Establece un límite de gasto mensual para una categoría y mantén tus finanzas saludables.</p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
              <select value={budgetForm.category} onChange={e => setBudgetForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Presupuesto Asignado</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="Ej: 200000" value={budgetForm.budget}
                  onChange={e => setBudgetForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-black bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBudgetModal(false)}>Cancelar</Button>
          <Button onClick={handleSaveBudget} disabled={updateBudgetMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700">
            {updateBudgetMutation.isPending ? 'Guardando...' : 'Guardar Límite'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={showAddFundsModal} onClose={() => setShowAddFundsModal(false)} title="Aportar a Meta">
        <ModalBody>
          <div className="space-y-4 py-2">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-800 text-sm font-medium mb-4">
              Ingresa el monto que deseas sumar a esta meta. Se registrará automáticamente como un <strong>gasto</strong> para ajustar tu balance general.
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto del Aporte</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="Ej: 50000" value={fundData.amount}
                  onChange={e => setFundData(p => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-2xl font-black bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddFundsModal(false)}>Cancelar</Button>
          <Button onClick={handleAddFunds} disabled={addFundsMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 font-bold text-white border-none">
            {addFundsMutation.isPending ? 'Procesando...' : 'Realizar Aporte'}
          </Button>
        </ModalFooter>
      </Modal>

      <AddTransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      <EditTransactionModal 
        isOpen={showEditModal} 
        onClose={() => { setShowEditModal(false); setTxToEdit(null); }} 
        transaction={txToEdit} 
        onSave={(data) => editTxMutation.mutate({ id: txToEdit.id, data })}
        isPending={editTxMutation.isPending}
      />

      <DeleteTransactionConfirmModal 
        isOpen={showDeleteModal} 
        onClose={() => { setShowDeleteModal(false); setTxToDelete(null); }} 
        transaction={txToDelete} 
        onDelete={() => deleteTxMutation.mutate(txToDelete.id)}
        isPending={deleteTxMutation.isPending}
      />
    </div>
  );
}

function AddTransactionModal({ isOpen, onClose }) {
  const [tx, setTx] = useState({ transaction_type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const txMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/finance/transactions/', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Registrado!', description: 'Transacción guardada exitosamente.', variant: 'success' });
      onClose();
      setTx({ transaction_type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo guardar la transacción.', variant: 'error' })
  });

  const handleSave = () => {
    if (!tx.amount) return toast({ title: 'Error', description: 'Ingresa un monto.', variant: 'error' });
    txMutation.mutate(tx);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Movimiento">
      <ModalBody>
        <div className="space-y-5 py-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['gasto', 'ingreso'].map(t => (
              <button key={t} onClick={() => setTx(p => ({ ...p, transaction_type: t }))}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2
                  ${tx.transaction_type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md') : 'text-slate-500 hover:bg-slate-200'}`}>
                {t === 'gasto' ? <><TrendingDown size={18} /> Gasto</> : <><TrendingUp size={18} /> Ingreso</>}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input type="number" placeholder="0" value={tx.amount}
                onChange={e => setTx(p => ({ ...p, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-2xl font-black bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
              <select value={tx.category} onChange={e => setTx(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha</label>
              <input type="date" value={tx.date}
                onChange={e => setTx(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
            <input type="text" placeholder="Ej: Almuerzo cafetería" value={tx.description}
              onChange={e => setTx(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm transition-colors" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
        <Button onClick={handleSave} disabled={txMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700 rounded-xl px-8">
          {txMutation.isPending ? 'Guardando...' : 'Guardar Movimiento'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function EditTransactionModal({ isOpen, onClose, transaction, onSave, isPending }) {
  const [tx, setTx] = useState({ transaction_type: 'gasto', amount: '', category: 'alimentacion', description: '', date: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (transaction) {
      setTx({
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.date
      });
    }
  }, [transaction]);

  const handleSave = () => {
    if (!tx.amount) return toast({ title: 'Error', description: 'Ingresa un monto.', variant: 'error' });
    onSave(tx);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Movimiento">
      <ModalBody>
        <div className="space-y-5 py-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['gasto', 'ingreso'].map(t => (
              <button key={t} onClick={() => setTx(p => ({ ...p, transaction_type: t }))}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2
                  ${tx.transaction_type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md') : 'text-slate-500 hover:bg-slate-200'}`}>
                {t === 'gasto' ? <><TrendingDown size={18} /> Gasto</> : <><TrendingUp size={18} /> Ingreso</>}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input type="number" placeholder="0" value={tx.amount}
                onChange={e => setTx(p => ({ ...p, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-2xl font-black bg-slate-50 focus:bg-white transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
              <select value={tx.category} onChange={e => setTx(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha</label>
              <input type="date" value={tx.date}
                onChange={e => setTx(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
            <input type="text" placeholder="Ej: Almuerzo cafetería" value={tx.description}
              onChange={e => setTx(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm transition-colors" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
        <Button onClick={handleSave} disabled={isPending} className="font-bold bg-brand-blue hover:bg-blue-700 rounded-xl px-8">
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function DeleteTransactionConfirmModal({ isOpen, onClose, transaction, onDelete, isPending }) {
  if (!transaction) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¿Eliminar Movimiento?">
      <ModalBody>
        <div className="space-y-4 py-2">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-800 text-sm font-semibold flex items-start gap-2.5">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-rose-800">Esta acción no se puede deshacer.</p>
              <p className="font-normal text-rose-700 mt-1">
                ¿Estás seguro de que deseas eliminar este registro de movimiento? Se actualizará tu balance mensual.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Descripción:</span>
              <span className="text-slate-700 font-bold">{transaction.description || 'Sin descripción'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Categoría:</span>
              <span className="text-slate-700 font-bold">{getCategoryInfo(transaction.category).label}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Fecha:</span>
              <span className="text-slate-500 font-semibold">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200/60 pt-3 mt-1">
              <span className="text-slate-400 font-medium">Monto:</span>
              <span className={`font-black text-base ${transaction.transaction_type === 'ingreso' ? 'text-emerald-500' : 'text-slate-800'}`}>
                {transaction.transaction_type === 'ingreso' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
        <Button onClick={onDelete} disabled={isPending} className="bg-rose-500 hover:bg-rose-600 font-bold text-white border-none rounded-xl px-8">
          {isPending ? 'Eliminando...' : 'Eliminar Movimiento'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
