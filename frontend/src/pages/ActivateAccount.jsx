import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, GraduationCap, ArrowRight } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'error'
  const [message, setMessage] = useState('Verificando y activando tu cuenta universitaria...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setMessage('Faltan parámetros de activación obligatorios en el enlace.');
      return;
    }

    const activateAccount = async () => {
      try {
        const response = await api.post('/users/auth/activate/', {
          uidb64: uid,
          token: token
        });

        const data = response.data;
        
        // Almacenar tokens devueltos para el autologin automático
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        setStatus('success');
        setMessage(data.detail || '¡Tu cuenta ha sido activada con éxito!');
        
        toast({
          title: '¡Cuenta activada!',
          description: 'Tu cuenta ha sido verificada exitosamente.',
          variant: 'success'
        });

      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail || 
          'El enlace de activación es inválido o ha expirado.'
        );
      }
    };

    // Un retraso intencional de 1.5s para simular una hermosa y premium transición de carga
    const timer = setTimeout(() => {
      activateAccount();
    }, 1500);

    return () => clearTimeout(timer);
  }, [uid, token, toast]);

  // Manejador para la cuenta regresiva en caso de éxito
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown === 0) {
      navigate('/onboarding');
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative font-sans overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-brand-yellow/10 rounded-full blur-[100px] animate-float opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] animate-float opacity-40" />

      {/* Brand Logo Header */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in z-10">
        <div className="w-12 h-12 bg-gradient-to-tr from-brand-blue to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 transition-transform duration-300">
          <GraduationCap size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-brand-blue tracking-tight leading-none">
            EDU<span className="text-brand-yellow">FINANZAS</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">
            Activación de Cuenta
          </p>
        </div>
      </div>

      {/* Glassmorphic Container Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden animate-slide-up z-10 text-center">
        
        {/* Subtle inner decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

        {/* State 1: CHECKING */}
        {status === 'checking' && (
          <div className="flex flex-col items-center py-6 animate-fade-in">
            <Loader2 className="animate-spin text-brand-blue h-16 w-16 stroke-[1.5] mb-6" />
            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-2">
              Verificando enlace...
            </h2>
            <p className="text-slate-500 text-xs font-semibold px-4">
              {message}
            </p>
          </div>
        )}

        {/* State 2: SUCCESS */}
        {status === 'success' && (
          <div className="flex flex-col items-center py-4 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-6 relative group">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
              <CheckCircle2 size={40} className="stroke-[2] relative z-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2">
              ¡Activación Exitosa!
            </h2>
            <p className="text-slate-500 text-xs font-semibold px-2 mb-8 leading-relaxed">
              {message}
            </p>

            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center mb-6">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Redireccionando automáticamente
              </span>
              <span className="text-2xl font-black text-brand-blue mt-1">
                {countdown}s
              </span>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-brand-blue text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-950/10 hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer group"
            >
              <span>Ir al Onboarding ahora</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}

        {/* State 3: ERROR */}
        {status === 'error' && (
          <div className="flex flex-col items-center py-4 animate-fade-in">
            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full text-red-500 flex items-center justify-center shadow-lg shadow-red-500/10 mb-6 relative">
              <XCircle size={40} className="stroke-[2]" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-2">
              Error de Activación
            </h2>
            <p className="text-slate-500 text-xs font-semibold px-4 mb-8 leading-relaxed">
              {message}
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-brand-blue to-blue-700 hover:from-blue-800 hover:to-brand-blue text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-950/10 hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default ActivateAccount;
