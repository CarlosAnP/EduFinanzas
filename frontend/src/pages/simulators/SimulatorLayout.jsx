import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';

export default function SimulatorLayout({ icon: Icon, title, subtitle, color, infoBg, infoText, infoContent, children }) {
  const navigate = useNavigate();

  const colorMap = {
    red:    { gradient: 'from-rose-600 to-rose-500',    badge: 'bg-rose-100 text-rose-700',   info: 'bg-rose-50 border-rose-200 text-rose-700', icon: 'text-rose-500' },
    green:  { gradient: 'from-emerald-600 to-emerald-500', badge: 'bg-emerald-100 text-emerald-700', info: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: 'text-emerald-500' },
    blue:   { gradient: 'from-blue-600 to-blue-500',    badge: 'bg-blue-100 text-blue-700',   info: 'bg-blue-50 border-blue-200 text-blue-700', icon: 'text-blue-500' },
    yellow: { gradient: 'from-amber-500 to-amber-400',  badge: 'bg-amber-100 text-amber-700', info: 'bg-amber-50 border-amber-200 text-amber-700', icon: 'text-amber-500' },
    purple: { gradient: 'from-violet-600 to-violet-500', badge: 'bg-violet-100 text-violet-700', info: 'bg-violet-50 border-violet-200 text-violet-700', icon: 'text-violet-500' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/app/simulator')}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition text-sm font-medium cursor-pointer group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        Volver a Simuladores
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-gradient-to-br ${c.gradient} rounded-2xl shadow-lg`}>
          <Icon size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>

      {/* Info educativa */}
      {infoContent && (
        <div className={`border p-4 rounded-xl flex items-start gap-3 ${c.info}`}>
          <Info size={18} className={`mt-0.5 shrink-0 ${c.icon}`} />
          <p className="text-xs leading-relaxed">{infoContent}</p>
        </div>
      )}

      {/* Contenido del simulador */}
      {children}
    </div>
  );
}
