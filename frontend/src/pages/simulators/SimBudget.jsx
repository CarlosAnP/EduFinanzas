import { useState, useMemo } from 'react';
import { PieChart, DollarSign, Lightbulb, Home, Smile, Coins, Info } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import SimulatorLayout from './SimulatorLayout';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const CATEGORIES = [
  {
    key: 'needs',
    label: 'Necesidades',
    percent: 50,
    color: 'bg-violet-500',
    softBg: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    icon: Home,
    desc: 'Arriendo, servicios, mercado, transporte, salud.',
    tip: 'Si superas el 50% en necesidades, revisa si hay gastos que puedas reducir.',
  },
  {
    key: 'wants',
    label: 'Deseos',
    percent: 30,
    color: 'bg-blue-400',
    softBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Smile,
    desc: 'Entretenimiento, restaurantes, ropa, suscripciones.',
    tip: 'Los deseos son válidos, pero limítalos al 30% para mantener equilibrio.',
  },
  {
    key: 'savings',
    label: 'Ahorro / Deudas',
    percent: 20,
    color: 'bg-emerald-500',
    softBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: Coins,
    desc: 'Ahorro, inversión, pago de deudas, fondo de emergencia.',
    tip: 'Este 20% es tu futuro. Automatiza el ahorro para no gastar lo que no ves.',
  },
];

export default function SimBudget() {
  const [income, setIncome] = useState(2500000);

  const results = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      amount: Math.round(income * (cat.percent / 100)),
    }));
  }, [income]);

  // Mini donut SVG (hacemos barras apiladas en su lugar — más simple y bonito)
  const barSegments = results.map((r, i) => ({
    ...r,
    widthPct: r.percent,
    offset: results.slice(0, i).reduce((a, c) => a + c.percent, 0),
  }));

  return (
    <SimulatorLayout
      icon={PieChart}
      color="purple"
      title="Presupuesto 50/30/20"
      subtitle="La regla de oro para distribuir tu ingreso mensual."
      infoContent="La regla 50/30/20, popularizada por la senadora Elizabeth Warren, propone destinar el 50% de tu ingreso neto a necesidades, el 30% a deseos y el 20% a ahorro o pago de deudas. Es un punto de partida simple y poderoso."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="pt-5 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-slate-400" /> Ingreso neto mensual
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={income}
                    onChange={e => setIncome(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-lg font-semibold"
                  />
                </div>
                <input
                  type="range" min="500000" max="20000000" step="100000" value={income}
                  onChange={e => setIncome(Number(e.target.value))}
                  className="w-full mt-2 accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$500.000</span><span>$20.000.000</span>
                </div>
                <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                  <p className="text-[11px] text-violet-600 flex items-start gap-1.5">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    Usa tu salario <strong>después de impuestos y deducciones</strong> (ingreso neto real).
                  </p>
                </div>
              </div>

              {/* Leyenda colores */}
              <div className="space-y-2">
                {results.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className={`flex items-center gap-3 p-3 rounded-xl border ${cat.softBg} ${cat.borderColor}`}>
                      <div className={`w-3 h-8 rounded-full ${cat.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon size={13} className={cat.textColor} />
                          <span className={`text-xs font-bold ${cat.textColor}`}>{cat.percent}% — {cat.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-violet-50 border-violet-200">
            <h4 className="font-bold text-violet-800 text-sm mb-2 flex items-center gap-1.5">
              <Lightbulb size={16} className="text-violet-600" /> Cómo aplicar la regla
            </h4>
            <ul className="space-y-1.5 text-violet-700 text-[11px]">
              <li>• Calcula tu salario neto (sin retenciones).</li>
              <li>• Primero separa el 20% de ahorro <strong>antes</strong> de gastar.</li>
              <li>• Registra tus gastos para comparar con los límites.</li>
              <li>• Ajusta los porcentajes según tu situación real.</li>
            </ul>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-slate-700 pb-3">
                <PieChart size={20} className="text-violet-400" />
                Tu Distribución Mensual
              </h3>

              {/* Ingreso total */}
              <div className="text-center mb-5">
                <p className="text-slate-400 text-sm">Ingreso neto mensual</p>
                <p className="text-4xl font-bold text-brand-yellow mt-1">{fmt(income)}</p>
              </div>

              {/* Barra visual apilada */}
              <div className="rounded-2xl overflow-hidden h-10 flex mb-5">
                {barSegments.map(seg => (
                  <div
                    key={seg.key}
                    className={`h-full ${seg.color} transition-all duration-500 flex items-center justify-center`}
                    style={{ width: `${seg.widthPct}%` }}
                    title={`${seg.label}: ${seg.percent}%`}
                  >
                    <span className="text-white text-xs font-bold drop-shadow">{seg.percent}%</span>
                  </div>
                ))}
              </div>

              {/* Cards por categoría */}
              <div className="space-y-3">
                {results.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="bg-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${cat.color}`}>
                            <Icon size={15} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{cat.percent}% — {cat.label}</p>
                            <p className="text-slate-400 text-[11px]">{cat.desc}</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-brand-yellow shrink-0">{fmt(cat.amount)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tips por categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {results.map(cat => (
              <Card key={cat.key} className={`p-4 ${cat.softBg} ${cat.borderColor}`}>
                <p className={`text-[11px] ${cat.textColor} leading-relaxed`}>
                  <span className="font-bold block mb-1">{cat.label}</span>
                  {cat.tip}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SimulatorLayout>
  );
}
