import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import {
  Calculator, ChevronRight, CheckCircle, BookOpen, Trophy,
  Flame, Star, Clock, Sparkles, Lock, Zap, Loader2, PlayCircle, BookMarked,
  Target, Zap as ZapIcon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';

const TRIGGER_LABELS = {
  register_transactions: 'Registra transacciones',
  daily_transaction: 'Transacción hoy',
  set_budget: 'Configura presupuesto',
  create_goal: 'Crea una meta',
  fund_goal: 'Aporta a una meta',
  complete_quiz: 'Completa un quiz',
  read_guide: 'Lee una guía',
  savings_rate_10: 'Ahorra 10% del mes',
  savings_rate_20: 'Ahorra 20% del mes',
  no_small_expenses_7: 'Sin gastos de ocio 7d',
  emergency_fund_100k: 'Fondo $100k+',
  add_subscription: 'Agrega suscripción',
  streak_3: 'Racha 3 días',
  streak_7: 'Racha 7 días',
  manual: 'Completar manualmente',
};


export default function Hub() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  const { data: challengesData = [], isLoading: loadingCh } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const res = await api.get('/education/challenges/');
      return res.data;
    }
  });

  const { data: guides = [], isLoading: loadingGuides } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const res = await api.get('/education/guides/');
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
      toast({ title: '¡Misión Iniciada!', description: 'Mucho éxito completándola.', variant: 'info' });
    }
  });

  const markGuideReadMutation = useMutation({
    mutationFn: async (guideId) => {
      const res = await api.post(`/education/guides/${guideId}/read/`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      if (data.completed_missions && data.completed_missions.length > 0) {
        data.completed_missions.forEach(m => {
          toast({ title: `🏆 ¡Misión completada!`, description: `"${m.title}" +${m.points} pts`, variant: 'success' });
        });
      }
    }
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/education/quizzes/${data.quizId}/submit/`, { answers: data.answers });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setQuizResult(data);
      if (data.passed) {
        toast({ title: '¡Quiz Aprobado!', description: `Has ganado +${data.points_earned} puntos.`, variant: 'success' });
        if (data.badge_earned) {
          toast({ title: '¡Insignia Desbloqueada!', description: `Has obtenido la insignia: ${data.badge_earned.name}`, variant: 'success' });
        }
        if (data.completed_missions) {
          data.completed_missions.forEach(m => {
            toast({ title: `🏆 ¡Misión completada!`, description: `"${m.title}" +${m.points} pts`, variant: 'success' });
          });
        }
      } else {
        toast({ title: 'Quiz Reprobado', description: `Obtuviste ${data.score}%. Intenta de nuevo.`, variant: 'error' });
      }
    }
  });

  if (loadingCh || loadingGuides) {
    return <div className="flex justify-center items-center h-[70vh]"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;
  }

  const activeChallenges = challengesData.filter(c => c.status === 'active');
  const pendingChallenges = challengesData.filter(c => c.status === 'pending');
  const completedChallenges = challengesData.filter(c => c.status === 'completed');

  const difficultyBadge = (d) => {
    const map = { facil: { label: 'Fácil', variant: 'success' }, medio: { label: 'Medio', variant: 'warning' }, dificil: { label: 'Difícil', variant: 'danger' } };
    const info = map[d] || map.facil;
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const colorMap = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20 text-white',
    violet: 'from-violet-500 to-fuchsia-600 shadow-violet-500/20 text-white',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/20 text-white',
    amber: 'from-amber-400 to-orange-500 shadow-amber-500/20 text-white',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-500/20 text-white',
    orange: 'from-orange-500 to-red-500 shadow-orange-500/20 text-white'
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-blue to-indigo-700 text-white p-8 md:p-10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <Badge variant="outline" className="border-white/20 text-blue-100 bg-white/10 mb-4 backdrop-blur-sm">
              <Sparkles size={12} className="inline mr-1" /> Academia Financiera
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-white drop-shadow-sm">
              Aprende, juega <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-amber-300">y conquista tus finanzas.</span>
            </h1>
            <p className="text-blue-50 text-sm md:text-base leading-relaxed">
              Completa retos interactivos, lee nuestras guías rápidas y domina el arte del dinero mientras construyes una vida universitaria libre de estrés financiero.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[100px]">
              <Flame size={24} className="mx-auto text-amber-400 mb-2" />
              <p className="text-2xl font-black">{user?.streak || 0}</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Días Racha</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[100px]">
              <Star size={24} className="mx-auto text-brand-yellow mb-2" />
              <p className="text-2xl font-black">{user?.points || 0}</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Puntos</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: GUIDES */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookMarked size={24} className="text-brand-blue" />
              Ruta de Aprendizaje
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {guides.map((g, index) => {
              const gradient = colorMap[g.color] || colorMap.blue;
              return (
                <div 
                  key={g.id} 
                  onClick={() => {
                    setSelectedGuide(g);
                    markGuideReadMutation.mutate(g.id);
                  }}
                  className="group relative bg-white rounded-3xl p-6 cursor-pointer border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 rounded-bl-[100px] transition-opacity`}></div>
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-xl font-black`}>
                      {index + 1}
                    </div>
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-medium">
                      <Clock size={10} className="inline mr-1" /> {g.read_time}
                    </Badge>
                  </div>
                  
                  <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-brand-blue transition-colors">{g.title}</h4>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{g.category}</span>
                    {g.quiz && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Zap size={10} /> Quiz
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulator Teaser */}
          <div 
            onClick={() => navigate('/app/simulator')}
            className="group relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 cursor-pointer mt-10"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-brand-blue/30 blur-3xl rounded-full"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center shadow-lg shadow-brand-blue/30">
                  <Calculator size={30} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Simulador de Deuda</h3>
                  <p className="text-slate-400 text-sm max-w-md">Descubre por qué pagar a más de 1 cuota con tarjeta de crédito destruye tu dinero.</p>
                </div>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 py-3 font-bold group-hover:scale-105 transition-transform shrink-0">
                Lanzar Simulador
              </Button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CHALLENGES */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              Misiones
              <Badge variant="warning" className="ml-auto font-black">{activeChallenges.length} activas</Badge>
            </h2>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Tabs header */}
              <div className="px-6 pt-5 pb-3 border-b border-slate-50 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {challengesData.length} misiones totales
                </span>
                <span className="ml-auto text-xs text-emerald-600 font-bold">
                  {completedChallenges.length} completadas
                </span>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto max-h-[72vh] p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {/* Active */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                En Progreso <Badge variant="info" className="ml-auto">{activeChallenges.length}</Badge>
              </h3>
              <div className="space-y-4">
                {activeChallenges.map(ch => {
                  const pct = ch.total > 0 ? Math.round((ch.progress / ch.total) * 100) : 0;
                  const triggerLabel = TRIGGER_LABELS[ch.challenge.trigger_type] || 'Completar';
                  return (
                    <div key={ch.id} className="relative pl-4 border-l-4 border-brand-blue group">
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5">{ch.challenge.title}</h4>
                      <p className="text-[10px] font-semibold text-blue-500 mb-2 uppercase tracking-wider">{triggerLabel}</p>
                      <div className="flex items-center justify-between text-xs mb-1.5 text-slate-500">
                        <span className="font-bold">{ch.progress} / {ch.total}</span>
                        <span className="text-amber-500 font-black flex items-center gap-1"><Star size={10} /> +{ch.challenge.reward_points} pts</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      </div>
                      {pct > 0 && pct < 100 && (
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{pct}% completado</p>
                      )}
                    </div>
                  );
                })}
                {activeChallenges.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No tienes misiones activas.</p>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Pending */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                Disponibles <Badge variant="outline" className="ml-auto">{pendingChallenges.length}</Badge>
              </h3>
              <div className="space-y-3">
                {pendingChallenges.map(ch => (
                  <div key={ch.id} className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                    <div className="mt-1">
                      <Lock size={16} className="text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-700 text-sm leading-tight mb-1">{ch.challenge.title}</h4>
                      <p className="text-amber-500 font-bold text-xs">+{ch.challenge.reward_points} pts</p>
                    </div>
                    <button 
                      onClick={() => startMutation.mutate(ch.id)}
                      disabled={startMutation.isPending}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50"
                      title="Iniciar Misión"
                    >
                      <PlayCircle size={18} />
                    </button>
                  </div>
                ))}
                {pendingChallenges.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No hay misiones nuevas.</p>
                )}
              </div>
            </div>

            {completedChallenges.length > 0 && (
              <>
                <div className="w-full h-px bg-slate-100"></div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
                    Completadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {completedChallenges.map(ch => (
                      <div key={ch.id} className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold flex items-center gap-1.5" title={ch.challenge.title}>
                        <CheckCircle size={12} />
                        <span className="truncate max-w-[100px]">{ch.challenge.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- GUIDE MODAL --- */}
      {selectedGuide && !showQuiz && (
        <Modal isOpen={!!selectedGuide} onClose={() => setSelectedGuide(null)} title={selectedGuide.title}>
          <ModalBody>
            <div className="prose prose-slate max-w-none">
              <div className="flex gap-2 mb-6 pb-4 border-b border-slate-100">
                <Badge variant="outline" className="bg-slate-50">{selectedGuide.category}</Badge>
                <Badge variant="info" className="bg-blue-50 text-blue-600">{selectedGuide.read_time}</Badge>
              </div>
              <div 
                className="mt-2 text-slate-700 leading-relaxed text-[15px] space-y-4"
                dangerouslySetInnerHTML={{
                  __html: selectedGuide.content
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            {selectedGuide.quiz && (
              <Button 
                onClick={() => setShowQuiz(true)} 
                className="bg-brand-yellow hover:bg-amber-400 text-slate-900 font-bold border-none"
              >
                Tomar Quiz (+{selectedGuide.quiz.reward_points} pts)
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedGuide(null)}>Cerrar</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* --- QUIZ MODAL --- */}
      {showQuiz && selectedGuide && selectedGuide.quiz && (
        <Modal isOpen={showQuiz} onClose={() => { setShowQuiz(false); setQuizResult(null); setQuizAnswers({}); }} title={selectedGuide.quiz.title}>
          <ModalBody>
            {!quizResult ? (
              <div className="space-y-8 py-2">
                {selectedGuide.quiz.questions.map((q, idx) => (
                  <div key={q.id}>
                    <p className="font-bold text-slate-800 text-base mb-3">{idx + 1}. {q.text}</p>
                    <div className="space-y-2.5">
                      {q.choices.map(c => {
                        const isSelected = quizAnswers[q.id] === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: c.id }))}
                            className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all select-none
                              ${isSelected
                                ? 'border-brand-blue bg-blue-50 shadow-sm'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                              ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-brand-blue font-bold' : 'text-slate-700'}`}>
                              {c.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${quizResult.passed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-rose-500/20'}`}>
                  {quizResult.passed ? <CheckCircle size={40} /> : <Zap size={40} />}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  {quizResult.passed ? '¡Felicidades!' : 'Sigue intentando'}
                </h3>
                <p className="text-slate-500 font-medium">
                  Respondiste correctamente {quizResult.correct_count} de {quizResult.total_questions} preguntas. ({Math.round(quizResult.score)}%)
                </p>
                {quizResult.passed && quizResult.badge_earned && (
                  <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-amber-200 via-brand-yellow to-amber-200 inline-block">
                    <div className="px-6 py-4 bg-white rounded-[14px] flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-500">
                        <Star size={24} className="fill-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">Insignia Desbloqueada</p>
                        <p className="font-black text-slate-800">{quizResult.badge_earned.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {!quizResult ? (
              <>
                <Button variant="outline" onClick={() => setShowQuiz(false)}>Volver a la lectura</Button>
                <Button 
                  onClick={() => submitQuizMutation.mutate({ quizId: selectedGuide.quiz.id, answers: quizAnswers })}
                  disabled={Object.keys(quizAnswers).length < selectedGuide.quiz.questions.length || submitQuizMutation.isPending}
                  className="bg-brand-blue hover:bg-blue-700 font-bold"
                >
                  {submitQuizMutation.isPending ? 'Enviando...' : 'Enviar Respuestas'}
                </Button>
              </>
            ) : (
              <Button onClick={() => { setShowQuiz(false); setSelectedGuide(null); setQuizResult(null); }}>
                Cerrar y Continuar
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
