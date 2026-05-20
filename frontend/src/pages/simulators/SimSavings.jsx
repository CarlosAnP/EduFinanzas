import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, CalendarDays, Lightbulb, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import SimulatorLayout from './SimulatorLayout';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

export default function SimSavings() {
  const [monthly, setMonthly] = useState(200000);
  const [rateEA, setRateEA] = useState(8);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    // Convertir tasa E.A. a tasa mensual
    const rateEM = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
    const n = years * 12;

    // Valor futuro de anualidad vencida
    const futureValue = monthly * ((Math.pow(1 + rateEM, n) - 1) / rateEM);
    const totalSaved = monthly * n;
    const totalInterest = futureValue - totalSaved;

    // Puntos de la gráfica (por año)
    const chartPoints = [];
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      const fv = monthly * ((Math.pow(1 + rateEM, m) - 1) / rateEM);
      const saved = monthly * m;
      chartPoints.push({ year: y, fv, saved, interest: fv - saved });
    }

    return {
      futureValue: Math.round(futureValue),
      totalSaved: Math.round(totalSaved),
      totalInterest: Math.round(totalInterest),
      chartPoints,
      gainPercent: Math.round((totalInterest / totalSaved) * 100),
    };
  }, [monthly, rateEA, years]);

  const maxFV = results.chartPoints.length > 0 ? results.chartPoints[results.chartPoints.length - 1].fv : 1;

  return (
    <SimulatorLayout
      icon={TrendingUp}
      color="green"
      title="Ahorro con Interés Compuesto"
      subtitle="Visualiza el poder del interés compuesto en el tiempo."
      infoContent="El interés compuesto hace que tus intereses también generen intereses. Einstein lo llamó 'la octava maravilla del mundo'. Empieza a ahorrar hoy, aunque sea poco, y verás cómo crece con el tiempo."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="pt-5 space-y-5">
              {/* Ahorro mensual */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-slate-400" /> Ahorro mensual
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={monthly}
                    onChange={e => setMonthly(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-semibold"
                  />
                </div>
                <input
                  type="range" min="10000" max="2000000" step="10000" value={monthly}
                  onChange={e => setMonthly(Number(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$10.000</span><span>$2.000.000</span>
                </div>
              </div>

              {/* Tasa E.A. */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-slate-400" /> Tasa de rendimiento E.A. (%)
                </label>
                <input
                  type="number" step="0.5" value={rateEA}
                  onChange={e => setRateEA(Number(e.target.value))}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">CDT aprox. 10–12% E.A. · Acciones aprox. 8–15% E.A.</p>
              </div>

              {/* Años */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-slate-400" /> Plazo ({years} años)
                </label>
                <input
                  type="range" min="1" max="30" step="1" value={years}
                  onChange={e => setYears(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 año</span><span>30 años</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="p-5 bg-emerald-50 border-emerald-200">
            <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-1.5">
              <Lightbulb size={16} className="text-emerald-600" /> ¿Qué opciones tengo?
            </h4>
            <ul className="space-y-1.5 text-emerald-700 text-[11px]">
              <li>• <strong>CDT:</strong> 10–12% E.A. — seguro y rentable.</li>
              <li>• <strong>Fondos de inversión:</strong> 8–15% E.A. — mayor riesgo.</li>
              <li>• <strong>Cuenta de ahorro tradicional:</strong> ~3% E.A.</li>
              <li>• La clave: <strong>constancia</strong> más que el monto inicial.</li>
            </ul>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          {/* Resultados principales */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-slate-700 pb-3">
                <TrendingUp size={20} className="text-emerald-400" />
                Tu Futuro Financiero
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-yellow">{fmt(results.futureValue)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Capital final</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400">{fmt(results.totalSaved)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Total aportado</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-400">{fmt(results.totalInterest)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Intereses ganados</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-emerald-300 text-sm">
                  Tu dinero creció un{' '}
                  <span className="font-bold text-emerald-200 text-lg">+{results.gainPercent}%</span>{' '}
                  gracias al interés compuesto
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de barras */}
          <Card>
            <CardContent className="pt-5 pb-5">
              <h4 className="font-semibold text-slate-700 text-sm mb-4">Crecimiento por año</h4>
              <div className="space-y-2">
                {results.chartPoints.map((p) => (
                  <div key={p.year} className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 w-10 shrink-0">Año {p.year}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden relative">
                      {/* Barra aportado */}
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-300 rounded-full transition-all duration-500"
                        style={{ width: `${(p.saved / maxFV) * 100}%` }}
                      />
                      {/* Barra intereses (encima) */}
                      <div
                        className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full transition-all duration-500 opacity-80"
                        style={{ width: `${(p.fv / maxFV) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 w-28 text-right shrink-0">
                      {fmt(Math.round(p.fv))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-blue-300" /> Aportado
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" /> Con intereses
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimulatorLayout>
  );
}
