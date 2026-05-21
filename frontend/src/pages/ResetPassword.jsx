import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, GraduationCap, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uidb64 = searchParams.get('uid');
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const resetConfirmMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/auth/password-reset-confirm/', data);
      return response.data;
    },
    onSuccess: () => {
      toast({ 
        title: '¡Contraseña restablecida!', 
        description: 'Tu contraseña ha sido actualizada. Ya puedes iniciar sesión.', 
        variant: 'success' 
      });
      navigate('/login');
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'El enlace de recuperación es inválido, ha expirado o ya fue utilizado.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!uidb64 || !token) {
      setError('Faltan parámetros de recuperación válidos en la URL.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    resetConfirmMutation.mutate({ 
      uidb64, 
      token, 
      password, 
      confirm_password: confirmPassword 
    });
  };

  const isLoading = resetConfirmMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative font-sans overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-brand-yellow/10 rounded-full blur-[100px] animate-float opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] animate-float opacity-40" />

      {/* Brand logo header */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in z-10">
        <div className="w-12 h-12 bg-gradient-to-tr from-brand-blue to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform duration-300">
          <GraduationCap size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-brand-blue tracking-tight leading-none">
            EDU<span className="text-brand-yellow">FINANZAS</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">
            Restablecer Credenciales
          </p>
        </div>
      </div>

      {/* Auth Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden animate-slide-up z-10">
        
        {/* Subtle decoration inside card */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

        {/* Header Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            Nueva contraseña
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
            Ingresa tu nueva clave de acceso y confírmala para actualizar la seguridad de tu portal.
          </p>
        </div>

        {/* Error alerts */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-start gap-3 animate-slide-up border border-red-100 leading-normal">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Nueva Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Guidelines disclaimer */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-slate-600 text-[11px] font-medium leading-relaxed">
            <ShieldCheck className="text-brand-blue-light shrink-0 mt-0.5" size={16} />
            <div>
              Asegúrate de incluir una contraseña robusta de al menos <span className="font-bold text-slate-800">8 caracteres</span> que recuerdes fácilmente.
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-brand-blue text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-950/10 hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer group mt-4"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Guardando contraseña...</span>
              </div>
            ) : (
              <>
                <span>Guardar nueva contraseña</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        {/* Footnotes */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-brand-blue font-bold text-xs hover:underline cursor-pointer"
          >
            Volver al inicio de sesión
          </button>
        </div>

      </div>

    </div>
  );
};

export default ResetPassword;
