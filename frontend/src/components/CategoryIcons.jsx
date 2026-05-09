import {
  UtensilsCrossed, Bus, FileText, Gamepad2, BookOpen, Smartphone,
  HeartPulse, Banknote, Briefcase, GraduationCap, MapPin
} from 'lucide-react';

/**
 * Maps category IDs to their display info and lucide-react icon components.
 */
const iconMap = {
  alimentacion: { label: 'Alimentación', icon: UtensilsCrossed, color: 'text-amber-500', bg: 'bg-amber-50' },
  transporte:   { label: 'Transporte',   icon: Bus,              color: 'text-blue-500',  bg: 'bg-blue-50' },
  fotocopias:   { label: 'Fotocopias',   icon: FileText,         color: 'text-violet-500', bg: 'bg-violet-50' },
  entretenimiento: { label: 'Ocio',      icon: Gamepad2,         color: 'text-rose-500',  bg: 'bg-rose-50' },
  materiales:   { label: 'Materiales',   icon: BookOpen,         color: 'text-cyan-500',  bg: 'bg-cyan-50' },
  servicios:    { label: 'Servicios',    icon: Smartphone,       color: 'text-orange-500', bg: 'bg-orange-50' },
  salud:        { label: 'Salud',        icon: HeartPulse,       color: 'text-green-500', bg: 'bg-green-50' },
  mesada:       { label: 'Mesada',       icon: Banknote,         color: 'text-emerald-500', bg: 'bg-emerald-50' },
  trabajo:      { label: 'Trabajo',      icon: Briefcase,        color: 'text-indigo-500', bg: 'bg-indigo-50' },
  beca:         { label: 'Beca',         icon: GraduationCap,    color: 'text-teal-500',  bg: 'bg-teal-50' },
  otro:         { label: 'Otro',         icon: MapPin,           color: 'text-slate-500', bg: 'bg-slate-50' },
};

/**
 * Returns the category info object with icon component.
 * Usage: const { icon: Icon, label, color, bg } = getCategoryInfo('alimentacion');
 */
export function getCategoryInfo(categoryId) {
  return iconMap[categoryId] || iconMap.otro;
}

/**
 * Renders the icon for a category inside a colored circle.
 */
export function CategoryIcon({ categoryId, size = 16, className = '' }) {
  const info = getCategoryInfo(categoryId);
  const Icon = info.icon;
  return (
    <div className={`p-2 rounded-lg ${info.bg} ${className}`}>
      <Icon size={size} className={info.color} />
    </div>
  );
}

export default iconMap;
