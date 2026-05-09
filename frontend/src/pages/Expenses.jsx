import { useState } from 'react';
import {
  Plus, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Search,
  Filter, TrendingDown, TrendingUp
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
import {
  transactions, categories, savingsGoals, formatCurrency, formatDate
} from '../data/mockData';

export default function Expenses() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', description: '' });
  const { toast } = useToast();

  const filteredTx = (type) => {
    let filtered = type === 'all' ? transactions : transactions.filter(t => t.type === (type === 'income' ? 'ingreso' : 'gasto'));
    if (searchTerm) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered;
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount) return toast({ title: 'Error', description: 'Completa todos los campos requeridos.', variant: 'error' });
    toast({ title: '¡Meta creada!', description: `"${newGoal.title}" agregada exitosamente.`, variant: 'success' });
    setShowGoalModal(false);
    setNewGoal({ title: '', targetAmount: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gestión Financiera</h1>
          <p className="text-slate-500 text-sm mt-1">Controla tus categorías, gastos y metas.</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>Registrar</Button>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Filter size={16} className="text-slate-400" /> Presupuesto por Categoría
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map(cat => {
            const pct = Math.round((cat.spent / cat.budget) * 100);
            const isOver = cat.spent > cat.budget;
            const catInfo = getCategoryInfo(cat.id);
            const CatIcon = catInfo.icon;
            return (
              <Card key={cat.id} className={`p-3 ${isOver ? 'border-rose-200 bg-rose-50/40' : ''}`} hover>
                <div className="flex items-center gap-2 mb-2">
                  <CatIcon size={14} className={catInfo.color} />
                  <span className="text-xs font-semibold text-slate-600 truncate">{cat.name}</span>
                </div>
                <p className={`text-lg font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatCurrency(cat.spent)}
                </p>
                <p className="text-[10px] text-slate-400 mb-2">de {formatCurrency(cat.budget)}</p>
                <Progress value={cat.spent} max={cat.budget} color={cat.color} size="sm" />
                {isOver && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-rose-500 font-medium">
                    <AlertTriangle size={10} /> Excedido
                  </div>
                )}
              </Card>
            );
          })}
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
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
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
                          const isIncome = tx.type === 'ingreso';
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
                                <span className={`font-bold text-sm flex items-center justify-end gap-1 ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                                  {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  {formatCurrency(tx.amount)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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
            <Target size={18} className="text-emerald-600" /> Metas de Ahorro
          </h2>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setShowGoalModal(true)}>
            Nueva Meta
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsGoals.map(goal => {
            const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            return (
              <Card key={goal.id} className="p-5" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <Target size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{goal.title}</h3>
                      <p className="text-[11px] text-slate-400">{goal.description}</p>
                    </div>
                  </div>
                  <Badge variant={pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'info'}>{pct}%</Badge>
                </div>
                <Progress value={goal.currentAmount} max={goal.targetAmount} color="emerald" size="md" />
                <div className="flex justify-between text-xs mt-2 text-slate-500">
                  <span>Ahorrado: {formatCurrency(goal.currentAmount)}</span>
                  <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                </div>
                {goal.deadline && (
                  <p className="text-[10px] text-slate-400 mt-2">Fecha límite: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Nueva Meta de Ahorro">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la meta</label>
              <input type="text" placeholder="Ej: Viaje de fin de año" value={newGoal.title}
                onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto objetivo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="0" value={newGoal.targetAmount}
                  onChange={e => setNewGoal(p => ({ ...p, targetAmount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (opcional)</label>
              <input type="text" placeholder="¿Para qué estás ahorrando?" value={newGoal.description}
                onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowGoalModal(false)}>Cancelar</Button>
          <Button onClick={handleAddGoal}>Crear Meta</Button>
        </ModalFooter>
      </Modal>

      {/* Add Transaction Modal */}
      <AddTransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

function AddTransactionModal({ isOpen, onClose }) {
  const [tx, setTx] = useState({ type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  const handleSave = () => {
    if (!tx.amount) return toast({ title: 'Error', description: 'Ingresa un monto.', variant: 'error' });
    toast({ title: '¡Registrado!', description: `${tx.type === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${formatCurrency(Number(tx.amount))} guardado.`, variant: 'success' });
    onClose();
    setTx({ type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Transacción">
      <ModalBody>
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['gasto', 'ingreso'].map(t => (
              <button key={t} onClick={() => setTx(p => ({ ...p, type: t }))}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-2
                  ${tx.type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow' : 'bg-emerald-500 text-white shadow') : 'text-slate-500'}`}>
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
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-semibold" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
            <select value={tx.category} onChange={e => setTx(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm">
              {Object.entries(iconMap).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <input type="text" placeholder="Ej: Almuerzo cafetería" value={tx.description}
              onChange={e => setTx(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
            <input type="date" value={tx.date}
              onChange={e => setTx(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar</Button>
      </ModalFooter>
    </Modal>
  );
}
