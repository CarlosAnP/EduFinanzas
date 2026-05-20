import { useNavigate } from 'react-router-dom';
import {
  CreditCard, TrendingUp, Landmark, ShieldCheck, PieChart,
  ArrowRight, Calculator, Sparkles, BookOpen
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

const simulators = [
  {
    id: 'debt',
    icon: CreditCard,
    title: 'Simulador de Deuda',
    description: 'Descubre cuánto terminas pagando si solo abonas el mínimo de tu tarjeta o crédito.',
    tag: 'Crédito',
    tagColor: 'bg-rose-100 text-rose-700',
    gradient: 'from-rose-500 to-rose-600',
    bgSoft: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'hover:ring-rose-300',
    iconBg: 'bg-rose-500',
    delay: '0ms',
  },
  {
    id: 'savings',
    icon: TrendingUp,
    title: 'Ahorro con Interés Compuesto',
    description: 'Visualiza cómo crece tu dinero mes a mes gracias al poder del interés compuesto.',
    tag: 'Ahorro',
    tagColor: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-500 to-emerald-600',
    bgSoft: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'hover:ring-emerald-300',
    iconBg: 'bg-emerald-500',
    delay: '80ms',
  },
  {
    id: 'loan',
    icon: Landmark,
    title: 'Crédito de Libre Inversión',
    description: 'Calcula tu cuota mensual fija, el total a pagar y ve tu tabla de amortización.',
    tag: 'Préstamo',
    tagColor: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-500 to-blue-600',
    bgSoft: 'bg-blue-50',
    border: 'border-blue-200',
    ring: 'hover:ring-blue-300',
    iconBg: 'bg-blue-500',
    delay: '160ms',
  },
  {
    id: 'emergency',
    icon: ShieldCheck,
    title: 'Fondo de Emergencia',
    description: 'Calcula en cuánto tiempo puedes construir tu colchón financiero de seguridad.',
    tag: 'Seguridad',
    tagColor: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-400 to-amber-500',
    bgSoft: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'hover:ring-amber-300',
    iconBg: 'bg-amber-500',
    delay: '240ms',
  },
  {
    id: 'budget',
    icon: PieChart,
    title: 'Presupuesto 50/30/20',
    description: 'Distribuye tu ingreso mensual según la regla de oro de las finanzas personales.',
    tag: 'Planificación',
    tagColor: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-500 to-violet-600',
    bgSoft: 'bg-violet-50',
    border: 'border-violet-200',
    ring: 'hover:ring-violet-300',
    iconBg: 'bg-violet-500',
    delay: '320ms',
  },
];

export default function SimulatorHub() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header — mismo estilo que Hub */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-blue to-indigo-700 text-white p-8 md:p-10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-0" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <Badge variant="outline" className="border-white/20 text-blue-100 bg-white/10 mb-4 backdrop-blur-sm">
              <Sparkles size={12} className="inline mr-1" /> Herramientas Financieras
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight text-white drop-shadow-sm">
              Simula antes de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-amber-300">
                decidir con dinero real.
              </span>
            </h1>
            <p className="text-blue-50 text-sm md:text-base leading-relaxed">
              Toma decisiones financieras inteligentes. Simula escenarios de ahorro, deuda y crédito
              antes de comprometerte. Conocimiento que se traduce en pesos.
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[100px]">
              <Calculator size={24} className="mx-auto text-brand-yellow mb-2" />
              <p className="text-2xl font-black">5</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Simuladores</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[100px]">
              <BookOpen size={24} className="mx-auto text-brand-yellow mb-2" />
              <p className="text-2xl font-black">COP</p>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Moneda</p>
            </div>
          </div>
        </div>
      </div>


      {/* Grid de Simuladores */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-4">Elige un simulador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulators.map((sim) => {
            const Icon = sim.icon;
            return (
              <button
                key={sim.id}
                onClick={() => navigate(`/app/simulator/${sim.id}`)}
                style={{ animationDelay: sim.delay }}
                className={`
                  group text-left w-full rounded-2xl border ${sim.border} ${sim.bgSoft}
                  p-5 transition-all duration-300 cursor-pointer
                  hover:shadow-lg hover:scale-[1.02] hover:ring-2 ${sim.ring}
                  animate-fade-in
                `}
              >
                {/* Icon + tag row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${sim.iconBg} shadow-md`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${sim.tagColor}`}>
                    {sim.tag}
                  </span>
                </div>

                {/* Text */}
                <h3 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-slate-900">
                  {sim.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  {sim.description}
                </p>

                {/* CTA */}
                <div className={`
                  flex items-center gap-1.5 text-xs font-semibold
                  bg-gradient-to-r ${sim.gradient} bg-clip-text text-transparent
                  group-hover:gap-2.5 transition-all duration-200
                `}>
                  Abrir simulador
                  <ArrowRight size={14} className={`text-current stroke-current group-hover:translate-x-0.5 transition-transform`}
                    style={{ color: 'currentColor' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer tip */}
      <div className="bg-slate-100 rounded-2xl px-6 py-4 flex items-center gap-3 border border-slate-200">
        <Sparkles size={18} className="text-brand-blue shrink-0" />
        <p className="text-slate-600 text-sm">
          <span className="font-semibold text-slate-800">Tip EduFinanzas:</span>{' '}
          Usa los simuladores para comparar escenarios antes de tomar cualquier decisión financiera.
          El conocimiento es tu mejor inversión.
        </p>
      </div>
    </div>
  );
}
