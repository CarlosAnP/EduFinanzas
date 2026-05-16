import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import {
  Calculator, ChevronRight, CheckCircle, BookOpen, Trophy,
  Flame, Star, Clock, Sparkles, Lock, Zap, Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';

const staticGuides = [
  {
    id: 1,
    title: 'La regla del 50/30/20',
    category: 'Presupuesto',
    read_time: '5 min',
    color: 'blue',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Esta regla es el mejor punto de partida para tu vida financiera universitaria. Consiste en dividir tus ingresos en tres categorías principales:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-slate-800">Necesidades (50%)</strong>: Dinero destinado a lo indispensable: arriendo, servicios públicos, transporte, alimentación y matrícula.</li>
          <li><strong className="text-slate-800">Deseos (30%)</strong>: Esto incluye salidas con amigos, suscripciones como Netflix o Spotify, ropa, y ese café en la universidad. ¡Es importante disfrutar, pero con un límite!</li>
          <li><strong className="text-slate-800">Ahorro e Inversión (20%)</strong>: Este porcentaje es innegociable. Debes pagarte a ti mismo primero.</li>
        </ul>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Cómo aplicarla?</h4>
        <p>El día que recibas tus ingresos, transfiere inmediatamente el 20% a otra cuenta y actúa como si ese dinero no existiera. Luego, distribuye el resto.</p>
      </div>
    )
  },
  {
    id: 2,
    title: 'Fondo de Emergencia',
    category: 'Ahorro',
    read_time: '8 min',
    color: 'violet',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Un fondo de emergencia no es para un viaje de vacaciones ni para aprovechar un descuento en ropa. Es un dinero reservado estrictamente para situaciones imprevistas: una urgencia médica o el daño de tu computador.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Cuánto debes tener?</h4>
        <p>La regla de oro para un adulto es tener entre 3 y 6 meses de gastos básicos cubiertos. Como estudiante, una meta realista es alcanzar tu primer <strong className="text-amber-600">millón de pesos ($1.000.000 COP)</strong>.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Dónde guardarlo?</h4>
        <p>Debe ser líquido (fácil de retirar) pero no estar mezclado con tu dinero diario. Una excelente opción es una cuenta de ahorros de alto rendimiento o "bolsillos" en aplicaciones financieras.</p>
      </div>
    )
  },
  {
    id: 3,
    title: 'Tarjetas de Crédito 101',
    category: 'Crédito',
    read_time: '10 min',
    color: 'rose',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Una tarjeta de crédito es solo un medio de pago, y si la usas bien, es la mejor herramienta para construir tu historial crediticio desde joven.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">Reglas de Oro:</h4>
        <ul className="list-decimal pl-5 space-y-2">
          <li><strong>Nunca la uses para comprar cosas que no puedes pagar hoy.</strong></li>
          <li><strong>Todo a una (1) cuota.</strong> Al pagar a una cuota, estarás financiándote gratis por hasta 45 días sin pagar intereses.</li>
          <li><strong>Paga el saldo total.</strong> Pagar solo el "pago mínimo" te hará pagar tasas altísimas (usura).</li>
          <li><strong>Cuidado con la cuota de manejo.</strong> Busca bancos que ofrezcan tarjetas para jóvenes 100% libres de cobros.</li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    title: 'Gastos Hormiga',
    category: 'Presupuesto',
    read_time: '4 min',
    color: 'amber',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Los gastos hormiga son esas pequeñas fugas de dinero diarias de las que apenas te das cuenta, pero que juntas destruyen tu presupuesto mensual.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">Ejemplos Comunes:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ese café costoso de todas las mañanas.</li>
          <li>Snacks, chicles o golosinas en la universidad.</li>
          <li>Suscripciones que pagas pero nunca usas (ej. gimnasio, streaming).</li>
          <li>Pedir transporte por app en lugar de caminar o usar transporte público cuando tienes tiempo.</li>
        </ul>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Cómo combatirlos?</h4>
        <p>El primer paso es <strong>registrarlos</strong>. Usa la pestaña de Gestión para anotar cada gasto pequeño que haces. Al final del mes, revisa el gráfico y suma todo lo que gastaste en la categoría "Entretenimiento" o "Otros" y te sorprenderás. Cambia hábitos: lleva tu propio café o botella de agua desde casa.</p>
      </div>
    )
  },
  {
    id: 5,
    title: 'Empezar a Invertir',
    category: 'Inversión',
    read_time: '12 min',
    color: 'emerald',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Invertir no es solo para millonarios ni expertos financieros. De hecho, el mejor momento para empezar a invertir es mientras eres estudiante, gracias a la magia del <strong>Interés Compuesto</strong>.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Por qué debes invertir?</h4>
        <p>Si dejas tu dinero debajo del colchón o en una cuenta tradicional, la inflación (el aumento general de los precios) hará que cada vez puedas comprar menos cosas con el mismo dinero.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">Opciones para principiantes:</h4>
        <ul className="list-decimal pl-5 space-y-2">
          <li><strong>CDTs o Depósitos a Término:</strong> Inversiones de bajo riesgo. Entregas tu dinero al banco por un tiempo definido (ej. 6 meses) y te devuelven el dinero más unos intereses fijos.</li>
          <li><strong>Cuentas de Alta Rentabilidad:</strong> Hoy en día existen bancos digitales que ofrecen tasas de interés anuales altas solo por tener el dinero guardado con ellos, sin plazos forzosos.</li>
          <li><strong>ETFs (Fondos Cotizados):</strong> Si quieres invertir en la bolsa a largo plazo, no compres acciones individuales. Compra ETFs, que son paquetes diversificados de las mejores empresas del mundo.</li>
        </ul>
      </div>
    )
  },
  {
    id: 6,
    title: 'Deudas de Consumo',
    category: 'Deudas',
    read_time: '7 min',
    color: 'orange',
    content: (
      <div className="space-y-4 text-slate-600">
        <p>No todas las deudas son malas. Una deuda para pagar tus estudios puede ser una inversión en tu futuro. Sin embargo, las <strong>deudas de consumo</strong> son el peor enemigo de tus finanzas personales.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Qué son?</h4>
        <p>Son deudas adquiridas para comprar cosas que pierden valor rápidamente: ropa, celulares de última generación, salidas a comer o viajes.</p>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">¿Por qué son peligrosas?</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Terminas pagando el doble del valor original debido a los altísimos intereses.</li>
          <li>Si no puedes pagar, dañas tu historial crediticio, cerrándote puertas importantes por años.</li>
          <li>Generan un estrés psicológico enorme que afectará tu rendimiento académico.</li>
        </ul>
        <h4 className="font-bold text-slate-800 mt-6 text-lg">La Regla de Oro:</h4>
        <p>Si quieres comprar un artículo de lujo y no tienes el dinero para comprarlo dos veces en efectivo, <strong>no te lo puedes permitir</strong>. ¡Ahorra primero, compra después!</p>
      </div>
    )
  }
];

export default function Hub() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedGuide, setSelectedGuide] = useState(null);

  const { data: challengesData = [], isLoading: loadingCh } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await api.get('/education/challenges/');
      return res.data;
    }
  });

  const startMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/education/challenges/${id}/start/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: '¡Reto Iniciado!', description: 'Mucho éxito completándolo.', variant: 'info' });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.post(`/education/challenges/${id}/complete/`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({ title: '¡Reto Completado!', description: `Has ganado +${data.points_earned} puntos.`, variant: 'success' });
    }
  });

  if (loadingCh) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  const activeChallenges = challengesData.filter(c => c.status === 'active');
  const pendingChallenges = challengesData.filter(c => c.status === 'pending');
  const completedChallenges = challengesData.filter(c => c.status === 'completed');

  const difficultyBadge = (d) => {
    const map = { facil: { label: 'Fácil', variant: 'success' }, medio: { label: 'Medio', variant: 'warning' }, dificil: { label: 'Difícil', variant: 'danger' } };
    const info = map[d] || map.facil;
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hub Educativo</h1>
        <p className="text-slate-500 text-sm mt-1">Mejora tus hábitos financieros y gana recompensas.</p>
      </div>

      {/* User Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3">
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-100"><Flame size={20} className="text-amber-500" /></div>
          <div><p className="text-sm sm:text-lg font-bold text-slate-800">{user?.streak || 0} días</p><p className="text-[10px] sm:text-[11px] text-slate-400">Racha activa</p></div>
        </Card>
        <Card className="p-3 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3">
          <div className="p-2 bg-violet-50 rounded-xl border border-violet-100"><Star size={20} className="text-violet-500" /></div>
          <div><p className="text-sm sm:text-lg font-bold text-slate-800">{user?.points || 0}</p><p className="text-[10px] sm:text-[11px] text-slate-400">Puntos</p></div>
        </Card>
        <Card className="p-3 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3">
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100"><Trophy size={20} className="text-blue-500" /></div>
          <div><p className="text-sm sm:text-lg font-bold text-slate-800">{completedChallenges.length}</p><p className="text-[10px] sm:text-[11px] text-slate-400">Completados</p></div>
        </Card>
      </div>

      {/* Simulator Banner */}
      <div
        onClick={() => navigate('/app/simulator')}
        className="relative bg-gradient-to-r from-brand-blue to-blue-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all group overflow-hidden gap-4"
      >
        {/* Decorative Overlays */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner shrink-0">
            <Calculator size={28} className="text-white hidden sm:block" />
            <Calculator size={20} className="text-white sm:hidden" />
          </div>
          <div>
            <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
              Simulador de Deuda
              <Sparkles size={16} className="text-brand-yellow sm:w-[18px] sm:h-[18px]" />
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-sm">
              Calcula el impacto real de pagar solo el mínimo en tu tarjeta de crédito.
            </p>
          </div>
        </div>
        <ChevronRight size={28} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10 hidden sm:block" />
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Retos Activos
            </h2>
            <Badge variant="info">{activeChallenges.length} en progreso</Badge>
          </div>
          <div className="space-y-3">
            {activeChallenges.map(ch => (
              <Card key={ch.id} className="p-4 border-l-4 border-l-blue-500" hover>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 rounded-full shrink-0">
                    <CheckCircle size={22} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{ch.challenge.title}</h4>
                      {difficultyBadge(ch.challenge.difficulty)}
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{ch.challenge.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>{ch.progress} de {ch.total}</span>
                          <span className="text-amber-600 font-semibold">+{ch.challenge.reward_points} pts al completar</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: ch.total }).map((_, i) => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${i < ch.progress ? 'bg-blue-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 italic">En progreso...</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Challenges */}
      <div>
        <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
          <Clock size={18} className="text-slate-400" /> Retos Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingChallenges.map(ch => (
            <Card key={ch.id} className="p-4 flex items-start gap-4" hover>
              <div className="p-2.5 bg-slate-100 rounded-full shrink-0">
                <Lock size={20} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-sm">{ch.challenge.title}</h4>
                  {difficultyBadge(ch.challenge.difficulty)}
                </div>
                <p className="text-slate-500 text-xs mt-1">{ch.challenge.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-600 text-xs font-semibold">+{ch.challenge.reward_points} pts</span>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => startMutation.mutate(ch.id)}
                    disabled={startMutation.isPending}
                  >
                    Iniciar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {pendingChallenges.length === 0 && (
            <div className="col-span-full p-6 text-center text-slate-400 text-sm border border-dashed rounded-xl">
              No hay más retos disponibles por ahora.
            </div>
          )}
        </div>
      </div>

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" /> Completados
          </h2>
          {completedChallenges.map(ch => (
            <Card key={ch.id} className="p-4 bg-blue-50/50 border-blue-200 flex items-center gap-4">
              <div className="p-2.5 bg-blue-100 rounded-full">
                <CheckCircle size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-800 text-sm">{ch.challenge.title}</h4>
                <p className="text-blue-600 text-xs">¡Completado! +{ch.challenge.reward_points} puntos ganados</p>
              </div>
              <Badge variant="success">✓ Hecho</Badge>
            </Card>
          ))}
        </div>
      )}

      {/* Guides */}
      <div>
        <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-blue-500" /> Guías Digitales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staticGuides.map(g => (
            <Card key={g.id} className="p-4 cursor-pointer group" hover>
              <div onClick={() => setSelectedGuide(g)}>
                <div className={`w-10 h-10 bg-${g.color}-100 text-${g.color}-600 rounded-xl flex items-center justify-center mb-3 text-sm font-bold group-hover:scale-105 transition-transform`}>
                  {g.id}
                </div>
                <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-2">{g.title}</h4>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{g.category}</Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> {g.read_time}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Guide Modal */}
      {selectedGuide && (
        <Modal isOpen={!!selectedGuide} onClose={() => setSelectedGuide(null)} title={selectedGuide.title}>
          <ModalBody>
            <div className="prose prose-sm prose-blue max-w-none">
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">{selectedGuide.category}</Badge>
                <Badge variant="info">{selectedGuide.read_time}</Badge>
              </div>
              <div className="mt-2 text-slate-600 leading-relaxed">
                {selectedGuide.content}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setSelectedGuide(null)}>Entendido</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
