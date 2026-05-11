import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';

const data = [
  { name: 'Interés en Orientación', value: 71.7, color: '#1e3a8a' },
  { name: 'Realizan Presupuesto', value: 58.7, color: '#facc15' },
  { name: 'Deuda sin Plan', value: 50.0, color: '#ef4444' },
];

const Stats = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-3">Antecedentes</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">La Realidad Financiera Universitaria</h3>
            <p className="text-lg text-slate-600 mb-8">
              A través de nuestras investigaciones, hemos identificado una problemática crítica que afecta el bienestar presente y futuro de los jóvenes.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Mal manejo del crédito</p>
                  <p className="text-sm text-slate-500">Uso impulsivo de tarjetas y préstamos sin capacidad de pago.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Falta de hábitos de ahorro</p>
                  <p className="text-sm text-slate-500">Inexistencia de un fondo de emergencia o metas de ahorro.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-blue-50 text-brand-blue p-2 rounded-lg">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Falta de control de gastos</p>
                  <p className="text-sm text-slate-500">Desconocimiento de a dónde se va el dinero mes a mes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner h-[450px]">
            <h4 className="text-center font-bold text-slate-700 mb-8">Estadísticas Clave (%)</h4>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={140}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
