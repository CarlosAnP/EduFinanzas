import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Plus, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Search,
  Filter, TrendingDown, TrendingUp, Settings, Loader2, Edit2
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

// Helper formatter functions
const formatCurrency = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Expenses() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '', description: '', deadline: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'alimentacion', budget: '' });
  const [fundData, setFundData] = useState({ goalId: null, amount: '' });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: transactions = [], isLoading: isLoadingTx } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => { const res = await api.get('/finance/transactions/'); return res.data; }
  });

  const { data: goals = [], isLoading: isLoadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => { const res = await api.get('/finance/goals/'); return res.data; }
  });

  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => { const res = await api.get('/finance/dashboard/'); return res.data; }
  });

  // Mutations
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

  const filteredTx = (type) => {
    let filtered = type === 'all' ? transactions : transactions.filter(t => t.transaction_type === (type === 'income' ? 'ingreso' : 'gasto'));
    if (searchTerm) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target_amount) return toast({ title: 'Error', description: 'Completa todos los campos requeridos.', variant: 'error' });
    
    const payload = { ...newGoal };
    if (!payload.deadline) {
      delete payload.deadline;
    }
    
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
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  const categoriesData = dashboardData?.categories || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gestión Financiera</h1>
          <p className="text-slate-500 text-sm mt-1">Controla tus categorías, gastos y metas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Settings size={18} />} onClick={() => setShowBudgetModal(true)}>Presupuestos</Button>
          <Button icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>Registrar</Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Filter size={16} className="text-slate-400" /> Presupuesto por Categoría
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoriesData.map(cat => {
            const pct = cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0;
            const isOver = cat.spent > cat.budget && cat.budget > 0;
            const catInfo = getCategoryInfo(cat.id);
            const CatIcon = catInfo.icon;
            return (
              <Card key={cat.id} className={`p-3 relative group ${isOver ? 'border-rose-200 bg-rose-50/40' : ''}`} hover>
                <button 
                  onClick={() => {
                    setBudgetForm({ category: cat.id, budget: cat.budget > 0 ? cat.budget : '' });
                    setShowBudgetModal(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/50 text-slate-400 hover:text-brand-blue hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  title="Editar límite"
                >
                  <Edit2 size={12} />
                </button>
                <div className="flex items-center gap-2 mb-2 pr-6">
                  <CatIcon size={14} className={catInfo.color} />
                  <span className="text-xs font-semibold text-slate-600 truncate">{cat.name}</span>
                </div>
                <p className={`text-lg font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatCurrency(cat.spent)}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-400">de {formatCurrency(cat.budget)}</p>
                  {cat.budget > 0 && !isOver && (
                    <p className="text-[10px] font-medium text-emerald-600">Faltan {formatCurrency(cat.budget - cat.spent)}</p>
                  )}
                </div>
                <Progress value={cat.spent} max={cat.budget || 1} color={cat.color} size="sm" />
                {isOver && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-rose-500 font-medium">
                    <AlertTriangle size={10} /> Excedido
                  </div>
                )}
              </Card>
            );
          })}
          {categoriesData.length === 0 && (
            <div className="col-span-full p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
              Aún no tienes gastos ni presupuestos configurados.
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table with Tabs */}
      <Card>
        <CardHeader title="Historial de Transacciones" />
        <CardContent>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Buscar transacciones..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <Tabs defaultValue="all">
            {({ active, setActive }) => (
              <>
                <TabsList active={active} setActive={setActive}>
                  <TabsTrigger value="all" active={active} setActive={setActive}>Todos</TabsTrigger>
                  <TabsTrigger value="expense" active={active} setActive={setActive}>Gastos</TabsTrigger>
                  <TabsTrigger value="income" active={active} setActive={setActive}>Ingresos</TabsTrigger>
                </TabsList>

                {['all', 'expense', 'income'].map(tab => (
                  <TabsContent key={tab} value={tab} active={active}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                          <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTx(tab).map(tx => {
                          const catInfo = getCategoryInfo(tx.category);
                          const isIncome = tx.transaction_type === 'ingreso';
                          return (
                            <TableRow key={tx.id}>
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <CategoryIcon categoryId={tx.category} size={14} />
                                  <div>
                                    <p className="font-medium text-slate-700 text-sm">{tx.description}</p>
                                    <p className="text-[11px] text-slate-400 sm:hidden">{catInfo.label} · {formatDate(tx.date)}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge variant={isIncome ? 'success' : 'default'}>{catInfo.label}</Badge>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-slate-500 text-xs">{formatDate(tx.date)}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-bold text-sm flex items-center justify-end gap-1 ${isIncome ? 'text-blue-600' : 'text-slate-800'}`}>
                                  {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  {formatCurrency(tx.amount)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    {filteredTx(tab).length === 0 && (
                      <p className="text-center text-slate-400 py-6 text-sm">No hay transacciones registradas.</p>
                    )}
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Savings Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Target size={18} className="text-blue-600" /> Metas de Ahorro
          </h2>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setShowGoalModal(true)}>
            Nueva Meta
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.round((goal.current_amount / goal.target_amount) * 100);
            return (
              <Card key={goal.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Target size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{goal.title}</h3>
                      <p className="text-[11px] text-slate-400">{goal.description}</p>
                    </div>
                  </div>
                  <Badge variant={pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'info'}>{pct}%</Badge>
                </div>
                <Progress value={goal.current_amount} max={goal.target_amount} color="blue" size="md" />
                <div className="flex justify-between text-xs mt-2 text-slate-500">
                  <span>Ahorrado: {formatCurrency(goal.current_amount)}</span>
                  <span>Meta: {formatCurrency(goal.target_amount)}</span>
                </div>
                {goal.target_amount > goal.current_amount && (
                  <p className="text-[10px] font-medium text-blue-600 mt-1 text-right">Faltan {formatCurrency(goal.target_amount - goal.current_amount)}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {goal.deadline ? (
                    <p className="text-[10px] text-slate-400">Límite: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  ) : <div />}
                  <button 
                    onClick={() => { setFundData({ goalId: goal.id, amount: '' }); setShowAddFundsModal(true); }}
                    className="text-xs font-semibold text-brand-blue hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Aportar
                  </button>
                </div>
              </Card>
            );
          })}
          {goals.length === 0 && (
            <div className="col-span-full p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
              Empieza a planificar tu futuro añadiendo tu primera meta de ahorro.
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Nueva Meta de Ahorro">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la meta</label>
              <input type="text" placeholder="Ej: Computador nuevo" value={newGoal.title}
                onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto objetivo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="0" value={newGoal.target_amount}
                  onChange={e => setNewGoal(p => ({ ...p, target_amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (opcional)</label>
              <input type="text" placeholder="¿Para qué estás ahorrando?" value={newGoal.description}
                onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Límite (opcional)</label>
              <input type="date" value={newGoal.deadline}
                onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowGoalModal(false)}>Cancelar</Button>
          <Button onClick={handleAddGoal} disabled={addGoalMutation.isPending}>
            {addGoalMutation.isPending ? 'Creando...' : 'Crear Meta'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Set Budget Modal */}
      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Configurar Presupuesto">
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">Establece un límite de gasto mensual para una categoría. Te avisaremos si te pasas.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select value={budgetForm.category} onChange={e => setBudgetForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Límite Mensual</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="Ej: 200000" value={budgetForm.budget}
                  onChange={e => setBudgetForm(p => ({ ...p, budget: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBudgetModal(false)}>Cancelar</Button>
          <Button onClick={handleSaveBudget} disabled={updateBudgetMutation.isPending}>
            {updateBudgetMutation.isPending ? 'Guardando...' : 'Guardar Límite'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Funds Modal */}
      <Modal isOpen={showAddFundsModal} onClose={() => setShowAddFundsModal(false)} title="Aportar a Meta">
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">Ingresa el monto que deseas sumar a esta meta. Se registrará automáticamente como un gasto.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto del Aporte</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="Ej: 50000" value={fundData.amount}
                  onChange={e => setFundData(p => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddFundsModal(false)}>Cancelar</Button>
          <Button onClick={handleAddFunds} disabled={addFundsMutation.isPending}>
            {addFundsMutation.isPending ? 'Procesando...' : 'Realizar Aporte'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Transaction Modal */}
      <AddTransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
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
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Transacción">
      <ModalBody>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['gasto', 'ingreso'].map(t => (
              <button key={t} onClick={() => setTx(p => ({ ...p, transaction_type: t }))}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-2
                  ${tx.transaction_type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow' : 'bg-blue-500 text-white shadow') : 'text-slate-500'}`}>
                {t === 'gasto' ? <><TrendingDown size={16} /> Gasto</> : <><TrendingUp size={16} /> Ingreso</>}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input type="number" placeholder="0" value={tx.amount}
                onChange={e => setTx(p => ({ ...p, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
            <select value={tx.category} onChange={e => setTx(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
              {Object.entries(iconMap).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <input type="text" placeholder="Ej: Almuerzo cafetería" value={tx.description}
              onChange={e => setTx(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
            <input type="date" value={tx.date}
              onChange={e => setTx(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={txMutation.isPending}>
          {txMutation.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
