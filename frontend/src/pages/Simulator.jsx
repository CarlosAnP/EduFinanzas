import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calculator, AlertTriangle, TrendingDown, Clock, DollarSign, Info, CreditCard, BarChart3, Banknote, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Simulator() {
  const navigate = useNavigate();
  const [debt, setDebt] = useState(1000000);
  const [rate, setRate] = useState(2.5);
  const [payment, setPayment] = useState(50000);

  const calculate = () => {
    let balance = debt;
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;

    if (payment <= balance * (rate / 100)) {
      return { months: null, totalInterest: null, totalPaid: null, infinite: true };
    }

    while (balance > 0 && months < 360) {
      const interest = balance * (rate / 100);
      totalInterest += interest;
      balance = balance + interest - payment;
      totalPaid += payment;
      months++;
    }

    if (balance > 0) return { months: null, totalInterest: null, totalPaid: null, infinite: true };

    return {
      months,
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(totalPaid),
      infinite: false,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
    };
  };

  const results = calculate();
  const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/hub')}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition text-sm font-medium cursor-pointer"
      >
        <ChevronLeft size={18} /> Volver al Hub
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-lg">
          <Calculator size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Simulador de Deuda</h1>
          <p className="text-slate-500 text-sm">Descubre cuánto terminas pagando si solo abonas el mínimo.</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-700 text-xs leading-relaxed">
          Este simulador te muestra el costo real de una deuda con pagos fijos mensuales.
          Ajusta los valores para ver diferentes escenarios y toma mejores decisiones financieras.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><CreditCard size={15} className="text-slate-400" /> Deuda actual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input type="number" value={debt} onChange={e => setDebt(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold" />
                </div>
                <input type="range" min="100000" max="10000000" step="100000" value={debt}
                  onChange={e => setDebt(Number(e.target.value))}
                  className="w-full mt-2 accent-blue-600" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>$100.000</span><span>$10.000.000</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><BarChart3 size={15} className="text-slate-400" /> Tasa E.M. (%)</label>
                <input type="number" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5"><Banknote size={15} className="text-slate-400" /> Cuota mensual</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="number" value={payment} onChange={e => setPayment(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips moved here for better balance in 2-column layout */}
          <Card className="p-5 bg-blue-50 border-blue-200">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1.5"><Lightbulb size={16} className="text-blue-600" /> Consejos Rápidos</h4>
            <ul className="space-y-1.5 text-blue-700 text-[11px]">
              <li>• Paga siempre más del mínimo.</li>
              <li>• Prioriza deudas con tasas altas.</li>
              <li>• Evita nuevas compras a crédito.</li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700 overflow-hidden h-full">
            <CardContent className="pt-6 pb-6 h-full flex flex-col">
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2 border-b border-slate-700 pb-3">
                <TrendingDown size={20} className="text-rose-400" />
                Impacto Real de tu Deuda
              </h3>

              {results.infinite ? (
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="p-5 bg-rose-500/20 rounded-xl border border-rose-500/30 text-center">
                    <AlertTriangle size={36} className="text-rose-400 mx-auto mb-3" />
                    <h4 className="font-bold text-rose-300 text-lg flex items-center justify-center gap-2">Deuda Infinita</h4>
                    <p className="text-rose-200 text-sm mt-2 leading-relaxed">
                      Tu cuota ({fmt(payment)}) no cubre los intereses ({fmt(Math.round(debt * rate / 100))}).
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                    <p className="text-slate-300 text-sm">
                      Paga al menos <span className="font-bold text-blue-400">{fmt(Math.ceil(debt * rate / 100) + 1000)}</span> para bajar la deuda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                      <Clock size={24} className="text-blue-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold">{results.years > 0 ? `${results.years}a ${results.remainingMonths}m` : `${results.months}m`}</p>
                      <p className="text-slate-400 text-xs mt-1 italic">Tiempo total</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-6 text-center border border-rose-500/20">
                      <DollarSign size={24} className="text-rose-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-rose-400">{fmt(results.totalInterest)}</p>
                      <p className="text-slate-400 text-xs mt-1 italic">Intereses totales</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-300 text-sm">Total a pagar:</span>
                      <span className="font-bold text-2xl text-brand-yellow">{fmt(results.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Costo financiero:</span>
                      <Badge variant="danger" className="text-sm px-4 py-1.5">
                        +{Math.round((results.totalInterest / debt) * 100)}% extra
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
