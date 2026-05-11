import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <span className="text-3xl font-bold text-brand-blue tracking-tight mb-6 block">
              EDU<span className="text-brand-yellow">FINANZAS</span>
            </span>
            <p className="text-slate-500 max-w-sm mb-8 italic">
              "Aprende a manejar tu dinero, mejora tu vida."
            </p>
            <p className="text-slate-600 max-w-sm">
              Fortaleciendo la educación financiera en jóvenes universitarios mediante herramientas digitales y acompañamiento personalizado.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-widest">Plataforma</h4>
            <ul className="space-y-4">
              <li><a href="#home" className="text-slate-500 hover:text-brand-blue transition-colors">Inicio</a></li>
              <li><a href="#about" className="text-slate-500 hover:text-brand-blue transition-colors">Nosotros</a></li>
              <li><a href="#services" className="text-slate-500 hover:text-brand-blue transition-colors">Servicios</a></li>
              <li><a href="#contact" className="text-slate-500 hover:text-brand-blue transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-brand-blue transition-colors">Privacidad</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue transition-colors">Términos</a></li>
              <li><a href="#" className="text-slate-500 hover:text-brand-blue transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© 2026 EduFinanzas. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-blue">LinkedIn</a>
            <a href="#" className="hover:text-brand-blue">Twitter</a>
            <a href="#" className="hover:text-brand-blue">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
