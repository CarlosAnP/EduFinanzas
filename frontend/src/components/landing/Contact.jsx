import React from 'react';
import { Mail, Share2, Globe, Phone, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-blue rounded-[3rem] overflow-hidden shadow-2xl relative">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 p-12 opacity-5 text-white">
            <MessageCircle size={300} />
          </div>

          <div className="grid lg:grid-cols-2 gap-0">
            {/* Info Side */}
            <div className="p-12 lg:p-16 text-white">
              <h2 className="text-sm font-bold text-brand-yellow uppercase tracking-widest mb-3">Contacto</h2>
              <h3 className="text-4xl font-bold mb-8">¿Tienes alguna duda?<br/>Escríbenos.</h3>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Correo Empresarial</p>
                    <p className="font-bold text-lg">hola@edufinanzas.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">WhatsApp</p>
                    <p className="font-bold text-lg">+57 300 000 0000</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-yellow hover:text-brand-blue transition-all">
                  <Share2 size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-yellow hover:text-brand-blue transition-all">
                  <Globe size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-yellow hover:text-brand-blue transition-all">
                  <Send size={20} />
                </a>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white p-12 lg:p-16">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-blue focus:bg-white outline-none transition-all"
                    placeholder="Tu nombre aquí"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-blue focus:bg-white outline-none transition-all"
                    placeholder="email@universidad.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Mensaje</label>
                  <textarea 
                    rows="4"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-blue focus:bg-white outline-none transition-all resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                  ></textarea>
                </div>
                <button className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                  Enviar Mensaje <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
