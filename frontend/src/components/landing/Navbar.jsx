import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('access_token'));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Nosotros', href: '#about' },
    { name: 'Servicios', href: '#services' },
    { name: 'Contacto', href: '#contact' },
  ];

  return (
    <nav className={`fixed z-50 transition-all duration-500 ${
      isScrolled 
        ? 'top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/40 shadow-xl shadow-slate-900/5 py-3' 
        : 'top-0 left-0 w-full bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Branding Logo */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-blue to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/10 hover:scale-105 transition-all duration-300">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight transition-colors duration-300 group-hover:text-brand-blue">
              Edu<span className="text-brand-blue-light font-extrabold">Finanzas</span>
            </span>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-slate-600 hover:text-brand-blue font-semibold text-sm transition-all duration-300 hover:translate-y-[-1px] relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-blue after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
            <a 
              href={isAuthenticated ? "/app" : "/login"}
              className="bg-gradient-to-r from-brand-blue to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.03] transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-blue-955/15"
            >
              {isAuthenticated ? "Mi Dashboard" : "Empezar ahora"} <ChevronRight size={18} />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-700 hover:text-brand-blue hover:bg-white transition-all duration-300 shadow-sm cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-3xl p-5 animate-fade-in z-50">
          <div className="space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-base font-bold text-slate-700 hover:text-brand-blue hover:bg-blue-50/50 rounded-2xl transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <a 
                href={isAuthenticated ? "/app" : "/login"}
                className="w-full bg-gradient-to-r from-brand-blue to-blue-600 text-white py-3.5 rounded-2xl font-black text-center shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98]"
              >
                {isAuthenticated ? "Ir a mi Dashboard" : "Empezar ahora"} <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
