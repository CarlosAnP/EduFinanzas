import { useNavigate } from 'react-router-dom';
import {
  Calculator, ChevronRight, CheckCircle, BookOpen, Trophy,
  Flame, Star, Clock, Sparkles, ArrowRight, Lock, Zap
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Progress from '../components/ui/Progress';
import { challenges, guides, currentUser } from '../data/mockData';

export default function Hub() {
  const navigate = useNavigate();

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pendingChallenges = challenges.filter(c => c.status === 'pending');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

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
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-100"><Flame size={20} className="text-amber-500" /></div>
          <div><p className="text-lg font-bold text-slate-800">{currentUser.streak} días</p><p className="text-[11px] text-slate-400">Racha activa</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-xl border border-violet-100"><Star size={20} className="text-violet-500" /></div>
          <div><p className="text-lg font-bold text-slate-800">{currentUser.points}</p><p className="text-[11px] text-slate-400">Puntos</p></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100"><Trophy size={20} className="text-blue-500" /></div>
          <div><p className="text-lg font-bold text-slate-800">{completedChallenges.length}</p><p className="text-[11px] text-slate-400">Completados</p></div>
        </Card>
      </div>

      {/* Simulator Banner */}
      <div
        onClick={() => navigate('/simulator')}
        className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 text-white flex items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <Calculator size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Simulador de Deuda
              <Sparkles size={16} className="text-amber-400" />
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xs">
              Calcula el impacto real de pagar solo el mínimo en tu tarjeta de crédito.
            </p>
          </div>
        </div>
        <ChevronRight size={24} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Active Challenges */}
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
                    <h4 className="font-bold text-slate-800 text-sm">{ch.title}</h4>
                    {difficultyBadge(ch.difficulty)}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{ch.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{ch.progress}/{ch.total} completados</span>
                      <span className="text-amber-600 font-semibold">+{ch.rewardPoints} pts</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: ch.total }).map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < ch.progress ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

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
                  <h4 className="font-bold text-slate-800 text-sm">{ch.title}</h4>
                  {difficultyBadge(ch.difficulty)}
                </div>
                <p className="text-slate-500 text-xs mt-1">{ch.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-amber-600 text-xs font-semibold">+{ch.rewardPoints} pts</span>
                  <Button variant="success" size="sm">Iniciar</Button>
                </div>
              </div>
            </Card>
          ))}
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
                <h4 className="font-bold text-blue-800 text-sm">{ch.title}</h4>
                <p className="text-blue-600 text-xs">¡Completado! +{ch.rewardPoints} puntos ganados</p>
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
          {guides.map(g => (
            <Card key={g.id} className="p-4 cursor-pointer group" hover>
              <div className={`w-10 h-10 bg-${g.color}-100 text-${g.color}-600 rounded-xl flex items-center justify-center mb-3 text-sm font-bold group-hover:scale-105 transition-transform`}>
                {g.id}
              </div>
              <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-2">{g.title}</h4>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{g.category}</Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {g.readTime}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
