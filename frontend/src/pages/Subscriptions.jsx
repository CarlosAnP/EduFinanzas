import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Plus, Repeat, Calendar, Loader2, CreditCard, Clock, Trash2, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../data/mockData';
import { CategoryIcon } from '../components/CategoryIcons';
import iconMap from '../components/CategoryIcons';

export default function Subscriptions() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    category: 'entretenimiento',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await api.get('/finance/subscriptions/');
      return response.data;
    }
  });

  const addSubMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance/subscriptions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Suscripción añadida!', description: 'Se guardó exitosamente.', variant: 'success' });
      setShowAddModal(false);
      setNewSub({ name: '', amount: '', category: 'entretenimiento', frequency: 'monthly', start_date: new Date().toISOString().split('T')[0] });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo guardar la suscripción.', variant: 'error' })
  });

  const toggleSubMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const response = await api.patch(`/finance/subscriptions/${id}/`, { is_active });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Actualizado', description: 'El estado de la suscripción cambió.', variant: 'success' });
    }
  });

  const deleteSubMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/finance/subscriptions/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({ title: 'Eliminada', description: 'Suscripción borrada.', variant: 'info' });
    }
  });

  const handleSave = () => {
    if (!newSub.name || !newSub.amount || !newSub.start_date) {
      return toast({ title: 'Error', description: 'Completa los campos obligatorios.', variant: 'error' });
    }
    addSubMutation.mutate(newSub);
  };

  const getFreqLabel = (freq) => {
    const map = { weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
    return map[freq] || freq;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[70vh]"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  const activeSubs = subscriptions.filter(s => s.is_active);
  const inactiveSubs = subscriptions.filter(s => !s.is_active);
  const totalMonthly = activeSubs.reduce((acc, sub) => {
    let amt = parseFloat(sub.amount);
    if (sub.frequency === 'weekly') amt *= 4.33;
    if (sub.frequency === 'yearly') amt /= 12;
    return acc + amt;
  }, 0);

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* HEADER BANNER */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-brand-blue to-indigo-700 text-white p-8 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Repeat size={20} className="text-white" />
              </div>
              <span className="font-bold tracking-wider uppercase text-xs text-blue-100">Panel de Control</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-sm">Pagos Recurrentes</h1>
            <p className="text-blue-50 max-w-lg text-sm md:text-base leading-relaxed">
              Mantén un control estricto de tus gastos fijos. Visualiza cuánto dinero destinan mes a mes tus suscripciones y servicios.
            </p>
          </div>

          <Button 
            className="bg-brand-yellow hover:bg-amber-400 text-slate-900 border-none rounded-2xl px-6 py-6 h-auto flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={22} className="stroke-[3]" />
            <span className="text-xs font-bold uppercase tracking-wider">Añadir Suscripción</span>
          </Button>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-brand-blue">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{formatCurrency(totalMonthly)}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Gasto estimado mensual</p>
        </Card>
        
        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Repeat size={24} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{activeSubs.length}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Suscripciones activas</p>
        </Card>

        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <ShieldAlert size={24} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-800">{inactiveSubs.length}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Canceladas / Inactivas</p>
        </Card>
      </div>

      <div className="w-full h-px bg-slate-200/60 my-10"></div>

      {/* ACTIVE SUBSCRIPTIONS */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={24} className="text-brand-blue" /> Tus Suscripciones Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubs.map(sub => {
            const catInfo = iconMap[sub.category] || iconMap.entretenimiento;
            return (
              <Card key={sub.id} className="p-6 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative group overflow-hidden" hover>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-blue to-blue-600 opacity-5 group-hover:opacity-10 rounded-bl-[100px] transition-opacity"></div>
                
                <div className="relative z-10 flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${catInfo.bgClass}`}>
                      <CategoryIcon categoryId={sub.category} size={24} className={catInfo.color} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base leading-tight">{sub.name}</h3>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{getFreqLabel(sub.frequency)}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="bg-emerald-100 text-emerald-700 font-bold border-none">Activa</Badge>
                </div>
                
                <div className="relative z-10 py-3">
                  <p className="text-3xl font-black text-slate-800">{formatCurrency(sub.amount)}</p>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => toggleSubMutation.mutate({ id: sub.id, is_active: false })}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Pausar
                  </button>
                  <button 
                    onClick={() => deleteSubMutation.mutate(sub.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            );
          })}
          {activeSubs.length === 0 && (
            <div className="col-span-full p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Repeat size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-4">No tienes suscripciones activas registradas.</p>
              <Button onClick={() => setShowAddModal(true)} variant="outline" className="font-bold rounded-xl">Añadir la primera</Button>
            </div>
          )}
        </div>
      </div>

      {/* INACTIVE SUBSCRIPTIONS */}
      {inactiveSubs.length > 0 && (
        <div className="space-y-6 mt-12 pt-8 border-t border-slate-200/60">
          <h2 className="text-xl font-bold text-slate-400 flex items-center gap-2">
            <Clock size={20} /> Suscripciones Inactivas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveSubs.map(sub => (
              <Card key={sub.id} className="p-5 bg-slate-50/50 border-slate-200/60 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 rounded-lg text-slate-400 grayscale">
                      <CategoryIcon categoryId={sub.category} size={16} />
                    </div>
                    <span className="font-bold text-slate-600 text-sm">{sub.name}</span>
                  </div>
                  <Badge variant="outline" className="text-slate-400 border-slate-300">Pausada</Badge>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-black text-slate-500">{formatCurrency(sub.amount)}</span>
                  <button 
                    onClick={() => toggleSubMutation.mutate({ id: sub.id, is_active: true })}
                    className="text-xs font-bold text-brand-blue hover:text-white bg-blue-50 hover:bg-brand-blue px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Reactivar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nueva Suscripción">
        <ModalBody>
          <div className="space-y-5 py-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre de la Suscripción</label>
              <input type="text" placeholder="Ej: Netflix, Gimnasio, Spotify" value={newSub.name}
                onChange={e => setNewSub(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto del Pago</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input type="number" placeholder="0" value={newSub.amount}
                    onChange={e => setNewSub(p => ({ ...p, amount: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-black bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Frecuencia</label>
                <select value={newSub.frequency} onChange={e => setNewSub(p => ({ ...p, frequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
              <select value={newSub.category} onChange={e => setNewSub(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                {Object.entries(iconMap).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Próximo Cobro</label>
              <input type="date" value={newSub.start_date}
                onChange={e => setNewSub(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 focus:bg-white font-semibold transition-colors" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)} className="rounded-xl font-bold">Cancelar</Button>
          <Button onClick={handleSave} disabled={addSubMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700 rounded-xl px-8">
            {addSubMutation.isPending ? 'Guardando...' : 'Guardar Suscripción'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
