import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Calculator, 
  PiggyBank, 
  CreditCard, 
  Gamepad2, 
  Smartphone,
  ChevronRight
} from 'lucide-react';

const services = [
  {
    title: 'Talleres de Educación Financiera',
    description: 'Sesiones dinámicas grupales para aprender conceptos clave de economía personal.',
    icon: Users,
    color: 'bg-blue-50',
    iconColor: 'text-brand-blue'
  },
  {
    title: 'Asesorías Personalizadas',
    description: 'Atención uno a uno para resolver dudas específicas y planificar tu futuro.',
    icon: MessageSquare,
    color: 'bg-yellow-50',
    iconColor: 'text-brand-yellow-dark'
  },
  {
    title: 'Presupuestos Personales',
    description: 'Herramientas para organizar tus ingresos y gastos de forma efectiva.',
    icon: Calculator,
    color: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    title: 'Planes de Ahorro',
    description: 'Estrategias diseñadas para alcanzar tus metas de corto, mediano y largo plazo.',
    icon: PiggyBank,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Orientación en Manejo de Deudas',
    description: 'Aprende a usar el crédito de forma responsable y salir de deudas.',
    icon: CreditCard,
    color: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  {
    title: 'Retos Financieros Interactivos',
    description: 'Gamificación para poner a prueba tus conocimientos y ganar hábitos.',
    icon: Gamepad2,
    color: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Aplicación Móvil',
    description: 'Tu control financiero siempre contigo en la palma de tu mano.',
    icon: Smartphone,
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-3">Nuestro Portafolio</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Servicios para tu Crecimiento</h3>
          <div className="w-20 h-1.5 bg-brand-yellow mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className={`w-16 h-16 ${service.color} ${service.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>
              
              <h4 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-600 mb-8 flex-grow leading-relaxed">{service.description}</p>
              
              <button className="flex items-center gap-2 text-brand-blue font-bold group-hover:gap-3 transition-all">
                Saber más <ChevronRight size={18} />
              </button>
            </div>
          ))}

          {/* CTA Card */}
          <div className="bg-brand-blue p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center items-center text-center lg:col-span-1">
            <h4 className="text-2xl font-bold mb-4">¿Listo para empezar?</h4>
            <p className="text-blue-100 mb-8">Agenda hoy mismo tu primera asesoría totalmente personalizada.</p>
            <button className="w-full bg-brand-yellow text-slate-900 py-4 rounded-2xl font-bold hover:bg-white transition-colors">
              Agendar Asesoría
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
