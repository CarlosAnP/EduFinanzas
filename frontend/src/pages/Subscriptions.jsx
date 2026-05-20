import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  Plus, Repeat, Calendar, Loader2, CreditCard, Clock, 
  Trash2, ShieldAlert, Percent, HelpCircle, ArrowUpRight, 
  AlertCircle, DollarSign
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../data/mockData';
import { CategoryIcon } from '../components/CategoryIcons';
import iconMap from '../components/CategoryIcons';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

// Utility helper to safely add months (handling month length clamping)
const add_months = (date, months) => {
  const result = new Date(date);
  const currentMonth = result.getMonth();
  result.setMonth(currentMonth + months);
  // If month arithmetic overflows the target month's total days (e.g. Jan 31 + 1 month -> Mar 3)
  // we clamp it to the last day of the target month.
  if (result.getMonth() !== (currentMonth + months) % 12) {
    result.setDate(0);
  }
  return result;
};

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  
  // State for new subscription
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    category: 'entretenimiento',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
  });

  // State for new credit
  const [newCredit, setNewCredit] = useState({
    name: '',
    total_amount: '',
    installment_amount: '',
    total_installments: '12',
    interest_rate: '0',
    start_date: new Date().toISOString().split('T')[0],
    category: 'otro'
  });

  // Amortization details for preview
  const [previewCuota, setPreviewCuota] = useState(0);
  const [previewTotalPagar, setPreviewTotalPagar] = useState(0);
  const [previewIntereses, setPreviewIntereses] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Query subscriptions
  const { data: subscriptions = [], isLoading: isLoadingSubs } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await api.get('/finance/subscriptions/');
      return response.data;
    }
  });

  // 2. Query credits
  const { data: credits = [], isLoading: isLoadingCredits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const response = await api.get('/finance/credits/');
      return response.data;
    }
  });

  // 3. Mutaciones para Suscripciones
  const addSubMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance/subscriptions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: '¡Suscripción añadida!', description: 'Se guardó exitosamente.', variant: 'success' });
      setShowAddSubModal(false);
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
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
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
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: 'Eliminada', description: 'Suscripción borrada.', variant: 'info' });
    }
  });

  // 4. Mutaciones para Créditos
  const addCreditMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/finance/credits/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ 
        title: '¡Crédito aprobado!', 
        description: 'Se registró el crédito y se inyectó el desembolso en tus ingresos.', 
        variant: 'success' 
      });
      setShowAddCreditModal(false);
      setNewCredit({ name: '', total_amount: '', installment_amount: '', total_installments: '12', interest_rate: '0', start_date: new Date().toISOString().split('T')[0], category: 'otro' });
    },
    onError: () => toast({ title: 'Error', description: 'No se pudo registrar el crédito.', variant: 'error' })
  });

  const deleteCreditMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/finance/credits/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      toast({ title: 'Crédito eliminado', description: 'El préstamo fue removido de tus compromisos.', variant: 'info' });
    }
  });

  // Calcular la cuota proyectada al cambiar los campos del crédito
  useEffect(() => {
    const p = parseFloat(newCredit.total_amount) || 0;
    const n = parseInt(newCredit.total_installments) || 0;
    const i = (parseFloat(newCredit.interest_rate) || 0) / 100;

    let cuota = 0;
    if (p > 0 && n > 0) {
      if (i === 0) {
        cuota = p / n;
      } else {
        cuota = p * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      }
    }
    
    const roundedCuota = Math.round(cuota * 100) / 100;
    const totalPagar = Math.round(roundedCuota * n * 100) / 100;
    const intereses = Math.round((totalPagar - p) * 100) / 100;

    setPreviewCuota(roundedCuota);
    setPreviewTotalPagar(totalPagar);
    setPreviewIntereses(intereses >= 0 ? intereses : 0);
    
    setNewCredit(prev => ({ ...prev, installment_amount: roundedCuota.toString() }));
  }, [newCredit.total_amount, newCredit.total_installments, newCredit.interest_rate]);

  const handleSaveSub = () => {
    if (!newSub.name || !newSub.amount || !newSub.start_date) {
      return toast({ title: 'Error', description: 'Completa los campos obligatorios.', variant: 'error' });
    }
    addSubMutation.mutate(newSub);
  };

  const handleSaveCredit = () => {
    if (!newCredit.name || !newCredit.total_amount || !newCredit.start_date || !newCredit.total_installments) {
      return toast({ title: 'Error', description: 'Completa todos los campos obligatorios.', variant: 'error' });
    }
    addCreditMutation.mutate(newCredit);
  };

  const getFreqLabel = (freq) => {
    const map = { weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
    return map[freq] || freq;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  if (isLoadingSubs || isLoadingCredits) {
    return <div className="flex justify-center items-center h-[70vh]"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  // Cálculos globales
  const activeSubs = subscriptions.filter(s => s.is_active);
  const inactiveSubs = subscriptions.filter(s => !s.is_active);
  const totalSubMonthly = activeSubs.reduce((acc, sub) => {
    let amt = parseFloat(sub.amount);
    if (sub.frequency === 'weekly') amt *= 4.33;
    if (sub.frequency === 'yearly') amt /= 12;
    return acc + amt;
  }, 0);

  const activeCredits = credits.filter(c => c.is_active);
  const totalOutstandingDebt = activeCredits.reduce((acc, c) => acc + parseFloat(c.remaining_amount), 0);
  const totalCreditMonthly = activeCredits.reduce((acc, c) => acc + parseFloat(c.installment_amount), 0);

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
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-sm">Compromisos Fijos</h1>
            <p className="text-blue-50 max-w-lg text-sm md:text-base leading-relaxed">
              Monitorea tus gastos recurrentes y obligaciones crediticias en un solo lugar. ¡Aprende a mantenerte al día!
            </p>
          </div>

          <div>
            {activeTab === 'subscriptions' ? (
              <Button 
                className="bg-brand-yellow hover:bg-amber-400 text-slate-900 border-none rounded-2xl px-6 py-4 h-auto flex flex-row items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 font-bold"
                onClick={() => setShowAddSubModal(true)}
              >
                <Plus size={20} className="stroke-[3]" />
                <span className="text-xs uppercase tracking-wider">Añadir Suscripción</span>
              </Button>
            ) : (
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-2xl px-6 py-4 h-auto flex flex-row items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 font-bold"
                onClick={() => setShowAddCreditModal(true)}
              >
                <Plus size={20} className="stroke-[3]" />
                <span className="text-xs uppercase tracking-wider">Solicitar Crédito</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-brand-blue">
              <CreditCard size={24} />
            </div>
            <Badge className="bg-blue-50 text-brand-blue border-none font-bold">Mensual</Badge>
          </div>
          <p className="text-3xl font-black text-slate-800">{formatCurrency(totalSubMonthly)}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Total en Suscripciones</p>
        </Card>
        
        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-500">
              <AlertCircle size={24} />
            </div>
            <Badge className="bg-rose-50 text-rose-600 border-none font-bold">Pendiente</Badge>
          </div>
          <p className="text-3xl font-black text-slate-800">{formatCurrency(totalOutstandingDebt)}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Saldo Total de Créditos</p>
        </Card>

        <Card className="p-6 bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Calendar size={24} />
            </div>
            <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Mensual</Badge>
          </div>
          <p className="text-3xl font-black text-slate-800">{formatCurrency(totalCreditMonthly)}</p>
          <p className="text-sm font-semibold text-slate-400 mt-1">Cuotas Mensuales (Créditos)</p>
        </Card>
      </div>

      {/* TABS CONTAINER */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto bg-slate-100/80 p-1.5 rounded-2xl mb-8 flex gap-1 border border-slate-200/40">
          <TabsTrigger value="subscriptions" className="flex-1 sm:flex-initial rounded-xl px-6 py-2.5 font-bold text-sm">
            Suscripciones ({activeSubs.length})
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex-1 sm:flex-initial rounded-xl px-6 py-2.5 font-bold text-sm">
            Créditos y Préstamos ({activeCredits.length})
          </TabsTrigger>
        </TabsList>

        {/* SUBSCRIPTIONS TAB CONTENT */}
        <TabsContent value="subscriptions" className="space-y-8 animate-fade-in outline-none">
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
                  <Button onClick={() => setShowAddSubModal(true)} variant="outline" className="font-bold rounded-xl">Añadir la primera</Button>
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
        </TabsContent>

        {/* CREDITS TAB CONTENT */}
        <TabsContent value="credits" className="space-y-8 animate-fade-in outline-none">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={24} className="text-emerald-500" /> Créditos y Préstamos Vigentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCredits.map(credit => {
                const pctPagado = Math.round((credit.paid_installments / credit.total_installments) * 100);
                const catInfo = iconMap[credit.category] || iconMap.otro;
                return (
                  <Card key={credit.id} className="p-6 border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 relative group overflow-hidden" hover>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-indigo-600 opacity-5 group-hover:opacity-10 rounded-bl-[100px] transition-opacity pointer-events-none"></div>

                    <div className="relative z-10 flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${catInfo.bgClass}`}>
                          <CategoryIcon categoryId={credit.category} size={20} className={catInfo.color} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">{credit.name}</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md mt-1 inline-block">
                            {credit.interest_rate > 0 ? `${credit.interest_rate}% mensual` : 'Sin Intereses (0%)'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-extrabold text-[10px]">
                        {pctPagado}% Pagado
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative z-10 py-1.5 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Progreso de Cuotas</span>
                        <span className="text-slate-800">{credit.paid_installments} / {credit.total_installments}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500" 
                          style={{ width: `${pctPagado}%` }}
                        />
                      </div>
                    </div>

                    {/* Credit Statistics */}
                    <div className="relative z-10 py-4 grid grid-cols-2 gap-3 text-xs border-y border-slate-100 my-4">
                      <div>
                        <span className="text-slate-400 font-semibold block">Deuda Pendiente</span>
                        <span className="text-sm font-black text-rose-500">{formatCurrency(credit.remaining_amount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Cuota Mensual</span>
                        <span className="text-sm font-black text-slate-800">{formatCurrency(credit.installment_amount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Desembolsado</span>
                        <span className="text-slate-600 font-bold">{formatCurrency(credit.total_amount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Próxima Fecha</span>
                        <span className="text-slate-500 font-bold">{formatDate(credit.next_payment_date)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative z-10 flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                        <Clock size={12} /> Débito automático activo
                      </span>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar este crédito? Se eliminará del registro de obligaciones.')) {
                            deleteCreditMutation.mutate(credit.id);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                );
              })}
              {activeCredits.length === 0 && (
                <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={26} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium mb-2">No tienes créditos o deudas activas.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                    Aprende cómo apalancarte de forma inteligente. Solicita un crédito educativo simulado para financiar tus metas.
                  </p>
                  <Button onClick={() => setShowAddCreditModal(true)} variant="outline" className="font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200">
                    Solicitar Crédito Académico
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- ADD SUBSCRIPTION MODAL --- */}
      <Modal isOpen={showAddSubModal} onClose={() => setShowAddSubModal(false)} title="Nueva Suscripción">
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
          <Button variant="outline" onClick={() => setShowAddSubModal(false)} className="rounded-xl font-bold">Cancelar</Button>
          <Button onClick={handleSaveSub} disabled={addSubMutation.isPending} className="font-bold bg-brand-blue hover:bg-blue-700 rounded-xl px-8">
            {addSubMutation.isPending ? 'Guardando...' : 'Guardar Suscripción'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* --- ADD CREDIT MODAL (Amortizador Interactivo!) --- */}
      <Modal isOpen={showAddCreditModal} onClose={() => setShowAddCreditModal(false)} title="Solicitar Crédito Académico / Comercial">
        <ModalBody>
          <div className="space-y-4 py-2">
            
            {/* Mensaje Informativo */}
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-800 text-xs font-semibold flex items-start gap-2.5 border border-blue-100">
              <AlertCircle className="text-brand-blue shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-bold">Apalancamiento Inteligente</p>
                <p className="font-normal text-slate-600 mt-0.5">
                  El monto solicitado se inyectará de forma inmediata en tus fondos (Ingreso). Las cuotas se cobrarán en tu balance mensualmente de forma automática.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre o Destino del Crédito</label>
              <input type="text" placeholder="Ej: Préstamo Universidad, Tarjeta de Crédito Laptop" value={newCredit.name}
                onChange={e => setNewCredit(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monto Solicitado ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input type="number" placeholder="0" value={newCredit.total_amount}
                    onChange={e => setNewCredit(p => ({ ...p, total_amount: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Plazo (Meses / Cuotas)</label>
                <input type="number" placeholder="12" value={newCredit.total_installments}
                  onChange={e => setNewCredit(p => ({ ...p, total_installments: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span>Interés Mensual (%)</span>
                  <HelpCircle 
                    size={14} 
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-help" 
                    title="Las tasas varían según el tipo de préstamo y entidad financiera. Puedes modificar este valor para simular diferentes escenarios reales." 
                  />
                </label>
                <div className="relative">
                  <input type="number" placeholder="0" step="0.1" value={newCredit.interest_rate}
                    onChange={e => setNewCredit(p => ({ ...p, interest_rate: e.target.value }))}
                    className="w-full pr-8 pl-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold bg-slate-50 focus:bg-white transition-colors" />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block leading-tight">
                  Tasa editable. Los créditos reales manejan tasas diferentes.
                </span>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoría Asociada</label>
                <select value={newCredit.category} onChange={e => setNewCredit(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white text-sm font-semibold transition-colors cursor-pointer">
                  {Object.entries(iconMap).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Desembolso / Inicio</label>
              <input type="date" value={newCredit.start_date}
                onChange={e => setNewCredit(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-slate-50 focus:bg-white font-semibold transition-colors" />
            </div>

            {/* --- SIMULATOR PANEL --- */}
            {parseFloat(newCredit.total_amount) > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mt-3 space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} className="text-emerald-500" /> Simulación de Cuota (Sistema Francés)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Cuota Proyectada (Mes)</span>
                    <span className="text-lg font-black text-emerald-600">{formatCurrency(previewCuota)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Total a Pagar (Plazo)</span>
                    <span className="text-sm font-bold text-slate-800">{formatCurrency(previewTotalPagar)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Costo de Intereses</span>
                    <span className={`text-xs font-bold ${previewIntereses > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {previewIntereses > 0 ? `+${formatCurrency(previewIntereses)}` : '¡Gratis sin interés!'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Próximo Vencimiento</span>
                    <span className="text-xs font-bold text-slate-500">
                      {formatDate(add_months(new Date(newCredit.start_date), 1).toISOString().split('T')[0])}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddCreditModal(false)} className="rounded-xl font-bold">Cancelar</Button>
          <Button onClick={handleSaveCredit} disabled={addCreditMutation.isPending} className="font-bold bg-emerald-500 hover:bg-emerald-600 border-none text-white rounded-xl px-8">
            {addCreditMutation.isPending ? 'Procesando Crédito...' : 'Aprobar Préstamo'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
