import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('access_token'));
  }, []);
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-brand-yellow/10 rounded-full blur-3xl opacity-60 animate-float" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-brand-blue text-sm font-semibold mb-6 border border-blue-100">
              <Zap size={16} className="text-brand-yellow" />
              <span>Nueva plataforma para universitarios</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Aprende a manejar tu <span className="text-brand-blue underline decoration-brand-yellow decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8">dinero</span>, mejora tu vida.
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed">
              La herramienta digital diseñada para que los jóvenes universitarios dominen sus finanzas, ahorren para sus metas y tomen el control de su futuro económico.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate('/app')}
                  className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Ir a mi Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <a 
                  href="#services"
                  className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
                >
                  Ver servicios
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              <a 
                href="#about"
                className="px-8 py-4 bg-white text-slate-800 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-brand-blue transition-all flex items-center justify-center"
              >
                Acerca de nosotros
              </a>
            </div>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={20} />
                <span className="text-sm font-medium">Seguro y transparente</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-brand-blue" size={20} />
                <span className="text-sm font-medium">Análisis inteligente</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in delay-200">
            {/* Main Illustration Placeholder/Mockup */}
            <div className="relative z-10 glass-card rounded-[2.5rem] p-4 p-8 overflow-hidden border-2 border-white/50 shadow-2xl">
              <div className="bg-brand-blue rounded-3xl p-8 text-white">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Balance Total</p>
                    <h3 className="text-3xl font-bold text-white">$1,240.50</h3>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                    <BarChart3 size={24} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-yellow w-2/3 rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-blue-100">Meta de Ahorro: Intercambio</span>
                    <span>65% completado</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                  <p className="text-xs text-slate-500 mb-1">Gastos Mes</p>
                  <p className="text-lg font-bold text-slate-800">$450.00</p>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 animate-float" style={{ animationDelay: '2.5s' }}>
                  <p className="text-xs text-slate-500 mb-1">Ahorro Mes</p>
                  <p className="text-lg font-bold text-brand-blue">+$200.00</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements around image */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-yellow rounded-3xl rotate-12 -z-0 opacity-50 blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-blue rounded-full -z-0 opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
