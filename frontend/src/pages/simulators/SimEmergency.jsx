import { useState, useMemo } from 'react';
import { ShieldCheck, DollarSign, CalendarDays, Target, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import SimulatorLayout from './SimulatorLayout';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const COVER_OPTIONS = [
  { value: 3, label: '3 meses', desc: 'Mínimo recomendado' },
  { value: 6, label: '6 meses', desc: 'Estándar ideal' },
  { value: 12, label: '12 meses', desc: 'Máxima seguridad' },
];

export default function SimEmergency() {
  const [expenses, setExpenses] = useState(1500000);
  const [cover, setCover] = useState(6);
  const [monthlySaving, setMonthlySaving] = useState(200000);
  const [currentSaved, setCurrentSaved] = useState(0);

  const results = useMemo(() => {
    const goal = expenses * cover;
    const remaining = Math.max(0, goal - currentSaved);
    const monthsNeeded = monthlySaving > 0 ? Math.ceil(remaining / monthlySaving) : Infinity;
    const progress = Math.min(100, Math.round((currentSaved / goal) * 100));
    const yearsNeeded = Math.floor(monthsNeeded / 12);
    const extraMonths = monthsNeeded % 12;

    return { goal, remaining, monthsNeeded, progress, yearsNeeded, extraMonths };
  }, [expenses, cover, monthlySaving, currentSaved]);

  const progressColor =
    results.progress < 25 ? 'bg-rose-500' :
    results.progress < 50 ? 'bg-amber-400' :
    results.progress < 75 ? 'bg-blue-500' :
    'bg-emerald-500';

  const timeText = results.monthsNeeded === Infinity
    ? '∞ — Necesitas ahorrar algo mensual'
    : results.yearsNeeded > 0
      ? `${results.yearsNeeded} año${results.yearsNeeded > 1 ? 's' : ''} y ${results.extraMonths} mes${results.extraMonths !== 1 ? 'es' : ''}`
      : `${results.monthsNeeded} mes${results.monthsNeeded !== 1 ? 'es' : ''}`;

  return (
    <SimulatorLayout
      icon={ShieldCheck}
      color="yellow"
      title="Fondo de Emergencia"
      subtitle="Calcula cuánto necesitas y en cuánto tiempo lo logras."
      infoContent="Un fondo de emergencia es dinero guardado para gastos imprevistos: pérdida de empleo, enfermedad, reparaciones urgentes. Debe cubrir entre 3 y 6 meses de tus gastos fijos y estar en una cuenta de fácil acceso."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="pt-5 space-y-5">
              {/* Gastos mensuales */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-slate-400" /> Gastos mensuales fijos
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={expenses}
                    onChange={e => setExpenses(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-lg font-semibold"
                  />
                </div>
                <input
                  type="range" min="200000" max="10000000" step="100000" value={expenses}
                  onChange={e => setExpenses(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-500"
                />
              </div>

              {/* Cobertura */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-slate-400" /> Meses de cobertura
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COVER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCover(opt.value)}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer
                        ${cover === opt.value
                          ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                          : 'border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                    >
                      <span className="text-sm font-bold">{opt.label}</span>
                      <span className="text-[10px] opacity-75 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ya tengo ahorrado */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Target size={15} className="text-slate-400" /> Ya tengo ahorrado
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={currentSaved}
                    onChange={e => setCurrentSaved(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Ahorro mensual disponible */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-slate-400" /> Puedo ahorrar por mes
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={monthlySaving}
                    onChange={e => setMonthlySaving(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none font-semibold"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-amber-50 border-amber-200">
            <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-1.5">
              <Lightbulb size={16} className="text-amber-600" /> Consejos
            </h4>
            <ul className="space-y-1.5 text-amber-700 text-[11px]">
              <li>• Guárdalo en una cuenta separada de tu cuenta corriente.</li>
              <li>• No lo uses para vacaciones ni caprichos.</li>
              <li>• CDT a corto plazo o cuenta de ahorro son ideales.</li>
              <li>• Automátiza el ahorro el día que llega tu sueldo.</li>
            </ul>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-slate-700 pb-3">
                <ShieldCheck size={20} className="text-amber-400" />
                Tu Escudo Financiero
              </h3>

              {/* Meta */}
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-2xl p-5 text-center mb-5">
                <p className="text-slate-300 text-sm mb-1">Tu meta de fondo de emergencia</p>
                <p className="text-4xl font-bold text-brand-yellow">{fmt(results.goal)}</p>
                <p className="text-slate-400 text-[11px] mt-1">{cover} meses × {fmt(expenses)}</p>
              </div>

              {/* Progreso */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-300">Progreso actual</span>
                  <span className="font-bold text-lg">{results.progress}%</span>
                </div>
                <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${progressColor} rounded-full transition-all duration-700`}
                    style={{ width: `${results.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>{fmt(currentSaved)} ahorrado</span>
                  <span>{fmt(results.remaining)} faltante</span>
                </div>
              </div>

              {/* Tiempo estimado */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <CalendarDays size={20} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-lg font-bold leading-tight">{timeText}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Tiempo estimado</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center border border-emerald-500/20">
                  <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-emerald-400">{fmt(monthlySaving)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Por mes</p>
                </div>
              </div>

              {results.progress >= 100 && (
                <div className="mt-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 text-center">
                  <p className="text-emerald-300 font-semibold text-sm">
                    🎉 ¡Ya tienes tu fondo de emergencia completo!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SimulatorLayout>
  );
}
