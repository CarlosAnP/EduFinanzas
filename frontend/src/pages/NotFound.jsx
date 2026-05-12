import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="relative mb-8">
          <h1 className="text-9xl font-black text-brand-blue/10 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="w-24 h-24 text-brand-yellow animate-float" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-brand-blue mb-4">¡Página no encontrada!</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Lo sentimos, la página que estás buscando no existe o ha sido movida. 
          Verifica la URL o regresa al inicio.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button className="w-full sm:w-auto flex items-center gap-2">
              <Home className="w-4 h-4" />
              Regresar al Inicio
            </Button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-blue-light font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
