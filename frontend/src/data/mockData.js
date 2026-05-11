export const currentUser = {
  id: 1,
  firstName: 'Carlos',
  lastName: 'Mendoza',
  email: 'carlos.mendoza@unal.edu.co',
  university: 'Universidad Nacional de Colombia',
  career: 'Ingeniería de Sistemas',
  semester: 6,
  streak: 12,
  points: 450,
};

export const financialSummary = {
  balance: 450000,
  totalIncome: 1200000,
  totalExpenses: 750000,
  savingsRate: 37.5,
  monthlyBudget: 1000000,
  budgetUsed: 750000,
};

export const transactions = [
  { id: 1, type: 'gasto', amount: 15000, category: 'fotocopias', description: 'Fotocopias Trabajo Final', date: '2026-05-05' },
  { id: 2, type: 'gasto', amount: 2950, category: 'transporte', description: 'Pasaje SITP ida y vuelta', date: '2026-05-05' },
  { id: 3, type: 'ingreso', amount: 200000, category: 'mesada', description: 'Mesada de papá', date: '2026-05-04' },
  { id: 4, type: 'gasto', amount: 12000, category: 'alimentacion', description: 'Almuerzo cafetería', date: '2026-05-04' },
  { id: 5, type: 'gasto', amount: 8500, category: 'alimentacion', description: 'Café y empanada', date: '2026-05-04' },
  { id: 6, type: 'gasto', amount: 45000, category: 'entretenimiento', description: 'Cine con amigos', date: '2026-05-03' },
  { id: 7, type: 'ingreso', amount: 500000, category: 'trabajo', description: 'Freelance diseño web', date: '2026-05-02' },
  { id: 8, type: 'gasto', amount: 25000, category: 'materiales', description: 'Cuadernos y esferos', date: '2026-05-02' },
  { id: 9, type: 'gasto', amount: 35000, category: 'salud', description: 'Medicamentos gripa', date: '2026-05-01' },
  { id: 10, type: 'ingreso', amount: 500000, category: 'beca', description: 'Beca semestral mayo', date: '2026-05-01' },
  { id: 11, type: 'gasto', amount: 18000, category: 'transporte', description: 'Uber universidad', date: '2026-04-30' },
  { id: 12, type: 'gasto', amount: 55000, category: 'servicios', description: 'Plan celular Claro', date: '2026-04-30' },
  { id: 13, type: 'gasto', amount: 30000, category: 'entretenimiento', description: 'Spotify + Netflix', date: '2026-04-29' },
  { id: 14, type: 'gasto', amount: 10000, category: 'alimentacion', description: 'Snacks tienda', date: '2026-04-29' },
  { id: 15, type: 'gasto', amount: 7500, category: 'fotocopias', description: 'Impresiones parcial', date: '2026-04-28' },
  { id: 16, type: 'ingreso', amount: 150000, category: 'trabajo', description: 'Tutoría de matemáticas', date: '2026-04-28' },
];

export const categories = [
  { id: 'alimentacion', name: 'Alimentación', spent: 150000, budget: 200000, color: 'amber' },
  { id: 'transporte', name: 'Transporte', spent: 85000, budget: 100000, color: 'blue' },
  { id: 'fotocopias', name: 'Fotocopias', spent: 22500, budget: 30000, color: 'violet' },
  { id: 'entretenimiento', name: 'Ocio', spent: 120000, budget: 100000, color: 'rose' },
  { id: 'materiales', name: 'Materiales', spent: 25000, budget: 50000, color: 'cyan' },
  { id: 'servicios', name: 'Servicios', spent: 55000, budget: 60000, color: 'orange' },
  { id: 'salud', name: 'Salud', spent: 35000, budget: 40000, color: 'green' },
];

export const savingsGoals = [
  { id: 1, title: 'Inscripción Semestre', description: 'Matrícula 2027-1', targetAmount: 1000000, currentAmount: 620000, deadline: '2026-12-15' },
  { id: 2, title: 'Portátil Nuevo', description: 'Lenovo ThinkPad', targetAmount: 3500000, currentAmount: 980000, deadline: '2027-06-01' },
  { id: 3, title: 'Fondo de Emergencia', description: '3 meses de gastos', targetAmount: 2000000, currentAmount: 450000, deadline: null },
];

export const challenges = [
  { id: 1, title: '3 días sin gastos hormiga', description: 'Evita compras pequeñas e innecesarias durante 3 días.', difficulty: 'facil', rewardPoints: 50, progress: 2, total: 3, status: 'active' },
  { id: 2, title: 'Modo Ahorro Activado', description: 'Ahorra el 10% de tu mesada esta semana.', difficulty: 'medio', rewardPoints: 100, progress: 0, total: 1, status: 'pending' },
  { id: 3, title: 'Registra todos tus gastos', description: 'Registra cada gasto durante 7 días seguidos.', difficulty: 'medio', rewardPoints: 80, progress: 5, total: 7, status: 'active' },
  { id: 4, title: 'Cocina en casa', description: 'Prepara tu almuerzo 5 días en vez de comprarlo.', difficulty: 'dificil', rewardPoints: 150, progress: 0, total: 5, status: 'pending' },
  { id: 5, title: 'Presupuesto Maestro', description: 'Crea y cumple tu presupuesto mensual completo.', difficulty: 'dificil', rewardPoints: 200, progress: 1, total: 1, status: 'completed' },
];

export const guides = [
  { id: 1, title: 'Cómo leer tu extracto bancario', category: 'Básico', readTime: '5 min', color: 'blue' },
  { id: 2, title: 'El peligro del pago mínimo', category: 'Deuda', readTime: '8 min', color: 'rose' },
  { id: 3, title: 'La regla 50/30/20', category: 'Presupuesto', readTime: '6 min', color: 'blue' },
  { id: 4, title: 'Cómo empezar a invertir siendo estudiante', category: 'Inversión', readTime: '10 min', color: 'violet' },
  { id: 5, title: 'Tarjetas de crédito: lo bueno y lo malo', category: 'Deuda', readTime: '7 min', color: 'amber' },
  { id: 6, title: 'Apps para controlar tus finanzas', category: 'Herramientas', readTime: '4 min', color: 'cyan' },
];

export const notifications = [
  { id: 1, type: 'warning', title: 'Alerta de Presupuesto', message: 'Has gastado el 120% de tu presupuesto en "Ocio" este mes.', date: '2026-05-05' },
  { id: 2, type: 'info', title: 'Reto casi completado', message: 'Te falta 1 día para completar "3 días sin gastos hormiga".', date: '2026-05-05' },
  { id: 3, type: 'success', title: '¡Meta alcanzada!', message: 'Completaste el reto "Presupuesto Maestro" y ganaste 200 pts.', date: '2026-05-04' },
];

export const monthlyData = [
  { month: 'Ene', ingresos: 800000, gastos: 650000 },
  { month: 'Feb', ingresos: 900000, gastos: 720000 },
  { month: 'Mar', ingresos: 1100000, gastos: 680000 },
  { month: 'Abr', ingresos: 950000, gastos: 810000 },
  { month: 'May', ingresos: 1200000, gastos: 750000 },
];



export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};
