import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ChevronRight, 
  GraduationCap, 
  AlertCircle, 
  User as UserIcon, 
  Sparkles, 
  LineChart, 
  Clock, 
  Trophy, 
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [isWaitingVerification, setIsWaitingVerification] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/auth/login/', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      toast({ title: '¡Bienvenido de nuevo!', variant: 'success' });
      navigate('/app');
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Credenciales inválidas o correo no registrado.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/auth/register/', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({ 
        title: '¡Registro exitoso!', 
        description: 'Por favor, revisa tu correo institucional para activar tu cuenta.', 
        variant: 'success' 
      });
      setIsWaitingVerification(true);
    },
    onError: (err) => {
      if (err.response?.data?.email) {
        setError(err.response.data.email[0]);
      } else if (err.response?.data?.password) {
        setError(err.response.data.password[0]);
      } else {
        setError('Ocurrió un error al registrarse. Intenta de nuevo.');
      }
    }
  });

  const resetRequestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/users/auth/password-reset/', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({ 
        title: '¡Enlace enviado!', 
        description: data.detail || 'Si tu correo existe, recibirás un mensaje.', 
        variant: 'success' 
      });
      setIsRequestingReset(false);
      setError('');
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Ocurrió un error al enviar el enlace. Intenta de nuevo.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('.edu') && !email.toLowerCase().endsWith('.edu.co')) {
      setError('Debes ingresar un correo institucional válido (.edu o .edu.co)');
      return;
    }

    if (isRequestingReset) {
      resetRequestMutation.mutate({ email });
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (isRegistering) {
      if (!firstName || !lastName) {
        setError('Por favor completa todos tus nombres y apellidos');
        return;
      }
      registerMutation.mutate({ email, password, first_name: firstName, last_name: lastName });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending || resetRequestMutation.isPending;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full font-sans bg-slate-50 overflow-hidden">
      
      {/* ================= LEFT SIDEBAR (Showcase & Info) ================= */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-blue via-slate-900 to-indigo-950 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        
        {/* Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-brand-yellow/10 rounded-full blur-[100px] animate-float opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] animate-float opacity-40" />
        <div className="absolute top-[40%] left-[30%] w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[90px] animate-float opacity-30" style={{ animationDelay: '1.5s' }} />

        {/* Top Section - Brand logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-brand-yellow to-yellow-500 text-slate-950 rounded-2xl shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform duration-300">
            <GraduationCap size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">
              EDU<span className="text-brand-yellow">FINANZAS</span>
            </h1>
            <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-widest mt-1">
              Copiloto Financiero
            </p>
          </div>
        </div>

        {/* Middle Section - Features Showcase */}
        <div className="relative z-10 my-auto py-8">
          <div className="mb-8">
            <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              ¿Qué es EduFinanzas?
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white mt-4 leading-tight">
              Toma el control de tu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-400 to-amber-300">
                futuro financiero estudiantil
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* Feature 1 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all hover:translate-x-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-brand-yellow flex items-center justify-center shrink-0 border border-yellow-500/20">
                <LineChart size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Simulaciones Inteligentes</h3>
                <p className="text-blue-100/70 text-xs mt-1 leading-relaxed">
                  Proyecta créditos universitarios y planes de pago con el método de amortización francés de manera interactiva.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all hover:translate-x-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Compromisos & Alertas</h3>
                <p className="text-blue-100/70 text-xs mt-1 leading-relaxed">
                  Organiza tus suscripciones y deudas pendientes con un panel de notificaciones que te alerta antes de vencer.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all hover:translate-x-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Racha y Gamificación</h3>
                <p className="text-blue-100/70 text-xs mt-1 leading-relaxed">
                  Consolida hábitos saludables, completa misiones, gana XP y desbloquea insignias que validan tus progresos.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/8 transition-all hover:translate-x-1 duration-300">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/20">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Insights Diarios</h3>
                <p className="text-blue-100/70 text-xs mt-1 leading-relaxed">
                  Monitorea la salud de tus finanzas mediante resúmenes dinámicos y consejos presupuestarios inteligentes.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section - Social Metrics */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
              <div className="text-lg font-black text-brand-yellow">+2,500</div>
              <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider mt-0.5">Alumnos</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
              <div className="text-lg font-black text-white">+15</div>
              <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider mt-0.5">Universidades</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
              <div className="text-lg font-black text-white">100%</div>
              <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider mt-0.5">Práctico</div>
            </div>
          </div>
          <p className="text-center text-xs text-blue-200/30 mt-4 italic font-medium">
            Diseñado para estudiantes por estudiantes universitarios.
          </p>
        </div>

      </div>

      {/* ================= RIGHT SIDEBAR (Credentials Form) ================= */}
      <div className="col-span-12 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative min-h-screen">
        
        {/* Responsive Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-8 animate-fade-in">
          <div className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap size={20} />
          </div>
          <h1 className="text-xl font-black text-brand-blue tracking-tight">
            EDU<span className="text-brand-yellow">FINANZAS</span>
          </h1>
        </div>

        {/* Auth Glassmorphic Card Container */}
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden animate-slide-up">
          
          {/* Subtle decoration inside card */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

          {/* Form Top Slider (Pill Tab Switcher) - Oculto si estamos pidiendo reset o esperando verificación */}
          {!isRequestingReset && !isWaitingVerification && (
            <div className="flex bg-slate-100/80 backdrop-blur-sm p-1 rounded-2xl mb-8 relative border border-slate-200/30">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                  !isRegistering 
                    ? 'text-brand-blue bg-white shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                  isRegistering 
                    ? 'text-brand-blue bg-white shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800 disabled:opacity-50'
                }`}
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Render 1: ESPERANDO VERIFICACIÓN DE CUENTA */}
          {isWaitingVerification ? (
            <div className="animate-fade-in text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 border border-blue-100 shadow-lg shadow-blue-500/10 mb-6 animate-pulse">
                <Mail size={36} className="stroke-[1.5]" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                ¡Activa tu cuenta!
              </h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
                Hemos enviado un enlace de verificación a tu correo institucional <strong className="text-brand-blue font-bold">{email}</strong>.
              </p>
              <div className="bg-blue-50/60 border border-blue-100/70 rounded-2xl p-4 text-blue-800 text-[11px] font-semibold leading-relaxed mb-8 text-left">
                <span className="font-bold text-brand-blue">Importante:</span> El enlace es de un solo uso. Si no encuentras el correo en unos minutos, por favor revisa tu carpeta de <strong>spam</strong> o correo no deseado.
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWaitingVerification(false);
                  setIsRegistering(false);
                  setEmail('');
                  setPassword('');
                  setFirstName('');
                  setLastName('');
                  setError('');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : isRequestingReset ? (
            <div className="animate-fade-in">
              {/* Header Title */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  Recuperar contraseña
                </h2>
                <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
                  Ingresa tu correo institucional registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
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
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Correo Institucional
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@universidad.edu.co"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
                    />
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
                      <span>Enviando enlace...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enviar enlace de recuperación</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>

              {/* Footnotes */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setIsRequestingReset(false); setError(''); }}
                  className="text-brand-blue font-bold text-xs hover:underline cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>

            </div>
          ) : (
            /* Render 2: FORMULARIO NORMAL (LOGIN O REGISTRO) */
            <div className="animate-fade-in">
              {/* Header Title */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  {isRegistering ? 'Crea tu cuenta universitaria' : '¡Hola de nuevo!'}
                </h2>
                <p className="text-slate-500 text-xs mt-1.5 font-medium leading-relaxed">
                  {isRegistering 
                    ? 'Regístrate con tu correo estudiantil para desbloquear herramientas personalizadas.' 
                    : 'Accede a tu panel y continúa con tu entrenamiento en inteligencia financiera.'
                  }
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
                
                {/* Register Columns (Name/Surname) */}
                {isRegistering && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nombres
                      </label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
                        <input 
                          type="text" 
                          required 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Carlos Andrés"
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Apellidos
                      </label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
                        <input 
                          type="text" 
                          required 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Pérez Gómez"
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Correo Institucional
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@universidad.edu.co"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue-light transition-colors" size={18} />
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-brand-blue-light focus:bg-white outline-none transition-all font-medium text-sm focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Link "¿Olvidaste tu contraseña?" para iniciar sesión */}
                {!isRegistering && (
                  <div className="flex justify-end text-xs font-semibold -mt-2">
                    <button
                      type="button"
                      onClick={() => { setIsRequestingReset(true); setError(''); }}
                      className="text-brand-blue hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                {/* Educational validation disclaimer when registering */}
                {isRegistering && (
                  <div className="bg-blue-50/60 border border-blue-100/70 rounded-2xl p-4 flex gap-3 text-blue-800 text-[11px] font-semibold leading-relaxed animate-slide-up">
                    <Sparkles className="text-brand-blue-light shrink-0 animate-pulse mt-0.5" size={16} />
                    <div>
                      <span className="font-bold text-brand-blue">Requisito del Portal:</span> Solo se admiten correos institucionales que finalicen en <code className="bg-blue-100 text-brand-blue px-1.5 py-0.5 rounded font-mono font-bold">.edu</code> o <code className="bg-blue-100 text-brand-blue px-1.5 py-0.5 rounded font-mono font-bold">.edu.co</code> para validar tu perfil académico de estudiante.
                    </div>
                  </div>
                )}

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
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <>
                      <span>{isRegistering ? 'Crear mi cuenta' : 'Ingresar a mi portal'}</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Secure lock footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-8 border-t border-slate-100 pt-6">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Tus datos están protegidos por encriptación segura</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
