import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, BookOpen, LogOut, TrendingUp, Flame, Star, Loader2, Repeat, Calculator, Lightbulb, X, ChevronRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/app', icon: Home, label: 'Inicio' },
  { to: '/app/expenses', icon: Wallet, label: 'Gestión' },
  { to: '/app/subscriptions', icon: Repeat, label: 'Compromisos' },
  { to: '/app/hub', icon: BookOpen, label: 'Aprende' },
  { to: '/app/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/app/simulator', icon: Calculator, label: 'Simula' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile/');
      return response.data;
    },
    retry: 1,
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

  const initial1 = user.first_name ? user.first_name[0] : 'U';
  const initial2 = user.last_name ? user.last_name[0] : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-30">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">EduFinanzas</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Smart Money</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-brand-blue font-bold text-sm">
                {initial1}{initial2}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user.first_name || 'Usuario'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.career || 'Estudiante'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Flame size={12} />
                <span className="font-semibold">{user.streak}d</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-violet-600">
                <Star size={12} />
                <span className="font-semibold">{user.points} pts</span>
              </div>
            </div>
            
            {/* Badges Section */}
            {user.badges && user.badges.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                {user.badges.map(b => {
                  const badgeInfo = b.badge;
                  return (
                    <div 
                      key={b.id} 
                      className="p-1 rounded bg-amber-100 border border-amber-200 flex items-center justify-center cursor-help"
                      title={`${badgeInfo.name}: ${badgeInfo.description}`}
                    >
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-50 text-brand-blue shadow-sm shadow-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800">EduFinanzas</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="text-slate-400 p-1 mr-1">
            <LogOut size={16} />
          </button>
          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <Flame size={12} /><span className="font-semibold">{user.streak}</span>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-brand-blue font-bold text-xs">
            {initial1}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="p-4 md:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors
                ${isActive ? 'text-brand-blue' : 'text-slate-400'}`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
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
