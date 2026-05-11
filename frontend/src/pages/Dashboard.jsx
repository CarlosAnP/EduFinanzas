import { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertCircle,
  ArrowUpRight, ArrowDownRight, Plus, Target, Hand, CreditCard
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { getCategoryInfo, CategoryIcon } from '../components/CategoryIcons';
import iconMap from '../components/CategoryIcons';
import {
  currentUser, financialSummary, transactions, categories,
  savingsGoals, notifications, monthlyData, formatCurrency, formatDate
} from '../data/mockData';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  const handleSave = () => {
    if (!newTx.amount) return toast({ title: 'Error', description: 'Ingresa un monto válido.', variant: 'error' });
    toast({ title: '¡Registrado!', description: `${newTx.type === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${formatCurrency(Number(newTx.amount))} guardado.`, variant: 'success' });
    setShowAddModal(false);
    setNewTx({ type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const budgetPct = Math.round((financialSummary.budgetUsed / financialSummary.monthlyBudget) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            Hola, {currentUser.firstName} <Hand size={28} className="text-amber-400" />
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          Nueva Transacción
        </Button>
      </div>

      {/* Alerts */}
      {notifications.filter(n => n.type === 'warning').map(n => (
        <div key={n.id} className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <h4 className="text-amber-800 font-semibold text-sm">{n.title}</h4>
            <p className="text-amber-600 text-xs mt-0.5">{n.message}</p>
          </div>
        </div>
      ))}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Balance" value={formatCurrency(financialSummary.balance)} icon={<DollarSign size={20} />} color="blue" trend="+12%" trendUp />
        <StatCard label="Ingresos" value={formatCurrency(financialSummary.totalIncome)} icon={<ArrowUpRight size={20} />} color="blue" trend="+8%" trendUp />
        <StatCard label="Gastos" value={formatCurrency(financialSummary.totalExpenses)} icon={<ArrowDownRight size={20} />} color="rose" trend="-5%" trendUp={false} />
        <StatCard label="Ahorro" value={`${financialSummary.savingsRate}%`} icon={<PiggyBank size={20} />} color="violet" trend="+3%" trendUp />
      </div>

      {/* Chart + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader title="Ingresos vs Gastos" subtitle="Últimos 5 meses" />
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
                    formatter={(v) => [formatCurrency(v)]}
                  />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[6,6,0,0]} name="Ingresos" />
                  <Bar dataKey="gastos" fill="#f43f5e" radius={[6,6,0,0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Presupuesto Mensual" action={<Badge variant={budgetPct > 90 ? 'danger' : budgetPct > 70 ? 'warning' : 'success'} dot>{budgetPct}% usado</Badge>} />
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <p className="text-3xl font-bold text-slate-800">{formatCurrency(financialSummary.balance)}</p>
              <p className="text-xs text-slate-400 mt-1">disponible de {formatCurrency(financialSummary.monthlyBudget)}</p>
            </div>
            <Progress value={financialSummary.budgetUsed} max={financialSummary.monthlyBudget} color={budgetPct > 90 ? 'rose' : 'blue'} size="lg" />
            <div className="space-y-2 pt-2">
              {categories.slice(0, 4).map(cat => {
                const catInfo = getCategoryInfo(cat.id);
                const CatIcon = catInfo.icon;
                return (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-2">
                      <CatIcon size={12} className={catInfo.color} />
                      {cat.name}
                    </span>
                    <span className={`font-semibold ${cat.spent > cat.budget ? 'text-rose-600' : 'text-slate-700'}`}>
                      {formatCurrency(cat.spent)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader title="Movimientos Recientes" action={
            <button className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">Ver todos</button>
          } />
          <CardContent className="space-y-2">
            {transactions.slice(0, 6).map(tx => {
              const catInfo = getCategoryInfo(tx.category);
              const isIncome = tx.type === 'ingreso';
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition group">
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryId={tx.category} size={16} />
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{tx.description}</p>
                      <p className="text-[11px] text-slate-400">{catInfo.label} · {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${isIncome ? 'text-blue-600' : 'text-slate-800'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Metas de Ahorro" action={<Badge variant="info">{savingsGoals.length} activas</Badge>} />
          <CardContent className="space-y-4">
            {savingsGoals.map(goal => {
              const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-blue-600" />
                      <span className="font-medium text-slate-700 text-sm">{goal.title}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">{pct}%</span>
                  </div>
                  <Progress value={goal.currentAmount} max={goal.targetAmount} color="blue" size="sm" />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nueva Transacción">
        <ModalBody>
          <div className="space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['gasto', 'ingreso'].map(t => (
                <button key={t} onClick={() => setNewTx(p => ({ ...p, type: t }))}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-2
                    ${newTx.type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow' : 'bg-blue-500 text-white shadow') : 'text-slate-500'}`}>
                  {t === 'gasto' ? <><TrendingDown size={16} /> Gasto</> : <><TrendingUp size={16} /> Ingreso</>}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" placeholder="0" value={newTx.amount}
                  onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-semibold" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
              <input type="text" placeholder="Ej: Almuerzo cafetería" value={newTx.description}
                onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
              <input type="date" value={newTx.date}
                onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Transacción</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon, color, trend, trendUp }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${c.bg} ${c.border} border`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${trendUp ? 'text-blue-600' : 'text-rose-500'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-lg md:text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </Card>
  );
}
