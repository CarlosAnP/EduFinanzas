import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, GraduationCap, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Simulated Validation
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Debes ingresar un correo institucional válido (.edu)');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    // Simulated Success
    toast({ title: '¡Bienvenido a EduFinanzas!', variant: 'success' });
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl opacity-60" />

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue text-white rounded-2xl mb-6 shadow-lg shadow-blue-200">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-brand-blue tracking-tight mb-2">
            EDU<span className="text-brand-yellow">FINANZAS</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            Portal Universitario
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-slide-up border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@universidad.edu"
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-blue focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-blue focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95"
          >
            Ingresar a mi portal <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            ¿Aún no tienes acceso? <a href="/#contact" className="text-brand-blue font-bold hover:underline">Contactar soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
