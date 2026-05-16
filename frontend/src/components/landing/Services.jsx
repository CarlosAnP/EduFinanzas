import React, { useState } from 'react';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';
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
    details: 'Nuestros talleres presenciales y virtuales están diseñados específicamente para las necesidades de los estudiantes universitarios. Abordamos desde los fundamentos del dinero hasta temas avanzados como inversión. Aprenderás a leer extractos bancarios, entenderás las tasas de interés y saldrás con herramientas prácticas para el mundo real.',
    icon: Users,
    color: 'bg-blue-50',
    iconColor: 'text-brand-blue'
  },
  {
    title: 'Asesorías Personalizadas',
    description: 'Atención uno a uno para resolver dudas específicas y planificar tu futuro.',
    details: 'No hay dos situaciones financieras iguales. Agenda una cita de 45 minutos con nuestros asesores financieros (virtual o presencial) para revisar tus ingresos, gastos y deudas de forma confidencial. Te ayudaremos a trazar un plan de acción a tu medida, respetando tu estilo de vida y metas personales.',
    icon: MessageSquare,
    color: 'bg-yellow-50',
    iconColor: 'text-brand-yellow-dark'
  },
  {
    title: 'Presupuestos Personales',
    description: 'Herramientas para organizar tus ingresos y gastos de forma efectiva.',
    details: 'Te entregamos una plataforma web intuitiva para categorizar tus gastos e ingresos. Podrás establecer límites de dinero por categoría (comida, transporte, entretenimiento) y recibirás alertas automáticas cuando estés cerca de exceder tu límite. El control total de tu dinero empieza tomando conciencia de a dónde va.',
    icon: Calculator,
    color: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    title: 'Planes de Ahorro',
    description: 'Estrategias diseñadas para alcanzar tus metas de corto, mediano y largo plazo.',
    details: 'Ya sea que quieras comprar una computadora nueva, viajar de intercambio, o simplemente construir tu primer fondo de emergencia, te ayudamos a sistematizar tus ahorros. Define tu meta, la fecha límite, y nuestra plataforma te dirá exactamente cuánto debes guardar mes a mes, mostrándote el progreso en tiempo real.',
    icon: PiggyBank,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Orientación en Manejo de Deudas',
    description: 'Aprende a usar el crédito de forma responsable y salir de deudas.',
    details: '¿Estás pagando intereses muy altos por una tarjeta de crédito? Te enseñamos estrategias probadas como el método "Bola de Nieve" o "Avalancha" para liquidar tus deudas más rápido. Además, tendrás a tu disposición nuestro potente Simulador de Deuda para visualizar el impacto real de los intereses a lo largo del tiempo.',
    icon: CreditCard,
    color: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  {
    title: 'Retos Financieros Interactivos',
    description: 'Gamificación para poner a prueba tus conocimientos y ganar hábitos.',
    details: 'Transformamos la educación financiera aburrida en un juego estimulante. A través de nuestro "Hub Educativo", recibirás retos mensuales dinámicos. Completar misiones te hará ganar puntos, subir de nivel, obtener rachas diarias y desarrollar hábitos financieros sólidos que te servirán para toda la vida.',
    icon: Gamepad2,
    color: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Plataforma Inteligente',
    description: 'Tu control financiero siempre contigo con analíticas precisas.',
    details: 'Accede a todo tu panorama financiero desde cualquier dispositivo. Registra gastos en el instante en que ocurren, verifica si tienes presupuesto disponible antes de hacer un gasto importante, y recibe reportes y gráficas que te ayudarán a entender tu comportamiento económico de un solo vistazo.',
    icon: Smartphone,
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  }
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);

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
              
              <button 
                onClick={() => setSelectedService(service)}
                className="flex items-center gap-2 text-brand-blue font-bold group-hover:gap-3 transition-all cursor-pointer"
              >
                Saber más <ChevronRight size={18} />
              </button>
            </div>
          ))}

          {/* CTA Card */}
          <div className="bg-brand-blue p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center items-center text-center lg:col-span-1">
            <h4 className="text-2xl font-bold mb-4">¿Listo para empezar?</h4>
            <p className="text-blue-100 mb-8">Agenda hoy mismo tu primera asesoría totalmente personalizada.</p>
            <a href="#contact" className="w-full bg-brand-yellow text-slate-900 py-4 rounded-2xl font-bold hover:bg-white transition-colors flex items-center justify-center">
              Agendar Asesoría
            </a>
          </div>
        </div>
      </div>

      {selectedService && (
        <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)} title={selectedService.title}>
          <ModalBody>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className={`w-16 h-16 shrink-0 ${selectedService.color} ${selectedService.iconColor} rounded-2xl flex items-center justify-center`}>
                <selectedService.icon size={32} />
              </div>
              <p className="text-slate-600 font-medium italic">{selectedService.description}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-700 leading-relaxed text-sm">
                {selectedService.details}
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setSelectedService(null)}>Entendido</Button>
          </ModalFooter>
        </Modal>
      )}
    </section>
  );
};

export default Services;
