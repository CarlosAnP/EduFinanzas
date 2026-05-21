import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Wallet, BookOpen, LogOut, TrendingUp, Flame, Star, Loader2, Repeat, Calculator, Lightbulb, X, ChevronRight, Sparkles, Bell, CheckCheck, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/app', icon: Home, label: 'Inicio' },
  { to: '/app/expenses', icon: Wallet, label: 'Gestión' },
  { to: '/app/subscriptions', icon: Repeat, label: 'Compromisos' },
  { to: '/app/hub', icon: BookOpen, label: 'Aprende' },
  { to: '/app/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/app/simulator', icon: Calculator, label: 'Simula' },
  { to: '/app/profile', icon: User, label: 'Mi Perfil' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile/');
      return response.data;
    },
    retry: 1,
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/users/notifications/');
      return response.data;
    },
    refetchInterval: 15000, // Query every 15s to get real-time alerts!
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read);

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/users/notifications/${id}/read/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/users/notifications/read-all/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    }
  });

  useEffect(() => {
    if (isError || (!isLoading && !user)) {
      navigate('/login');
    }
  }, [isError, isLoading, user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
      </div>
    );
  }

  const renderNotificationBell = (isMobile) => {
    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative p-2 rounded-xl transition-all duration-300 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 ${
            showNotifications ? 'bg-slate-100 text-slate-600' : ''
          }`}
          title="Notificaciones"
        >
          <Bell size={isMobile ? 18 : 20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-rose-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm scale-110 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            {/* Click outside overlay */}
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => setShowNotifications(false)}
            />
            
            {/* Popover Card */}
            <div className={`absolute z-50 w-85 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-4.5 shadow-2xl shadow-slate-900/10 animate-fade-in text-left ${
              isMobile 
                ? 'top-14 right-[-40px] md:right-0' 
                : 'top-14 -left-2'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-800 text-sm">Notificaciones</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-50/80 text-brand-blue text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100/50">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllReadMutation.mutate();
                    }}
                    className="text-[10px] text-brand-blue hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck size={12} />
                    Marcar todo leído
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {unreadNotifications.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-3">
                      <Bell size={20} className="opacity-50" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold">¡Todo al día!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">No tienes alertas financieras pendientes.</p>
                  </div>
                ) : (
                  unreadNotifications.slice(0, 8).map((n) => {
                    const isWarning = n.type === 'warning';
                    const isError = n.type === 'error';
                    const isSuccess = n.type === 'success';
                    
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) {
                            markReadMutation.mutate(n.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden ${
                          !n.is_read 
                            ? 'bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border-blue-100/70 hover:from-blue-50/70 hover:to-indigo-50/40 cursor-pointer shadow-sm hover:shadow' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isError 
                              ? 'bg-rose-50 text-rose-500' 
                              : isWarning 
                                ? 'bg-amber-50 text-amber-500' 
                                : isSuccess 
                                  ? 'bg-emerald-50 text-emerald-500' 
                                  : 'bg-blue-50 text-brand-blue'
                          }`}>
                            {isError ? (
                              <ShieldAlert size={14} />
                            ) : isWarning ? (
                              <AlertTriangle size={14} />
                            ) : isSuccess ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Info size={14} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-bold truncate ${
                                !n.is_read ? 'text-slate-800' : 'text-slate-500'
                              }`}>
                                {n.title}
                              </p>
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 bg-brand-blue rounded-full shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[8px] text-slate-400 font-semibold block mt-1.5">
                              {new Date(n.date).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const initial1 = user.first_name ? user.first_name[0] : 'U';
  const initial2 = user.last_name ? user.last_name[0] : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/50 shadow-xl flex-col fixed h-full z-30">
        <div className="p-6 pb-4 border-b border-slate-100/60">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-blue to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 hover:scale-105 transition-all duration-300 cursor-pointer">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-800 tracking-tight transition-colors duration-200 group-hover:text-brand-blue">EduFinanzas</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Smart Pedagogy</p>
            </div>
            {renderNotificationBell(false)}
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4">
          <Link 
            to="/app/profile" 
            className="block bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 rounded-2xl p-3.5 shadow-sm hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-50 to-indigo-100 group-hover:from-brand-blue group-hover:to-blue-600 group-hover:text-white rounded-full flex items-center justify-center text-brand-blue font-black text-sm border-2 border-white shadow-sm transition-all duration-300">
                {initial1}{initial2}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 truncate group-hover:text-brand-blue transition-colors duration-200">{user.first_name || 'Usuario'}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">{user.career || 'Estudiante'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-600 bg-amber-50/70 border border-amber-100/50 px-2 py-1 rounded-full font-bold shadow-sm">
                <Flame size={12} className="fill-amber-500 text-amber-500 animate-pulse" />
                <span>{user.streak}d racha</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-violet-600 bg-violet-50/70 border border-violet-100/50 px-2 py-1 rounded-full font-bold shadow-sm">
                <Star size={12} className="fill-violet-500 text-violet-500" />
                <span>{user.points} pts</span>
              </div>
            </div>
            
            {/* Badges Section */}
            {user.badges && user.badges.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 justify-center">
                {user.badges.slice(0, 4).map(b => {
                  const badgeInfo = b.badge;
                  return (
                    <div 
                      key={b.id} 
                      className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center cursor-help hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-sm"
                      title={`${badgeInfo.name}: ${badgeInfo.description}`}
                    >
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                    </div>
                  );
                })}
                {user.badges.length > 4 && (
                  <div 
                    className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500"
                    title="Ver más insignias en tu perfil"
                  >
                    +{user.badges.length - 4}
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3.5 py-1 space-y-1.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50/40 text-brand-blue border-l-4 border-brand-blue shadow-[0_4px_12px_rgba(30,58,138,0.03)] scale-[1.01]'
                  : 'text-slate-500 hover:bg-slate-50/70 hover:text-slate-800 hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon 
                    size={18} 
                    className={`transition-all duration-300 
                      ${isActive 
                        ? 'text-brand-blue scale-110 rotate-3' 
                        : 'text-slate-400 group-hover:text-slate-700 group-hover:scale-115 group-hover:-rotate-3'
                      }`} 
                  />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(30,58,138,0.5)] animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100/60 bg-white/30 backdrop-blur-md">
          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 border border-transparent hover:border-rose-100/30 transition-all duration-300 cursor-pointer"
          >
            <LogOut size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/85 backdrop-blur-md border-b border-slate-200/40 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-gradient-to-tr from-brand-blue to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-slate-800 text-base tracking-tight">EduFinanzas</span>
        </div>
        <div className="flex items-center gap-2">
          {renderNotificationBell(true)}
          
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50/80 border border-amber-100/50 px-2.5 py-1 rounded-full">
            <Flame size={12} className="fill-amber-500 text-amber-500" />
            <span>{user.streak}d</span>
          </div>
          
          <Link 
            to="/app/profile" 
            className="w-8.5 h-8.5 bg-gradient-to-tr from-blue-50 to-indigo-100 hover:from-brand-blue hover:to-blue-600 hover:text-white rounded-full flex items-center justify-center text-brand-blue font-black text-xs border border-white shadow-sm cursor-pointer transition-all duration-300"
          >
            {initial1}{initial2}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8">
        <div className="p-4 md:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/55 flex justify-around py-2.5 z-30 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center relative py-1 px-2 rounded-xl transition-all duration-300 group
              ${isActive ? 'text-brand-blue scale-105' : 'text-slate-400 hover:text-slate-600'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-[8.5px] tracking-tight font-black transition-all mt-0.5 ${isActive ? 'text-brand-blue font-black' : 'text-slate-400 font-medium'}`}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1.5 h-1.5 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(30,58,138,0.6)] animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Floating Tip of the Day Widget */}
      <TipOfDayWidget />
    </div>
  );
}

function TipOfDayWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    const key = `tip_dismissed_${new Date().toDateString()}`;
    return localStorage.getItem(key) === 'true';
  });

  const { data } = useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await api.get('/finance/insights/');
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const tip = data?.tip_of_the_day;

  if (!tip || dismissed) return null;

  const handleDismiss = () => {
    const key = `tip_dismissed_${new Date().toDateString()}`;
    localStorage.setItem(key, 'true');
    setDismissed(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Expanded card */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 w-80 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 shadow-2xl shadow-amber-500/30 text-white p-6">
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer z-10"
            >
              <X size={14} />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/30 rounded-lg">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-amber-100">Consejo del Día</span>
              </div>

              <h4 className="font-black text-base leading-tight mb-2">{tip.title}</h4>
              <p className="text-amber-50 text-sm leading-relaxed font-medium mb-5">{tip.suggestion}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 text-xs font-bold text-amber-200 hover:text-white transition-colors cursor-pointer"
                >
                  No mostrar hoy
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Entendido ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-[5.5rem] md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer group
          ${isOpen
            ? 'bg-amber-500 shadow-amber-500/40 scale-95'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30 hover:scale-110 hover:shadow-amber-500/50'
          }`}
        title="Consejo del Día"
      >
        <Lightbulb size={24} className="text-white group-hover:animate-pulse" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
