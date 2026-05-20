import { useState, useMemo } from 'react';
import { Landmark, DollarSign, CalendarDays, BarChart3, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import SimulatorLayout from './SimulatorLayout';

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

export default function SimLoan() {
  const [amount, setAmount] = useState(5000000);
  const [rateEA, setRateEA] = useState(18);
  const [months, setMonths] = useState(24);
  const [showTable, setShowTable] = useState(false);

  const results = useMemo(() => {
    // Tasa E.A. → E.M.
    const rateEM = Math.pow(1 + rateEA / 100, 1 / 12) - 1;
    // Cuota fija (sistema francés)
    const quota = amount * (rateEM * Math.pow(1 + rateEM, months)) / (Math.pow(1 + rateEM, months) - 1);
    const totalPaid = quota * months;
    const totalInterest = totalPaid - amount;

    // Tabla de amortización (máximo 12 filas)
    const table = [];
    let balance = amount;
    for (let i = 1; i <= Math.min(12, months); i++) {
      const interest = balance * rateEM;
      const principal = quota - interest;
      balance = balance - principal;
      table.push({
        n: i,
        quota: Math.round(quota),
        interest: Math.round(interest),
        principal: Math.round(principal),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      quota: Math.round(quota),
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(totalInterest),
      overPercent: Math.round((totalInterest / amount) * 100),
      table,
    };
  }, [amount, rateEA, months]);

  return (
    <SimulatorLayout
      icon={Landmark}
      color="blue"
      title="Crédito de Libre Inversión"
      subtitle="Calcula tu cuota fija mensual y el costo total del préstamo."
      infoContent="Este simulador usa el sistema de amortización francés (cuota fija). La cuota mensual permanece constante, pero al inicio pagas más intereses y al final más capital. Compara siempre la tasa E.A. entre entidades financieras."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="pt-5 space-y-5">
              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={15} className="text-slate-400" /> Monto del préstamo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number" value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-lg font-semibold"
                  />
                </div>
                <input
                  type="range" min="500000" max="50000000" step="500000" value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$500.000</span><span>$50.000.000</span>
                </div>
              </div>

              {/* Tasa E.A. */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-slate-400" /> Tasa E.A. (%)
                </label>
                <input
                  type="number" step="0.5" value={rateEA}
                  onChange={e => setRateEA(Number(e.target.value))}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Libre inversión en Colombia: 18–28% E.A.</p>
              </div>

              {/* Plazo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-slate-400" /> Plazo ({months} meses)
                </label>
                <input
                  type="range" min="6" max="84" step="6" value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>6 meses</span><span>84 meses (7 años)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-5 bg-blue-50 border-blue-200">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1.5">
              <Lightbulb size={16} className="text-blue-600" /> Antes de pedir un crédito
            </h4>
            <ul className="space-y-1.5 text-blue-700 text-[11px]">
              <li>• Compara la Tasa E.A. entre bancos y cooperativas.</li>
              <li>• Pregunta por seguros y comisiones adicionales.</li>
              <li>• No pidas más de lo que necesitas.</li>
              <li>• La cuota no debe superar el 30% de tu ingreso.</li>
            </ul>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-slate-700 pb-3">
                <Landmark size={20} className="text-blue-400" />
                Resumen del Crédito
              </h3>

              {/* Cuota destacada */}
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-5 text-center mb-5">
                <p className="text-slate-300 text-sm mb-1">Tu cuota mensual fija</p>
                <p className="text-4xl font-bold text-brand-yellow">{fmt(results.quota)}</p>
                <p className="text-slate-400 text-[11px] mt-1">por {months} meses</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold">{fmt(amount)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Préstamo</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center border border-rose-500/20">
                  <p className="text-lg font-bold text-rose-400">{fmt(results.totalInterest)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Intereses</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-brand-yellow">{fmt(results.totalPaid)}</p>
                  <p className="text-slate-400 text-[11px] mt-1">Total a pagar</p>
                </div>
              </div>

              <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                <p className="text-rose-300 text-sm">
                  Pagarás <span className="font-bold text-rose-200">+{results.overPercent}%</span> sobre el valor prestado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de amortización */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <button
                onClick={() => setShowTable(!showTable)}
                className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <span>Tabla de amortización (primeras {Math.min(12, months)} cuotas)</span>
                {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showTable && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-[11px] text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                        <th className="py-2 text-left">#</th>
                        <th className="py-2 text-right">Cuota</th>
                        <th className="py-2 text-right">Interés</th>
                        <th className="py-2 text-right">Capital</th>
                        <th className="py-2 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.table.map((row) => (
                        <tr key={row.n} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 font-medium">{row.n}</td>
                          <td className="py-2 text-right">{fmt(row.quota)}</td>
                          <td className="py-2 text-right text-rose-500">{fmt(row.interest)}</td>
                          <td className="py-2 text-right text-emerald-600">{fmt(row.principal)}</td>
                          <td className="py-2 text-right font-semibold">{fmt(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {months > 12 && (
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                      Mostrando las primeras 12 de {months} cuotas.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SimulatorLayout>
  );
}
