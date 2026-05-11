import React from 'react';
import { Target, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

const AboutUs = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-3">Sobre Nosotros</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">¿Qué es EDUFINANZAS?</h3>
          <div className="w-20 h-1.5 bg-brand-yellow mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              EDUFINANZAS es una plataforma educativa diseñada específicamente para transformar la relación de los estudiantes universitarios con el dinero. No solo somos una herramienta digital, sino un acompañamiento integral en tu formación económica.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 p-6 rounded-2xl bg-blue-50/50 border border-blue-100 hover:shadow-md transition-shadow">
                <div className="bg-brand-blue text-white p-3 rounded-xl h-fit">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">El Problema</h4>
                  <p className="text-slate-600">La falta de educación financiera en la etapa universitaria lleva a deudas sin planificación, falta de ahorro y un manejo ineficiente de los primeros ingresos.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-2xl bg-yellow-50/50 border border-yellow-100 hover:shadow-md transition-shadow">
                <div className="bg-brand-yellow text-slate-900 p-3 rounded-xl h-fit">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Nuestra Solución</h4>
                  <p className="text-slate-600">Proporcionamos herramientas que facilitan la gestión de ingresos, gastos y metas de ahorro, fomentando hábitos responsables desde el primer día.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square rounded-[3rem] bg-slate-100 overflow-hidden shadow-2xl border-8 border-white">
              {/* Illustration or Image placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl h-32 animate-float" style={{ animationDelay: '0s' }} />
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl h-32 animate-float" style={{ animationDelay: '0.5s' }} />
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl h-32 animate-float" style={{ animationDelay: '1s' }} />
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl h-32 animate-float" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
            </div>
            {/* Stats Badge */}
            <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-3xl border-2 border-white shadow-xl animate-slide-up">
              <p className="text-brand-blue font-black text-4xl mb-1">71.7%</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter leading-none">Interés en orientación</p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-10 rounded-[2.5rem] bg-brand-blue text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Target size={120} />
            </div>
            <h4 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
              <Target className="text-brand-yellow" /> MISIÓN
            </h4>
            <p className="text-white/90 leading-relaxed relative z-10">
              Diseñar e implementar una estrategia de educación financiera dirigida a estudiantes universitarios, mediante el desarrollo de una herramienta digital de planificación que facilite la gestión de ingresos, gastos y metas de ahorro, promoviendo hábitos de administración responsable.
            </p>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-brand-yellow opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
              <Lightbulb size={120} />
            </div>
            <h4 className="text-2xl font-bold mb-4 flex items-center gap-3 text-brand-blue">
              <Lightbulb className="text-brand-yellow" /> VISIÓN
            </h4>
            <p className="text-slate-600 leading-relaxed relative z-10">
              Consolidarse como una propuesta innovadora de apoyo a la formación integral de los estudiantes universitarios, orientada al fortalecimiento de la cultura financiera dentro del ámbito académico y ser referente en diversas instituciones educativas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
