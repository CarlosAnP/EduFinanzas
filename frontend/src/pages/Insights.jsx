import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Lightbulb, AlertTriangle, AlertCircle, TrendingUp, TrendingDown,
  Trophy, Target, ArrowUpRight, ArrowDownRight, Loader2, Sparkles,
  ChevronRight, Brain, BarChart3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { getCategoryInfo } from '../components/CategoryIcons';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const ALERT_STYLES = {
  danger:  { bg: 'bg-rose-50 border-rose-200',    icon: 'text-rose-500 bg-rose-100',    text: 'text-rose-900',  sub: 'text-rose-700',  badge: 'danger' },
  warning: { bg: 'bg-amber-50 border-amber-200',  icon: 'text-amber-500 bg-amber-100',  text: 'text-amber-900', sub: 'text-amber-700', badge: 'warning' },
  success: { bg: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-500 bg-emerald-100', text: 'text-emerald-900', sub: 'text-emerald-700', badge: 'success' },
  info:    { bg: 'bg-blue-50 border-blue-200',    icon: 'text-blue-500 bg-blue-100',    text: 'text-blue-900',  sub: 'text-blue-700',  badge: 'info' },
};

const ICON_MAP = {
  AlertTriangle, AlertCircle, TrendingUp, TrendingDown, Trophy, Target, Lightbulb
};

export default function Insights() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await api.get('/finance/insights/');
      return res.data;
    }
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  const { monthly_comparison, alerts, tip_of_the_day, savings_trend, top_expense_category } = data;

  return (
    <div className="space-y-10 animate-fade-in pb-10">

      {/* HERO BANNER */}
      <div className="relative rounded-[2rem] bg-gradient-to-r from-brand-blue to-indigo-700 text-white p-8 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain size={20} className="text-white" />
              </div>
              <span className="font-bold tracking-wider uppercase text-xs text-blue-100">Análisis Inteligente</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-sm">Insights</h1>
            <p className="text-blue-50 max-w-lg text-sm md:text-base leading-relaxed">
              Tu asistente financiero personal. Analiza tu comportamiento real, detecta patrones y te guía hacia mejores decisiones con datos concretos.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[110px]">
              <p className="text-3xl font-black">{savings_trend.current_month_rate}%</p>
              <p className="text-[11px] text-blue-100 uppercase tracking-wider mt-1">Ahorro {savings_trend.current_month_name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[110px]">
              <p className="text-3xl font-black">{alerts.length}</p>
              <p className="text-[11px] text-blue-100 uppercase tracking-wider mt-1">Alertas activas</p>
            </div>
          </div>
        </div>
      </div>

      {/* TIP OF THE DAY + SAVINGS TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tip */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-7 shadow-xl shadow-amber-500/20 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/30 rounded-xl">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-100">Consejo del día</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-3 drop-shadow-sm leading-tight">{tip_of_the_day.title}</h3>
            <p className="text-amber-50 text-sm md:text-base leading-relaxed font-medium">{tip_of_the_day.suggestion}</p>
          </div>
        </div>

        {/* Savings Trend */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 text-base">Tendencia de Ahorro</h3>
            <div className={`p-2 rounded-xl ${savings_trend.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {savings_trend.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-500">{savings_trend.current_month_name}</span>
                <span className="font-black text-slate-800">{savings_trend.current_month_rate}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${savings_trend.current_month_rate >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, savings_trend.current_month_rate))}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-400">{savings_trend.prev_month_name}</span>
                <span className="font-black text-slate-500">{savings_trend.prev_month_rate}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-300 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, savings_trend.prev_month_rate))}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 px-4 py-3 rounded-2xl flex items-center gap-3 ${savings_trend.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {savings_trend.trend === 'up'
              ? <><TrendingUp size={16} className="shrink-0" /> <span className="text-sm font-bold">Tu tasa de ahorro mejoró vs el mes pasado. ¡Excelente!</span></>
              : <><TrendingDown size={16} className="shrink-0" /> <span className="text-sm font-bold">Tu tasa de ahorro bajó. Revisa tus gastos del mes.</span></>
            }
          </div>
        </div>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle size={24} className="text-amber-500" />
            Alertas Personalizadas
            <Badge variant="warning" className="ml-2 font-bold">{alerts.length}</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, i) => {
              const styles = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
              const IconComp = ICON_MAP[alert.icon] || AlertCircle;
              return (
                <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${styles.bg} shadow-sm`}>
                  <div className={`p-2.5 rounded-xl shrink-0 ${styles.icon}`}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm mb-1 ${styles.text}`}>{alert.title}</p>
                    <p className={`text-sm leading-relaxed ${styles.sub}`}>{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-10 bg-emerald-50 rounded-3xl border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-emerald-500" />
          </div>
          <p className="text-emerald-800 font-bold text-lg">¡Todo bajo control!</p>
          <p className="text-emerald-600 text-sm mt-1">No tienes alertas activas. Tus finanzas están en buen estado.</p>
        </div>
      )}

      <div className="w-full h-px bg-slate-200/60"></div>

      {/* MONTHLY COMPARISON */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 size={24} className="text-brand-blue" />
          Comparación Mensual por Categoría
        </h2>

        {monthly_comparison.length > 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 hidden md:grid grid-cols-5 text-xs font-bold uppercase tracking-wider text-slate-400 gap-4">
              <span className="col-span-2">Categoría</span>
              <span className="text-right">Mes Actual</span>
              <span className="text-right">Mes Anterior</span>
              <span className="text-right">Diferencia</span>
            </div>

            <div className="divide-y divide-slate-50">
              {monthly_comparison.map((cat) => {
                const catInfo = getCategoryInfo(cat.category);
                const CatIcon = catInfo.icon;
                const isHigher = cat.diff > 0;
                const isNew = cat.prev === 0 && cat.current > 0;

                return (
                  <div key={cat.category} className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 p-5 hover:bg-slate-50/50 transition-colors items-center">
                    <div className="col-span-1 md:col-span-2 flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${catInfo.bgClass}`}>
                        <CatIcon size={20} className={catInfo.color} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{cat.name}</p>
                        {isNew && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Nuevo este mes</span>}
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="font-black text-slate-800">{fmt(cat.current)}</p>
                      <p className="text-[10px] text-slate-400 font-semibold md:hidden">Este mes</p>
                    </div>

                    <div className="md:text-right">
                      <p className="font-semibold text-slate-400">{cat.prev > 0 ? fmt(cat.prev) : '—'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold md:hidden">Mes anterior</p>
                    </div>

                    <div className="md:text-right flex md:justify-end items-center gap-2">
                      <span className={`font-black text-sm flex items-center gap-1 px-3 py-1.5 rounded-xl ${
                        isNew ? 'bg-blue-50 text-blue-600' :
                        isHigher ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {!isNew && (isHigher ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
                        {isNew ? 'Nuevo' : fmt(Math.abs(cat.diff))}
                      </span>
                      {!isNew && cat.pct_change !== null && (
                        <span className={`text-xs font-bold ${isHigher ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {isHigher ? '+' : ''}{cat.pct_change}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <BarChart3 size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No hay datos suficientes para comparar.</p>
            <p className="text-slate-400 text-sm mt-1">Registra transacciones en este mes y el anterior para ver el análisis.</p>
          </div>
        )}
      </div>

    </div>
  );
}
