import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertCircle,
  ArrowUpRight, ArrowDownRight, Plus, Target, Hand, Loader2, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import AdminModal from '../components/admin/AdminModal';
import { getCategoryInfo, CategoryIcon } from '../components/CategoryIcons';
import iconMap from '../components/CategoryIcons';
import { formatCurrency, formatDate } from '../data/mockData';

export default function Dashboard() {
  const { user } = useOutletContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [handClicks, setHandClicks] = useState(0);
  const [newTx, setNewTx] = useState({ transaction_type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.get('/finance/dashboard/');
      return response.data;
    }
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/users/notifications/');
      return response.data;
    }
  });

  const txMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance/transactions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Registrado!', description: 'Transacción guardada exitosamente.', variant: 'success' });
      setShowAddModal(false);
      setNewTx({ transaction_type: 'gasto', amount: '', category: 'alimentacion', description: '', date: new Date().toISOString().split('T')[0] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo guardar la transacción.', variant: 'error' });
    }
  });

  const handleSave = () => {
    if (!newTx.amount) return toast({ title: 'Error', description: 'Ingresa un monto válido.', variant: 'error' });
    txMutation.mutate(newTx);
  };

  // 🤫 Cheat: click hand 5 times to open secret admin modal
  const handleHandClick = () => {
    setHandClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setShowCheatModal(true);
        return 0;
      }
      return next;
    });
  };

  const promoteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/users/cheat/promote/', { phrase: 'konami-admin-2025' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setShowCheatModal(false);
      toast({ title: '👑 ¡Ahora eres Admin!', description: 'Recarga la página para ver el panel de administración.', variant: 'success' });
    },
    onError: () => toast({ title: 'Error', description: 'Código incorrecto o sin autorización.', variant: 'error' })
  });

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  const { financialSummary, recentTransactions, savingsGoals, categories, monthlyData } = dashboardData;
  const budgetPct = financialSummary.monthlyBudget > 0 
    ? Math.round((financialSummary.budgetUsed / financialSummary.monthlyBudget) * 100) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3 group tracking-tight">
            Hola, {user?.first_name || 'Estudiante'}{' '}
            <span
              onClick={handleHandClick}
              className="cursor-pointer select-none transition-transform active:scale-90"
              title={handClicks > 0 ? `${5 - handClicks} más...` : ''}
            >
              <Hand size={32} className="text-amber-400 animate-wave origin-bottom-right" />
            </span>
            {user?.is_staff && (
              <button 
                onClick={() => setShowAdminModal(true)}
                className="ml-3 opacity-50 hover:opacity-100 transition-opacity px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Panel de Administración"
              >
                <Shield size={14} /> Admin
              </button>
            )}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button 
          className="bg-brand-blue hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 px-6 py-3 font-bold flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} className="stroke-[3]" />
          Nueva Transacción
        </Button>
      </div>

      {/* Alerts */}
      {notifications.filter(n => !n.is_read && (n.type === 'warning' || n.type === 'error')).map(n => {
        const isError = n.type === 'error';
        return (
          <div 
            key={n.id} 
            className={`bg-gradient-to-r ${
              isError 
                ? 'from-rose-50 to-rose-100/50 border-rose-200' 
                : 'from-amber-50 to-amber-100/50 border-amber-200'
            } border p-5 rounded-2xl flex items-start gap-4 shadow-sm animate-fade-in`}
          >
            <div className={`p-2 rounded-xl ${isError ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <AlertCircle className={isError ? 'text-rose-600 shrink-0' : 'text-amber-600 shrink-0'} size={24} />
            </div>
            <div className="flex-1 pt-1">
              <h4 className={`font-bold text-sm mb-1 ${isError ? 'text-rose-900' : 'text-amber-900'}`}>{n.title}</h4>
              <p className={isError ? 'text-rose-700 text-sm' : 'text-amber-700 text-sm'}>{n.message}</p>
            </div>
          </div>
        );
      })}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Balance Total" value={formatCurrency(financialSummary.balance)} icon={<DollarSign size={24} />} color="blue" trend="+12%" trendUp />
        <StatCard label="Ingresos (Mes)" value={formatCurrency(financialSummary.totalIncome)} icon={<ArrowUpRight size={24} />} color="emerald" trend="+8%" trendUp />
        <StatCard label="Gastos (Mes)" value={formatCurrency(financialSummary.totalExpenses)} icon={<ArrowDownRight size={24} />} color="rose" trend="-5%" trendUp={false} />
        <StatCard label="Tasa de Ahorro" value={`${financialSummary.savingsRate}%`} icon={<PiggyBank size={24} />} color="violet" trend="+3%" trendUp />
      </div>

      {/* Chart + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-1 rounded-[2rem] border-slate-100 shadow-sm">
          <CardHeader title="Evolución Financiera" subtitle="Ingresos vs Gastos de los últimos meses" className="px-6 pt-6 pb-2" />
          <CardContent className="px-2 pb-6">
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={6} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000)}k`} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '14px', fontWeight: 'bold' }}
                    formatter={(v) => [formatCurrency(v)]}
                  />
                  <Bar dataKey="ingresos" radius={[8,8,0,0]} name="Ingresos">
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" />
                    ))}
                  </Bar>
                  <Bar dataKey="gastos" radius={[8,8,0,0]} name="Gastos">
                    {monthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#f43f5e" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[2rem] border-slate-100 shadow-sm flex flex-col">
          <CardHeader 
            title="Presupuesto del Mes" 
            action={<Badge variant={budgetPct > 90 ? 'danger' : budgetPct > 70 ? 'warning' : 'success'} className="font-bold shadow-sm">{budgetPct}% usado</Badge>} 
            className="px-6 pt-6 pb-2"
          />
          <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="text-center py-4 bg-slate-50 rounded-2xl">
              <p className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">{formatCurrency(financialSummary.balance)}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">disponible de {formatCurrency(financialSummary.monthlyBudget)}</p>
            </div>
            
            <div className="space-y-3">
              <Progress value={financialSummary.budgetUsed} max={financialSummary.monthlyBudget} color={budgetPct > 90 ? 'rose' : (budgetPct > 70 ? 'amber' : 'brand-blue')} size="lg" />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Principales Gastos</h4>
              {categories.slice(0, 4).map(cat => {
                const catInfo = getCategoryInfo(cat.id);
                const CatIcon = catInfo.icon;
                return (
                  <div key={cat.id} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-600 flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${catInfo.bgClass}`}>
                        <CatIcon size={14} className={catInfo.color} />
                      </div>
                      {cat.name}
                    </span>
                    <span className={`font-black flex items-center gap-1 ${cat.spent > cat.budget && cat.budget > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 rounded-[2rem] border-slate-100 shadow-sm">
          <CardHeader 
            title="Movimientos Recientes" 
            action={<button className="text-brand-blue text-sm font-bold hover:underline cursor-pointer bg-blue-50 px-3 py-1 rounded-lg">Ver todos</button>} 
            className="px-6 pt-6"
          />
          <CardContent className="px-4 pb-6 space-y-2 mt-2">
            {recentTransactions.map(tx => {
              const catInfo = getCategoryInfo(tx.category);
              const isIncome = tx.transaction_type === 'ingreso';
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : catInfo.bgClass}`}>
                      <CategoryIcon categoryId={tx.category} size={20} className={isIncome ? '' : catInfo.color} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm md:text-base">{tx.description}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{catInfo.label} · {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`font-black text-base ${isIncome ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign size={20} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">No hay transacciones recientes.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-[2rem] border-slate-100 shadow-sm">
          <CardHeader 
            title="Metas de Ahorro" 
            action={<Badge variant="info" className="font-bold">{savingsGoals.length} activas</Badge>} 
            className="px-6 pt-6"
          />
          <CardContent className="px-6 pb-6 space-y-4 mt-2">
            {savingsGoals.map(goal => {
              const pct = Math.round((goal.current_amount / goal.target_amount) * 100);
              return (
                <div key={goal.id} className="p-5 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-blue/5 rounded-full blur-xl group-hover:bg-brand-blue/10 transition-colors"></div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                        <Target size={18} />
                      </div>
                      <span className="font-bold text-slate-800">{goal.title}</span>
                    </div>
                    <span className="text-sm font-black text-brand-blue">{pct}%</span>
                  </div>
                  <div className="relative z-10">
                    <Progress value={goal.current_amount} max={goal.target_amount} color="brand-blue" size="sm" />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2">
                      <span className="text-slate-700">{formatCurrency(goal.current_amount)}</span>
                      <span>Meta: {formatCurrency(goal.target_amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {savingsGoals.length === 0 && (
              <div className="text-center py-8">
                <Target size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 font-medium">No tienes metas de ahorro activas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nuevo Movimiento">
        <ModalBody>
          <div className="space-y-5 py-2">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {['gasto', 'ingreso'].map(t => (
                <button key={t} onClick={() => setNewTx(p => ({ ...p, transaction_type: t }))}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2
                    ${newTx.transaction_type === t ? (t === 'gasto' ? 'bg-rose-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md') : 'text-slate-500 hover:bg-slate-200'}`}>
                  {t === 'gasto' ? <><TrendingDown size={18} /> Gasto</> : <><TrendingUp size={18} /> Ingreso</>}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" placeholder="0" value={newTx.amount}
                  onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none text-2xl font-black bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
                <select value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                  {Object.entries(iconMap).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Fecha</label>
                <input type="date" value={newTx.date}
                  onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
              <input type="text" placeholder="Ej: Almuerzo cafetería" value={newTx.description}
                onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 focus:bg-white text-sm transition-colors" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold">Cancelar</Button>
          <Button onClick={handleSave} disabled={txMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700 rounded-xl px-8">
            {txMutation.isPending ? 'Guardando...' : 'Guardar Movimiento'}
          </Button>
        </ModalFooter>
      </Modal>

      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />

      {/* 🤫 SECRET CHEAT MODAL — click the hand 5x */}
      {showCheatModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheatModal(false)} />
          <div className="relative z-10 w-full max-w-sm">
            <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Scanlines decoration */}
              <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />
              
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
                  <span className="text-3xl">👾</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-2">Código Secreto</p>
                <h3 className="text-2xl font-black mb-2 tracking-tight">¿Modo Admin?</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Activarás privilegios de <strong className="text-white">administrador</strong> para esta cuenta. Esta acción es permanente.
                </p>

                {/* Fake konami progress */}
                <div className="flex justify-center gap-1.5 mb-8 opacity-40">
                  {['↑','↑','↓','↓','←','→','←','→','B','A'].map((k, i) => (
                    <span key={i} className="text-[10px] font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{k}</span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheatModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white transition-colors text-sm font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => promoteMutation.mutate()}
                    disabled={promoteMutation.isPending}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 shadow-lg shadow-amber-500/30"
                  >
                    {promoteMutation.isPending ? '⏳ Activando...' : '👑 Activar Admin'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, trend, trendUp }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-brand-blue', glow: 'bg-brand-blue/10' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', glow: 'bg-rose-500/10' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', glow: 'bg-violet-500/10' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', glow: 'bg-emerald-500/10' },
  };
  const c = colors[color] || colors.blue;

  return (
    <Card className="p-6 relative overflow-hidden group hover:shadow-lg transition-all border-slate-100">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all ${c.glow} group-hover:scale-150`}></div>
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${c.bg}`}>
          <span className={c.icon}>{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </span>
        )}
      </div>
      <p className="relative z-10 text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      <p className="relative z-10 text-sm font-semibold text-slate-400 mt-1">{label}</p>
    </Card>
  );
}
